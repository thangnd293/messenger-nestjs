import { Types } from 'mongoose';
import { UseGuards } from '@nestjs/common';
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
import { UserService } from 'modules/user/user.service';
import { Server, Socket } from 'socket.io';
import { Store } from 'store';
import { Payload } from 'types/jwt';
import { MessageService } from './../message/message.service';
import { SOCKET_EVENT } from 'constants/socket';

const { secret } = jwtConfig;
const store = Store.getStore();

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly userService: UserService,
    private readonly messageService: MessageService,
  ) {}
  @WebSocketServer()
  server: Server;

  async handleConnection(@ConnectedSocket() socket: Socket) {
    const { token } = socket.handshake.auth;
    if (!token) return;

    const id = getUserIdFromToken(token);
    this.messageService.updateMessageSentToReceived(id);

    const friends = (
      await this.userService.getConnections(new Types.ObjectId(id))
    ).map((connect) => connect.user._id.toString());
    const timestamp = new Date().toString();

    this.server.to(friends).emit(SOCKET_EVENT.MESSAGE_RECEIVED, id, timestamp);

    store.set(id, socket.id);
    socket.join(id);
    this.userService.updateOnline(id, true);
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    const { token } = socket.handshake.auth;
    if (!token) return;

    const id = getUserIdFromToken(token);

    socket.leave(id);
    store.remove(socket.id);
    const notExist = store.get(id);

    if (!notExist) {
      this.userService.updateOnline(id, false);
      this.userService.updateLastActive(id);
    }
  }

  // Events
  // ======= SEND MESSAGE =======
  @UseGuards(WsGuard)
  @SubscribeMessage(SOCKET_EVENT.SEND_MESSAGE)
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data,
  ) {
    const { user } = client.data;
    const { message, conversation } = await this.messageService.create(
      user._id,
      data,
    );
    const messageSentBack = {
      ...message,
      sender: user,
    };

    const otherMembers = conversation.members
      .filter((member) => member._id.toString() !== user._id.toString())
      .map((member) => member.toString());

    this.server
      .to(user._id.toString())
      .except(client.id)
      .emit(SOCKET_EVENT.MESSAGE_SENT, messageSentBack);

    this.server
      .to(otherMembers)
      .emit(SOCKET_EVENT.NEW_MESSAGE, messageSentBack);

    return data.idClient;
  }

  // ======= MESSAGE RECEIVED =======
  @UseGuards(WsGuard)
  @SubscribeMessage(SOCKET_EVENT.MESSAGE_RECEIVED)
  async handleReceivedMessage(@MessageBody() data) {
    const {
      conversation,
      sender: { _id: userId },
      createdAt,
    } = data;

    await this.messageService.receivedMessages(userId, conversation, createdAt);

    this.server
      .to(userId)
      .emit(SOCKET_EVENT.MESSAGE_RECEIVED, userId, createdAt);
  }

  // ======= READ MESSAGE =======
  @UseGuards(WsGuard)
  @SubscribeMessage(SOCKET_EVENT.READ_MESSAGE)
  async handleReadMessage(@MessageBody() data) {
    const [user, message, members] = data;

    const seenAt = await this.messageService.readMessages(
      user._id,
      message.conversation,
      message.createdAt,
    );

    const otherMembers = members.filter(
      (member) => member !== user._id.toString(),
    );

    this.server.to(otherMembers).emit(SOCKET_EVENT.SEEN_MESSAGE, {
      user,
      seenAt,
    });
  }
}

function getUserIdFromToken(token: string): string {
  try {
    const { id } = jwt.verify(token, secret) as Payload;

    return id.toString();
  } catch (error) {
    console.log('error', error);
  }
}
