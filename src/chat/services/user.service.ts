import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "../entities/user.entity";
import { Model } from "mongoose";

@Injectable()
export class UserService{
    constructor(@InjectModel(User.name) private readonly userModel: Model<User>){}

    async findOne(where: any){
        try{
            return this.userModel.findOne(where);
        }catch(error){
            console.log("Error al consultar modelos");
        }
    }

    async saveUser(item:User){
        try{
            return item._id
            ? this.userModel.findByIdAndUpdate(item._id,item,{new:true})
            : this.userModel.create(item);
        }catch(error){
            console.log("Error al consultar modelos");
        }
    }

}