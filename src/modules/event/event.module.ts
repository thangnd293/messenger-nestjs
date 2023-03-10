import { MessageModule } from 'modules/message/message.module';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { EventsGateway } from './events.gateway';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from 'configs';
import { UserModule } from 'modules/user/user.module';
import { JwtStrategy } from 'modules/auth/strategies/jwt.strategy';
const { secret, expiresIn } = jwtConfig;

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret,
      signOptions: { expiresIn },
    }),
    UserModule,
    MessageModule,
  ],
  providers: [EventsGateway, JwtStrategy],
})
export class EventsModule {}
