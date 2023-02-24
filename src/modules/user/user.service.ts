import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConversationService } from 'modules/conversation/conversation.service';
import { FilterQuery, Model, ProjectionType, Types } from 'mongoose';
import { tryCatchWrapper } from 'utils';
import { User } from './user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly conversationService: ConversationService,
  ) {}

  findOne = tryCatchWrapper(
    async (filter?: FilterQuery<User>, projection?: ProjectionType<User>) => {
      const user = await this.userModel.findOne(filter, projection).lean();
      return user;
    },
  );

  createOne = tryCatchWrapper(async (user: Partial<User>) => {
    return await this.userModel.create(user);
  });

  searchByName = tryCatchWrapper(
    async (requestUser: Types.ObjectId, name: string) => {
      const usersFound = await this.userModel
        .find(
          {
            $and: [
              {
                $or: [
                  { lastName: { $regex: name, $options: 'i' } },
                  { firstName: { $regex: name, $options: 'i' } },
                ],
              },
              { _id: { $ne: requestUser } },
            ],
          },
          {
            lastName: 1,
            firstName: 1,
            avatar: 1,
            isOnline: 1,
          },
        )
        .lean();

      const conversations = await Promise.all(
        usersFound.map(async (user) =>
          this.conversationService.getPrivateConversationByMembers(
            requestUser,
            user._id,
          ),
        ),
      );

      const usersWithConversations = usersFound.map((user, index) => ({
        ...user,
        conversation: conversations[index]._id,
      }));

      return usersWithConversations;
    },
  );

  getUserInfo = tryCatchWrapper(async (id: Types.ObjectId) => {
    return await this.userModel
      .findById(id, {
        password: 0,
        friendRequests: 0,
        friendRequestsSent: 0,
      })
      .lean();
  });

  //Todo: Change this logic
  getFriends = tryCatchWrapper(async (id: Types.ObjectId) => {
    return await this.userModel
      .findById(id, {
        friends: 1,
      })
      .populate('friends', {
        password: 0,
        friendRequests: 0,
        friendRequestsSent: 0,
      })
      .lean();
  });
}
