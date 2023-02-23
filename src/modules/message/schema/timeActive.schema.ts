import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from 'modules/user/user.schema';
import { Types, Document } from 'mongoose';

@Schema()
export class ActiveTime extends Document {
  @Prop({
    type: {
      type: Types.ObjectId,
      ref: 'User',
    },
  })
  user: User;

  @Prop()
  activeTime: Date;
}

export const ActiveTimeSchema = SchemaFactory.createForClass(ActiveTime);
