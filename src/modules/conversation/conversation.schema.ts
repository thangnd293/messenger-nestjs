import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Message } from 'modules/message/schema/message.schema';
import { User } from 'modules/user/user.schema';
import { Types, Document } from 'mongoose';
import { ConversationType, ConversationEnum } from 'types/common';

@Schema({
  timestamps: true,
})
export class Conversation extends Document {
  @Prop({
    enum: ConversationEnum,
  })
  type: ConversationType;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'User' }],
  })
  members: User[];

  @Prop({
    type: { type: Types.ObjectId, ref: 'Message' },
  })
  lastMessage: Message;

  @Prop()
  name: string;

  @Prop()
  avatar: string;

  @Prop()
  isOnline: boolean;

  @Prop()
  lastActive: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
