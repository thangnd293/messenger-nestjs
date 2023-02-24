import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
@Schema({
  timestamps: true,
})
export class User extends Document {
  @Prop({
    required: true,
  })
  email: string;

  @Prop({
    required: true,
  })
  password: string;

  @Prop({
    required: true,
  })
  lastName: string;

  @Prop({
    required: true,
  })
  firstName: string;

  @Prop()
  avatar: string;

  @Prop()
  birthDate: Date;

  @Prop()
  isOnline: boolean;

  @Prop()
  lastActive: Date;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'User' }],
  })
  friends: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
