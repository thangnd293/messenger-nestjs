import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
  UsePipes,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { Types } from 'mongoose';
import { JoiValidationPipe } from 'pipes/joi-validate.pipe';
import {
  CreateMessageDto,
  CreateMessageDtoSchema,
} from './dto/create-message.dto';
import { SeenDto, SeenDtoSchema } from './dto/seen-dto';
import { MessageService } from './message.service';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UsePipes(new JoiValidationPipe(CreateMessageDtoSchema))
  async create(@Body() createMessageDto: CreateMessageDto, @Request() req) {
    const requestUser = req.user;
    return await this.messageService.create(requestUser._id, createMessageDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('seen')
  @UsePipes(new JoiValidationPipe(SeenDtoSchema))
  async seen(@Body() seenDto: SeenDto, @Request() req) {
    const requestUser = req.user;
    const { messageId } = seenDto;

    await this.messageService.seen(
      requestUser._id,
      new Types.ObjectId(messageId),
    );
    return {
      data: true,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversation/:conversationId')
  async searchMessage(
    @Param('conversationId') conversationId: string,
    @Query('s') text: string,
  ) {
    const messagesFound = await this.messageService.searchByText(
      new Types.ObjectId(conversationId),
      text,
    );

    return {
      data: messagesFound,
      count: messagesFound.length,
      totalCount: messagesFound.length,
    };
  }
}
