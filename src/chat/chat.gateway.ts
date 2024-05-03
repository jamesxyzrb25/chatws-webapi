import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';
import { User } from "./entities/user.entity";
import { Message } from "./entities/message.entity";
import { Room } from "./entities/room.entity";
import { MessageService } from "./services/message.service";
import { RoomService } from "./services/room.service";
import { AuthService } from "src/auth/auth.service";
import { UserService } from "./services/user.service";

@WebSocketGateway({ cors: '*:*' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

    constructor(@InjectModel(Message.name) private readonly messagesModel: Model<Message>,
        @InjectModel(Room.name) private readonly roomsModel: Model<Room>,
        @InjectModel(User.name) private readonly usersModel: Model<User>,
        private readonly messageService: MessageService,
        private readonly roomService: RoomService,
        private readonly userService: UserService,
        private readonly authService: AuthService) {
    }

    @WebSocketServer()
    server: Server;

    async handleConnection(socket: Socket) {
        console.log("entra a handleConnection");
        const { name, token } = socket.handshake.auth;
        console.log({ name, token });

        const userExist = await this.authService.validateUser(name);
        /* if(!name){
          socket.disconnect();
          return;
        } */
        if (userExist == null) {
            console.log("No se encontró el usuario. No podra usar el chat");
            socket.disconnect();
            return;
        }

        let user = await this.userService.findOne({ nickname: name });
        if (!user) {
            let notifications = [];
            const rooms = await this.roomsModel.find();
            for(const room of rooms){
                notifications.push({
                    roomId: room.id,
                    pendingMessages:0
                })
            }
            user = await this.userService.saveUser({
                nickname: name,
                clientId: socket.id,
                createdAt: new Date(),
                online: true,
                notifications: notifications
            });
        } else {
            user.clientId = socket.id;
            user.online = true;
            user.lastseen = null;
            user = await this.userService.saveUser(user);
        }

        this.server.emit('users-changed', { user: user.nickname, event: 'joined' });
    }

    async handleDisconnect(client: Socket) {
        console.log("entra a handleDisconnect");
        const user = await this.usersModel.findOne({ clientId: client.id });
        if (user) {
            this.server.emit('users-changed', { user: user.nickname, event: 'left' });
            user.clientId = null;
            user.online = false;
            user.lastseen = new Date();
            console.log("Usuario desconectado: ", user);
            await this.usersModel.findByIdAndUpdate(user._id, user);
        }
    }

    @SubscribeMessage('join-room')
    async enterChatRoom(client: Socket, data: { nickname: string, roomId: string }) {
        console.log({ data })
        let user = await this.usersModel.findOne({ nickname: data.nickname });
        if (!user) {
            console.log("No se encontró el usuario. No podra unirse a una sala");
            client.disconnect();
            return;
            //user = await this.usersModel.create({ nickname: data.nickname, clientId: client.id });
        } else {
            user.clientId = client.id;
            user = await this.usersModel.findByIdAndUpdate(user._id, user, { new: true });
        }
        const response = await this.messageService.find({ room: data.roomId })
        const responseRoom = await this.roomService.findRoomByName(data.roomId);
        await this.roomsModel.findByIdAndUpdate(
            responseRoom._id,
            { $addToSet: { connectedUsers: user._id } },
            { new: true }
        )
        const existRoomNot = user.notifications.find((userNotif) => userNotif.roomId == responseRoom.id);
        if (existRoomNot) {
            existRoomNot.pendingMessages = 0;
        }

        await this.userService.saveUser(user);
        client.emit('room-messages', data.roomId);
        client.join(data.roomId);
    }

    @SubscribeMessage('leave-room')
    async leaveChatRoom(client: Socket, data: { nickname: string, roomId: string }) {
        const user = await this.usersModel.findOne({ nickname: data.nickname });
        const responseRoom = await this.roomService.findRoomByName(data.roomId);
        const matchingConnUser = responseRoom.connectedUsers.find(connUser => user.id === connUser._id.toString());
        console.log("Filter user conn: ", matchingConnUser);
        if (matchingConnUser) {
            await this.roomsModel.findByIdAndUpdate(
                responseRoom._id,
                { $pull: { connectedUsers: user._id } },
                { new: true }
            )
        }

        client.leave(data.roomId);
    }

    @SubscribeMessage('send-message')
    async addMessage(client: Socket, message: Message) {
        console.log("Entra a send-message de gateway");
        console.log({ message })
        const userResponse = await this.usersModel.findOne({ clientId: client.id });
        if (message.media) {
            message.media.path = `${process.env.URL_MINIOWEBAPI}/api/Archivo/verImagen?NombreCarpeta=chat-files&NombreImagen=${message.media.original_name}`;
        }

        message.owner = userResponse;
        message.createdAt = new Date();

        message = await this.messagesModel.create(message);
        const responseRoom = await this.roomService.findRoomByName(message.room.toString());

        await this.roomsModel.findByIdAndUpdate(
            responseRoom._id,
            { $addToSet: { messages: message._id } },
            { new: true }
        )
        const users = await this.usersModel.find();
        console.log(responseRoom.connectedUsers);
        users.forEach(async (user) => {
            if (user._id.toString() != userResponse.id) {
                const existNotificationRoom = user.notifications.find(notif => notif.roomId === responseRoom.id);
                if (existNotificationRoom) {
                    existNotificationRoom.pendingMessages++;
                } else {
                    user.notifications.push({ roomId: responseRoom.id, pendingMessages: 1 });
                }
                /* await this.usersModel.findByIdAndUpdate(
                    user._id,
                    {$addToSet: {notifications:{ roomId: responseRoom.id, pendingMessages: 2}}},
                    {new: true}
                ) */
                await this.userService.saveUser(user);
            }
        })
        this.server.in(message.room as string).emit('message-received', message);
    }


}