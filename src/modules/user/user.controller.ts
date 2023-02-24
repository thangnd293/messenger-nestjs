import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('search')
  searchByName(@Query('name') name: string, @Request() req) {
    const requestUser = req.user;

    return this.userService.searchByName(requestUser._id, name);
  }

  @UseGuards(JwtAuthGuard)
  @Get('connections')
  getFriends(@Request() req) {
    const requestUser = req.user;

    return this.userService.getConnections(requestUser._id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversations')
  getConversations(@Request() req) {
    const requestUser = req.user;

    return this.userService.getConversations(requestUser._id);
  }
}
