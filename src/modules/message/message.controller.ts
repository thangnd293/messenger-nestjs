import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { Types } from 'mongoose';

import { MessageService } from './message.service';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @UseGuards(JwtAuthGuard)
  @Get('conversation/:conversationId')
  async searchMessage(
    @Param('conversationId') conversationId: string,
    @Query('s') keyWord: string,
  ) {
    const id = new Types.ObjectId(conversationId);
    const messages = keyWord
      ? await this.messageService.searchByText(id, keyWord)
      : await this.messageService.getMessagesOfConversation(id);

    return {
      data: messages,
      count: messages.length,
      totalCount: messages.length,
    };
  }
}
