import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { Conversation, ConversationSchema } from './conversation.schema';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
    ]),
  ],
  controllers: [ConversationController],
  providers: [ConversationService],
  exports: [ConversationService],
})
export class ConversationModule {}
