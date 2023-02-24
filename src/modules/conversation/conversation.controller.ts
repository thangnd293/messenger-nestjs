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
  getConversation(@Request() req, @Param('id') id: string) {
    const requestUser = req.user;

    return this.conversationService.getConversationById(
      requestUser._id,
      new Types.ObjectId(id),
    );
  }
}
