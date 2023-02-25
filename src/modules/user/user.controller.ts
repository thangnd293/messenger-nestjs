import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('search')
  async searchByName(@Query('name') name: string, @Request() req) {
    const requestUser = req.user;
    const usersFound = await this.userService.searchByName(
      requestUser._id,
      name,
    );
    return {
      data: usersFound,
      totalCount: usersFound.length,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('connections')
  async getConnections(@Request() req) {
    const requestUser = req.user;
    const connections = await this.userService.getConnections(requestUser._id);

    return {
      data: connections,
      totalCount: connections.length,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversations')
  async getConversations(@Request() req) {
    const requestUser = req.user;
    const conversations = await this.userService.getConversations(
      requestUser._id,
    );

    return {
      data: conversations,
      totalCount: conversations.length,
    };
  }
}
