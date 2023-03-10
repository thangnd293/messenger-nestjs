import { EventsModule } from './event/event.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'modules/auth/auth.module';
import { MessageModule } from 'modules/message/message.module';
import { databaseConfig } from '../configs/database';
import { ConversationModule } from './conversation/conversation.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    MongooseModule.forRoot(databaseConfig.url),
    AuthModule,
    UserModule,
    MessageModule,
    ConversationModule,
    EventsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
