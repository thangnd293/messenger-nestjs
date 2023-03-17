import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  FilterQuery,
  Model,
  Types,
  UpdateQuery,
  UpdateWithAggregationPipeline,
} from 'mongoose';
import { ConversationEnum } from 'types/common';
import { tryCatchWrapper } from '../../utils/function';
import { Conversation } from './conversation.schema';

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<Conversation>,
  ) {}

  findById = tryCatchWrapper(async (id: Types.ObjectId) => {
    return await this.conversationModel
      .findById(id)
      .populate({
        path: 'members',
        select: 'name avatar isOnline lastActive firstName lastName',
      })
      .lean();
  });

  updateOne = tryCatchWrapper(
    async (
      filter?: FilterQuery<Conversation>,
      update?: UpdateWithAggregationPipeline | UpdateQuery<Conversation>,
    ) => {
      return await this.conversationModel.updateOne(filter, update).lean();
    },
  );

  getAll = tryCatchWrapper(
    async (userId: Types.ObjectId, filter?: FilterQuery<any>) => {
      const data = await this.conversationModel
        .aggregate([
          { $match: { members: userId, ...filter } },
          {
            $lookup: {
              from: 'users',
              localField: 'members',
              foreignField: '_id',
              as: 'members',
            },
          },
          {
            $addFields: {
              user: {
                $first: {
                  $filter: {
                    input: '$members',
                    as: 'member',
                    cond: { $ne: ['$$member._id', userId] },
                  },
                },
              },
            },
          },
          {
            $lookup: {
              from: 'messages',
              localField: 'lastMessage',
              foreignField: '_id',
              as: 'lastMessage',
            },
          },
          {
            $addFields: {
              lastMessage: { $arrayElemAt: ['$lastMessage', 0] },
            },
          },
          {
            $unwind: '$lastMessage',
          },
          {
            $lookup: {
              from: 'users',
              localField: 'lastMessage.sender',
              foreignField: '_id',
              as: 'lastMessage.sender',
            },
          },
          {
            $unwind: '$lastMessage.sender',
          },
          {
            $project: {
              _id: 1,
              type: 1,
              lastMessage: {
                _id: 1,
                content: 1,
                createdAt: 1,
                status: 1,
                seenBy: 1,
                sender: {
                  _id: '$lastMessage.sender._id',
                  name: '$lastMessage.sender.name',
                  avatar: '$lastMessage.sender.avatar',
                },
              },
              name: 1,
              avatar: 1,
              isOnline: 1,
              lastActive: 1,
              user: {
                _id: 1,
                lastName: 1,
                firstName: 1,
                avatar: 1,
                isOnline: 1,
                lastActive: 1,
              },
              members: {
                _id: 1,
              },
            },
          },
        ])
        .exec();

      const conversations = data.map((item) => {
        const { type } = item;

        const avatar =
          type === ConversationEnum.group ? item.avatar : item.user.avatar;
        const name =
          type === ConversationEnum.group
            ? item.name
            : `${item.user.lastName} ${item.user.firstName}`;
        const isOnline =
          type === ConversationEnum.group ? false : item.user.isOnline;

        return {
          ...item,
          avatar,
          name,
          isOnline,
        };
      });

      return conversations;
    },
  );

  getConversationById = tryCatchWrapper(
    async (userId: Types.ObjectId, conversationId: Types.ObjectId) => {
      const conversation = await this.conversationModel
        .findById(conversationId)
        .lean();

      if (!conversation)
        throw new BadRequestException('Conversation not found');

      const isMember = conversation.members.some(
        (member) => member._id.toString() === userId.toString(),
      );

      if (!isMember)
        throw new BadRequestException(
          'You are not a member of this conversation',
        );

      return conversation;
    },
  );

  createOne = async (conversation: Partial<Conversation>) => {
    return await this.conversationModel.create(conversation);
  };

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

  getConnections = tryCatchWrapper(async (userId: Types.ObjectId) => {
    const connections = await this.conversationModel
      .aggregate([
        {
          $match: {
            type: ConversationEnum.private,
            members: { $in: [userId] },
          },
        },
        {
          $lookup: {
            from: 'users',
            let: { members: '$members' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $in: ['$_id', '$$members'] },
                      { $ne: ['$_id', userId] },
                    ],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  firstName: 1,
                  lastName: 1,
                  isOnline: 1,
                  lastActive: 1,
                  avatar: 1,
                },
              },
            ],
            as: 'members',
          },
        },
        {
          $addFields: {
            user: {
              $first: {
                $filter: {
                  input: '$members',
                  as: 'member',
                  cond: { $ne: ['$$member._id', userId] },
                },
              },
            },
          },
        },
        {
          $project: {
            user: 1,
          },
        },
      ])
      .exec();

    return connections;
  });

  getConversationOfUser = tryCatchWrapper(async (userId: Types.ObjectId) => {
    return await this.conversationModel
      .find({
        members: { $in: [userId] },
      })
      .populate('lastMessage', 'idClient status')
      .select('_id lastMessage')
      .lean();
  });
}
