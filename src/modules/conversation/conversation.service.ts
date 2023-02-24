import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConversationEnum } from 'types/common';
import { tryCatchWrapper } from '../../utils/function';
import { Conversation } from './conversation.schema';

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<Conversation>,
  ) {}

  createOne = async (conversation: Partial<Conversation>) => {
    return await this.conversationModel.create(conversation);
  };

  // createPrivateConversation = async (
  //   user1: Types.ObjectId,
  //   user2: Types.ObjectId,
  // ) => {
  //   const conversationExists = await this.conversationModel
  //     .findOne({
  //       type: ConversationEnum.private,
  //       members: { $all: [user1, user2] },
  //     })
  //     .lean();

  //   if (conversationExists) {
  //     return conversationExists;
  //   }

  //   const conversation = await this.conversationModel.create({
  //     type: ConversationEnum.private,
  //     members: [user1, user2],
  //   });

  //   return conversation;
  // };

  getPrivateConversationByMembers = tryCatchWrapper(
    async (user1: Types.ObjectId, user2: Types.ObjectId) => {
      const conversationExists = await this.conversationModel
        .findOne({
          type: ConversationEnum.private,
          members: { $all: [user1, user2] },
        })
        .lean();

      if (conversationExists) return conversationExists;

      const conversation = await this.conversationModel.create({
        type: ConversationEnum.private,
        members: [user1, user2],
      });
      return conversation;
    },
  );
}
