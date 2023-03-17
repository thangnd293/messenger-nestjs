import { Controller, UseGuards } from '@nestjs/common';
import { Get, Param } from '@nestjs/common/decorators';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { Types } from 'mongoose';
import { ConversationService } from './conversation.service';

@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getConversation(@Param('id') id: string) {
    const conversationFound = await this.conversationService.findById(
      new Types.ObjectId(id),
    );

    return {
      data: conversationFound,
    };
  }
}
