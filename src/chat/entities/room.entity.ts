import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, ObjectId, Types } from "mongoose";
import { Message } from "./message.entity";
import { User } from "./user.entity";
import { ApiProperty } from "@nestjs/swagger";

@Schema()
export class Room {
  _id: ObjectId | string;

  @ApiProperty({ required: true })
  @Prop({required: true, maxlength: 20, minlength: 5, unique:true})
  name: string;

  @ApiProperty()
  @Prop()
  descriptionRoom:string;

  //@ApiProperty()
  @Prop()
  createdAt?: Date;

  @ApiProperty()
  @Prop()
  urlImageRoom:string;

  @ApiProperty({ required: true })
  @Prop({type: [{type: Types.ObjectId, ref: 'Message'}]})
  messages: Message[];

  @ApiProperty({ required: true })
  @Prop({type: [{type: Types.ObjectId, ref: 'User'}]})
  connectedUsers: User[];
}

export const RoomSchema = SchemaFactory.createForClass(Room)