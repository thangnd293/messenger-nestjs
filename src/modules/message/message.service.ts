import { MessageStatus } from 'types/common';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConversationService } from 'modules/conversation/conversation.service';
import { Model, Types, UpdateQuery } from 'mongoose';
import { tryCatchWrapper } from 'utils';
import { Message } from './schema/message.schema';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
    private readonly conversationService: ConversationService,
  ) {}

  create = tryCatchWrapper(
    async (
      userId: Types.ObjectId,
      message: Pick<Message, 'type' | 'content' | 'conversation'>,
    ) => {
      const conversation = await this.conversationService.findById(
        new Types.ObjectId(message.conversation),
      );

      if (!conversation)
        throw new BadRequestException('Conversation not found');

      const messageSent = await this.messageModel.create({
        ...message,
        sender: userId,
      });

      await this.conversationService.updateOne(
        { _id: message.conversation },
        {
          $set: {
            lastMessage: messageSent._id,
          },
        },
      );

      return messageSent;
    },
  );

  findAndUpdate = tryCatchWrapper(
    async (id: string, update: UpdateQuery<Message>) => {
      return this.messageModel.findByIdAndUpdate(id, update).lean();
    },
  );

  updateStatus = tryCatchWrapper(
    async (messageId: Types.ObjectId, status: MessageStatus) => {
      return await this.messageModel.findByIdAndUpdate(messageId, {
        $set: {
          status,
        },
      });
    },
  );

  seen = tryCatchWrapper(
    async (userId: Types.ObjectId, messageId: Types.ObjectId) => {
      return await this.messageModel.findByIdAndUpdate(
        messageId,
        {
          $addToSet: {
            // thêm giá trị mới vào mảng seenBy
            seenBy: {
              user: userId,
              activeTime: new Date(),
            },
          },
          $set: {
            // cập nhật lại giá trị activeTime nếu userId đã có trong mảng seenBy
            'seenBy.$[elem].activeTime': new Date(),
          },
        },
        {
          arrayFilters: [{ 'elem.user': userId }], // áp dụng filter để chỉ cập nhật giá trị cho phần tử có user trùng với userId
          new: true, // trả về giá trị mới của tài liệu sau khi đã cập nhật
        },
      );
    },
  );
}
