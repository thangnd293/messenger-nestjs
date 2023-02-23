import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { jwtConfig } from 'configs';
import * as jwt from 'jsonwebtoken';
import { UserService } from 'modules/user/user.service';
import { Observable } from 'rxjs';
import { Payload } from 'types/jwt';

const { secret } = jwtConfig;
@Injectable()
export class WsGuard implements CanActivate {
  constructor(private userService: UserService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const { token } = context.getArgs()[0].handshake.auth;
      const { id } = jwt.verify(token, secret) as Payload;
      return new Promise(async (resolve, reject) => {
        return this.userService.findOne({ _id: id }).then((user) => {
          if (user) {
            context.switchToWs().getClient().data.user = user;

            resolve(true);
          } else {
            reject(false);
          }
        });
      });
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
