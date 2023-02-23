import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from 'modules/user/user.schema';
import { Types, Document } from 'mongoose';
import { ActiveTime, ActiveTimeSchema } from './timeActive.schema';

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({
    enum: ['text', 'image', 'audio'],
  })
  type: string;

  @Prop()
  content: string;

  @Prop({
    type: { type: Types.ObjectId, ref: 'User' },
  })
  sender: User;

  @Prop({
    enum: ['received', 'seen'],
  })
  status: string;

  @Prop()
  seenAt?: Date;

  @Prop({
    type: [ActiveTimeSchema],
  })
  seenBy?: ActiveTime[];
}

export const MessageSchema = SchemaFactory.createForClass(Message);
