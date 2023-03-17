import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConversationService } from 'modules/conversation/conversation.service';
import { Model, Types } from 'mongoose';
import { MessageStatusEnum, MessageTypeEnum } from 'types/common';
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
      message: Pick<
        Message,
        'type' | 'content' | 'conversation' | 'idClient' | 'sendAt'
      >,
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
      return {
        message: messageSent.toObject(),
        conversation,
      };
    },
  );

  receivedMessages = tryCatchWrapper(
    async (userId: string, conversation: string, createdAt: Date) => {
      const result = await this.messageModel.updateMany(
        {
          conversation,
          status: MessageStatusEnum.sent,
          sender: userId,
          createdAt: { $lte: new Date(createdAt) },
        },
        {
          $set: {
            status: MessageStatusEnum.received,
          },
        },
      );

      return result;
    },
  );

  readMessages = tryCatchWrapper(
    async (userId: string, conversation: string, createdAt: Date) => {
      const timestamp = new Date();
      console.log('vao');

      await this.messageModel.updateMany(
        {
          conversation,
          sender: {
            $ne: userId,
          },
          createdAt: { $lte: new Date(createdAt) },
          'seenBy.user': { $ne: userId },
        },
        {
          $push: {
            seenBy: {
              user: userId,
              activeTime: timestamp,
            },
          },
          $set: {
            status: MessageStatusEnum.seen,
          },
        },
      );

      return timestamp.toISOString();
    },
  );

  updateMessageSentToReceived = tryCatchWrapper(async (userId: string) => {
    const conversationOfUser = await this.conversationService
      .getConversationOfUser(new Types.ObjectId(userId))
      .then((data) => data.map((item) => item._id.toString()));

    const result = await this.messageModel.updateMany(
      {
        conversation: { $in: conversationOfUser },
        status: MessageStatusEnum.sent,
        sender: { $ne: userId },
        createdAt: { $lte: new Date() },
      },
      {
        $set: {
          status: MessageStatusEnum.received,
        },
      },
    );

    return result;
  });

  getMessagesOfConversation = tryCatchWrapper(
    async (conversationId: Types.ObjectId) => {
      return await this.messageModel
        .find({
          conversation: conversationId,
        })
        .populate('sender', '_id name avatar')
        .populate('seenBy.user', '_id name avatar')
        .lean();
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
