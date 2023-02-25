import { MessageStatus, MessageTypeEnum } from 'types/common';
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
      const messageUpdated = await this.messageModel.findOneAndUpdate(
        {
          _id: messageId,
          'seenBy.user': userId,
        },
        {
          $set: {
            'seenBy.$.activeTime': new Date(),
          },
        },
        {
          new: true,
        },
      );

      if (!messageUpdated) {
        return await this.messageModel.updateOne(
          { _id: messageId },
          { $push: { seenBy: { user: userId, activeTime: new Date() } } },
        );
      }

      return messageUpdated;
    },
  );

  searchByText = tryCatchWrapper(
    async (conversationId: Types.ObjectId, text: string) => {
      return await this.messageModel
        .find({
          $and: [
            {
              conversation: conversationId,
            },
            {
              type: MessageTypeEnum.text,
            },
            { content: { $regex: text, $options: 'i' } },
          ],
        })
        .lean();
    },
  );
}
