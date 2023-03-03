import { MessageStatusEnum, MessageTypeEnum } from 'types/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from 'modules/user/user.schema';
import mongoose, { Document } from 'mongoose';
import { ActiveTime, ActiveTimeSchema } from './timeActive.schema';

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({
    enum: MessageTypeEnum,
  })
  type: string;

  @Prop()
  content: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  sender: User;

  @Prop({
    enum: MessageStatusEnum,
    default: 'sent',
  })
  status: MessageStatusEnum;

  @Prop()
  seenAt?: Date;

  @Prop({
    type: [ActiveTimeSchema],
  })
  seenBy?: ActiveTime[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'conversation' })
  conversation: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
