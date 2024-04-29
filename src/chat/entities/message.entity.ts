import { Types } from "mongoose";
import {ObjectId} from 'bson';
import {Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Room } from "./room.entity";
import { User } from "./user.entity";
import { expectedFileTypes } from "../types/media.types";
import { MessageMedia } from "./message-media.entity";

@Schema()
export class Message {

  _id: ObjectId | string;

  @Prop({required: true})
  content: string;

  @Prop()
  messageType: MediaMessageType;

  @Prop({ ref: 'MessageMedia', type: Types.ObjectId })
  media?: MessageMedia | null;

  @Prop({required: true})
  createdAt: Date;

  @Prop({required: true, ref: 'User', type: Types.ObjectId})
  owner: User;

  @Prop({required: true, ref: 'Room', type: Types.ObjectId})
  room: Room | string;

}
type MediaMessageType = expectedFileTypes | 'text';
export const MessageSchema = SchemaFactory.createForClass(Message)