import { Prop,Schema, SchemaFactory } from "@nestjs/mongoose";
import { Message } from "./message.entity";
import {ObjectId} from 'bson';
import {  Types } from "mongoose";
import { Room } from "./room.entity";

@Schema()
export class User {
  _id?: ObjectId | string;

  @Prop({required: true, maxlength: 20, minlength: 5})
  nickname: string;

  @Prop({required: true})
  clientId: string;

  //@Prop({type: [{type: Types.ObjectId, ref: 'Message'}]})
  //messages?: Message[];

  //@Prop({type: [{type: Types.ObjectId, ref: 'Room'}]})
  //joinedRooms?: Room[];
  
  @Prop({required: true})
  online: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User)