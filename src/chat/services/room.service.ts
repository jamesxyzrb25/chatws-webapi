import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Room } from "../entities/room.entity";

@Injectable()
export class RoomService {
    constructor(@InjectModel(Room.name) private readonly model: Model<Room>) { }

    async saveRoom(item: Room) {
        try {
            console.log("Entra a a post de room");
            console.log("Item es: ", item);
            return item._id
                ? this.model.findByIdAndUpdate(item._id, item, { new: true })
                : this.model.create(item);
        } catch (error) {
            console.log("Error al consultar modelos");
        }
    }

    async findRoomById(id: string) {
        try {
            return this.model.findById(id);
        } catch (error) {
            console.log("Error al consultar modelos");
        }
    }

    async findRoomByName(name: string){
        try{
            return this.model.findOne({name});
        }catch(error){
            console.log("Error al consultar modelos");
        }
    }

    async findQ(q:any) {
        try {
            if (q) return this.model.find({ name: { $regex: new RegExp(`.*${q}.*`) } });
            else return this.model.find();
        } catch (error) {
            console.log("Error al consultar modelos");
        }
    }
}