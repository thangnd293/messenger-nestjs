import { SeenDto, SeenDtoSchema } from './dto/seen-dto';
import {
  UpdateStatusDto,
  UpdateStatusDtoSchema,
} from './dto/update-status.dto';
import {
  Body,
  Controller,
  Post,
  Patch,
  Request,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { JoiValidationPipe } from 'pipes/joi-validate.pipe';
import {
  CreateMessageDto,
  CreateMessageDtoSchema,
} from './dto/create-message.dto';
import { MessageService } from './message.service';
import { Types } from 'mongoose';

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

    return await this.messageService.seen(
      requestUser._id,
      new Types.ObjectId(messageId),
    );
  }
}
