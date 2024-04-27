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


@WebSocketGateway({ cors: '*:*' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

    constructor(@InjectModel(Message.name) private readonly messagesModel: Model<Message>,
        @InjectModel(Room.name) private readonly roomsModel: Model<Room>,
        @InjectModel(User.name) private readonly usersModel: Model<User>,
        private readonly messageService: MessageService,
        private readonly roomService: RoomService,
        private readonly authService: AuthService ) {
    }

    @WebSocketServer()
    server: Server;

    async handleConnection(socket: Socket) {
        console.log("entra a handleConnection");
        const {name, token} = socket.handshake.auth;
      console.log({name, token});

      const userExist = await this.authService.validateUser(name);
      /* if(!name){
        socket.disconnect();
        return;
      } */
      if(userExist == null){
        console.log("No se encontró el usuario. No podra usar el chat");
        socket.disconnect();
        return;
      }
        //const user = await this.usersModel.findOne({ clientId: socket.id });
        let user = await this.usersModel.findOne({ nickname: name });
        if (!user) {
            user = await this.usersModel.create({ nickname: name, clientId: socket.id, online:true });
        } else {
            user.clientId = socket.id;
            user.online = true;
            user = await this.usersModel.findByIdAndUpdate(user._id, user, { new: true });
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
            console.log("Usuario desconectado: ", user);
            await this.usersModel.findByIdAndUpdate(user._id, user);
        }
    }

    @SubscribeMessage('join-room')
    async enterChatRoom(client: Socket, data: { nickname: string, roomId: string }) {
        console.log({ data })
        let user = await this.usersModel.findOne({ nickname: data.nickname });
        if (!user) {
            user = await this.usersModel.create({ nickname: data.nickname, clientId: client.id });
        } else {
            user.clientId = client.id;
            user = await this.usersModel.findByIdAndUpdate(user._id, user, { new: true });
        }
        const response = await this.messageService.find({ room: data.roomId })

        client.emit('room-messages', response);
        const responseRoom = await this.roomService.findRoomByName(data.roomId);
        const updateRoom = await this.roomsModel.findByIdAndUpdate(
            responseRoom._id,
            { $addToSet: { connectedUsers: user._id } },
            { new: true }
        )

        client.join(data.roomId);
        
    }

    @SubscribeMessage('leave-room')
    async leaveChatRoom(client: Socket, data: { nickname: string, roomId: string }) {
        const user = await this.usersModel.findOne({ nickname: data.nickname });

        //client.broadcast.to(data.roomId).emit('users-changed', { user: user.nickname, event: 'left' });
        const responseRoom = await this.roomService.findRoomByName(data.roomId);

        const matchingConnUser = responseRoom.connectedUsers.find(connUser => user.id === connUser._id.toString());
        console.log("Filter user conn: ", matchingConnUser);
        if (matchingConnUser) {
            const updateRoom = await this.roomsModel.findByIdAndUpdate(
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
        message.owner = await this.usersModel.findOne({ clientId: client.id });
        message.created = new Date();
        message = await this.messagesModel.create(message);
        const responseRoom = await this.roomService.findRoomByName(message.room.toString());

        const updateRoom = await this.roomsModel.findByIdAndUpdate(
            responseRoom._id,
            { $addToSet: { messages: message._id } },
            { new: true }
        )

        this.server.in(message.room as string).emit('message-received', message);
    }


}