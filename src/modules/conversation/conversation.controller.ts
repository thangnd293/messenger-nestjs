import { Controller } from '@nestjs/common';
import { ConversationService } from './conversation.service';

@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  // @UseGuards(JwtAuthGuard)
  // @Post('private')
  // createPrivateConversation(
  //   @Request() req,
  //   @Body() createPrivateConversationDto: CreatePrivateConversationDto,
  // ) {
  //   const requestUser = req.user;
  //   const { recipient } = createPrivateConversationDto;

  //   return this.conversationService.createPrivateConversation(
  //     requestUser._id,
  //     new Types.ObjectId(recipient),
  //   );
  // }
}
