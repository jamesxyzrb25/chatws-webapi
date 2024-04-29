import { ObjectId, Types } from "mongoose";
import { Prop, Schema } from "@nestjs/mongoose";
import { Message } from "./message.entity";
import { expectedFileTypes } from "../types/media.types";

@Schema()
export class MessageMedia {
    _id: ObjectId | string;

    @Prop({ required: true, ref: 'Message', type: Types.ObjectId })
    message: Message;

    @Prop({ required: true })
    path: string;

    @Prop({ required: true })
    mime: string;

    @Prop()
    height: number | null;

    @Prop()
    width: number | null;

    @Prop()
    original_name?: string | null;

    @Prop()
    type: expectedFileTypes;

    @Prop()
    size: number;
}