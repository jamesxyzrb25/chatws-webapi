import { Prop,Schema, SchemaFactory } from "@nestjs/mongoose";
import {ObjectId} from 'bson';
import { Room } from "./room.entity";

@Schema()
export class User {
  _id?: ObjectId | string;

  @Prop({required: true, maxlength: 20, minlength: 5})
  nickname: string;

  @Prop({required: true})
  clientId: string;

  @Prop({required: true})
  online: boolean;

  @Prop()
  notifications?: RoomNotification[];
}

interface RoomNotification{
  roomId: Room | string;
  pendingMessages: number;
}

export const UserSchema = SchemaFactory.createForClass(User)