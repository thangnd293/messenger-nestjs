import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, ProjectionType, Types } from 'mongoose';
import { tryCatchWrapper } from 'utils';
import { User } from './user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
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
}
