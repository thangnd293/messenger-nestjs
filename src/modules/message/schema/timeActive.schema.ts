import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from 'modules/user/user.schema';
import mongoose, { Document } from 'mongoose';

@Schema()
export class ActiveTime extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop()
  activeTime: Date;
}

export const ActiveTimeSchema = SchemaFactory.createForClass(ActiveTime);
