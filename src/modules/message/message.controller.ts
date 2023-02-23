import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { JoiValidationPipe } from 'pipes/joi-validate.pipe';
import { CreateMessageDtoSchema } from './dto/create-message.dto';
import { MessageService } from './message.service';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UsePipes(new JoiValidationPipe(CreateMessageDtoSchema))
  async create(@Body() body, @Request() req) {
    const input = {
      sender: req.user._id,
      ...body,
    };

    return await this.messageService.create(input);
  }
}
