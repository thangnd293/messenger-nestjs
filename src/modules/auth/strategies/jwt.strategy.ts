import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConfig } from 'configs';
import { Payload } from 'types/jwt';
import { UserService } from 'modules/user/user.service';

const { secret } = jwtConfig;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: Payload) {
    const { id } = payload;
    const user = await this.userService.findOne({ _id: id }, { password: 0 });
    return user;
  }
}
