import { Controller, UseGuards } from '@nestjs/common';
import { Get, Param, Request } from '@nestjs/common/decorators';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { Types } from 'mongoose';
import { ConversationService } from './conversation.service';

@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getConversation(@Request() req, @Param('id') id: string) {
    const requestUser = req.user;
    const conversationFound = await this.conversationService.getAll(
      requestUser._id,
      {
        _id: new Types.ObjectId(id),
      },
    );
    return {
      data: conversationFound?.[0] || null,
    };
  }
}
