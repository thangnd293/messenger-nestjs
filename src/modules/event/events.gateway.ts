import { UnauthorizedException, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { OnGatewayDisconnect } from '@nestjs/websockets/interfaces';
import { jwtConfig } from 'configs';
import { WsGuard } from 'guards/ws-auth.guard';
import * as jwt from 'jsonwebtoken';
import { MessageService } from 'modules/message/message.service';
import { UserService } from 'modules/user/user.service';
import { Server, Socket } from 'socket.io';
import { Store } from 'store';
import { Payload } from 'types/jwt';

const { secret } = jwtConfig;
const store = Store.getStore();

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly userService: UserService) {}
  @WebSocketServer()
  server: Server;

  handleConnection(@ConnectedSocket() socket: Socket) {
    const { token } = socket.handshake.auth;
    const id = getUserIdFromToken(token);

    store.set(id, socket.id);
    socket.join(id);
    // this.userService.updateOnline(id, true);
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    const { token } = socket.handshake.auth;
    const id = getUserIdFromToken(token);

    socket.leave(id);
    store.remove(socket.id);
    const notExist = store.get(id);

    if (!notExist) {
      // this.userService.updateOnline(id, false);
      // this.userService.updateLastOnline(id);
    }
  }
}

function getUserIdFromToken(token: string): string {
  try {
    const { id } = jwt.verify(token, secret) as Payload;
    return id.toString();
  } catch (error) {
    throw new UnauthorizedException('Invalid token');
  }
}
