import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'modules/user/user.schema';
import { UserService } from 'modules/user/user.service';
import { Payload } from 'types/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOne({
      username,
      password: password,
    });

    if (user) {
      return user;
    }
    return null;
  }

  async login(user: User) {
    const payload: Payload = { id: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async signUp(user: Partial<User>) {
    const isUserExist = await this.usersService.findOne({
      username: user.username,
    });

    if (isUserExist) throw new BadRequestException('User already exists');

    const newUser = await this.usersService.createOne(user);

    return newUser ? true : false;
  }
}
