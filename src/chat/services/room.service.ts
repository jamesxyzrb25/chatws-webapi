import { Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Room } from "../entities/room.entity";
import { Any, Connection, Repository } from "typeorm";
import { TENANT_CONNECTION } from "src/main";
import { User } from "../entities/user.entity";

@Injectable()
export class RoomService {
    constructor(
        @InjectModel(Room.name) private readonly roomModel: Model<Room>,
        @InjectModel(User.name) private readonly userModel: Model<User>,
    ) {
    }

    async saveRoom(item: Room) {
        try {
            console.log("Entra a a post de room");
            console.log("Item es: ", item);
            return item._id
                ? this.roomModel.findByIdAndUpdate(item._id, item, { new: true })
                : this.roomModel.create(item);
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

    async getRoomsByUser(uid: string) {
        // Buscar el usuario por su ID para obtener sus notificaciones de sala
        console.log("Uid es : ", uid);
        const user = await this.userModel.findOne({ nickname: uid });

        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        // Array para almacenar los mensajes pendientes para el usuario
        const pendingMessages = [];
        // Iterar sobre las notificaciones de sala del usuario
        for (const notification of user.notifications) {
            // Buscar la sala por su ID para obtener sus mensajes pendientes
            const room = await this.roomModel.findById(notification.roomId).exec();

            if (room) {
                // Agregar los mensajes pendientes de la sala a la lista
                pendingMessages.push({
                    _id: room.id,
                    nameRoom: room.name,
                    descriptionRoom: room.descriptionRoom,
                    pendingMessages: notification.pendingMessages,
                    urlImageRoom: room.urlImageRoom
                    //urlImageRoom: "https://miniowebapi-dev.abexa.pe/api/Archivo/verImagen?NombreCarpeta=chat-files&NombreImagen=group_default_logo.png"
                });
            }
        }

        return pendingMessages;
    }
}