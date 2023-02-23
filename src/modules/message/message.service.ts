import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';
import { tryCatchWrapper } from 'utils';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './schema/message.schema';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
  ) {}

  create = tryCatchWrapper(async (createMessageDto: CreateMessageDto) => {
    const { conversation } = createMessageDto;

    const messageSent = await new this.messageModel(createMessageDto).save();

    return messageSent;
  });

  findAndUpdate = tryCatchWrapper(
    async (id: string, update: UpdateQuery<Message>) => {
      return this.messageModel.findByIdAndUpdate(id, update).lean();
    },
  );
}
