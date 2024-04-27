import { Types } from "mongoose";
import {ObjectId} from 'bson';
import {Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Room } from "./room.entity";
import { User } from "./user.entity";

@Schema()
export class Message {

  _id: ObjectId | string;

  @Prop({required: true})
  text: string;

  @Prop({required: true})
  created: Date;

  @Prop({required: true, ref: 'User', type: Types.ObjectId})
  owner: User;

  @Prop({required: true, ref: 'Room', type: Types.ObjectId})
  room: Room | string;
}

export const MessageSchema = SchemaFactory.createForClass(Message)