import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Room } from "../entities/room.entity";
import { Any, Connection, Repository } from "typeorm";
import { TENANT_CONNECTION } from "src/main";
import { User } from "../entities/user.entity";
import { OperationResult } from "src/interfaces/operation-result";
import { Message } from "../entities/message.entity";

@Injectable()
export class RoomService {
    constructor(
        @InjectModel(Room.name) private readonly roomModel: Model<Room>,
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(Message.name) private readonly messageModel: Model<Message>
    ) {
    }

    async saveRoom(item: Room) {
        try {
            console.log("Entra a a post de room");
            if(item._id){
                return this.roomModel.findByIdAndUpdate(item._id, item, { new: true })
            }else{
                item.createdAt = new Date();
                return this.roomModel.create(item);
            }
            /* console.log("Entra a a post de room");
            console.log("Item es: ", item);
            return item._id
                ? this.roomModel.findByIdAndUpdate(item._id, item, { new: true })
                : this.roomModel.create(item); */
        } catch (error) {
            console.log("Error al consultar modelos");
        }
    }

    async findRoomById(id: string) {
        try {
            return this.roomModel.findById(id);
        } catch (error) {
            console.log("Error al consultar modelos");
        }
    }

    async findRoomByName(name: string) {
        try {
            return this.roomModel.findOne({ name });
        } catch (error) {
            console.log("Error al consultar modelos");
        }
    }

    async findQ(q: any) {
        try {
            if (q) return this.roomModel.find({ name: { $regex: new RegExp(`.*${q}.*`) } });
            else return this.roomModel.find();
        } catch (error) {
            console.log("Error al consultar modelos");
        }
    }

    async getRoomsByUser(uid: string): Promise<OperationResult<any>> {
        const responseApi: OperationResult<any> = { isValid: false, exceptions: [], content: null };
        try {
            console.log("Uid es : ", uid);
            const user = await this.userModel.findOne({ nickname: uid });

            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            const responseRooms = [];
            for (const notification of user.notifications) {
                const room = await this.roomModel.findById(notification.roomId).exec();
                if (room) {
                    // Agregar los mensajes pendientes de la sala a la lista
                    responseRooms.push({
                        _id: room.id,
                        nameRoom: room.name,
                        descriptionRoom: room.descriptionRoom,
                        pendingMessages: notification.pendingMessages,
                        urlImageRoom: room.urlImageRoom
                        //urlImageRoom: "https://miniowebapi-dev.abexa.pe/api/Archivo/verImagen?NombreCarpeta=chat-files&NombreImagen=group_default_logo.png"
                    });
                }
            }
            responseApi.isValid = true;
            responseApi.content = responseRooms;
            return responseApi;
        } catch (error) {
            responseApi.exceptions.push({code:"E01",description:"Algo ocurrio. Vuelva a intentarlo."});
            return responseApi;
        }

    }

    async getMessagesByRoom(room: string):Promise<OperationResult<any>> {
        const responseApi: OperationResult<any> = { isValid: false, exceptions: [], content: null };
        try{
            const responseMessages = await this.messageModel.find({ room: room }).populate('owner','nickname').exec();
            responseApi.isValid= true;
            responseApi.content = responseMessages;
            return responseApi;
        }catch(error){
            responseApi.exceptions.push({code:"E01",description:"Algo ocurrio. Vuelva a intentarlo."});
            return responseApi;
        }
    }
}