import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Message } from "../entities/message.entity";

@Injectable()
export class MessageService{
    constructor(@InjectModel(Message.name) private readonly model: Model<Message>) { }

    async find(where: any){
        try{
            return this.model.find(where).populate('owner').exec();
        }catch(error){
            console.log("Error al consultar modelos");
        }
       
        //where = JSON.parse(where || '{}');
        //return this.model.find(where).populate('owner').exec();
    }

    
}