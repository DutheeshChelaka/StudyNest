import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../common/redis.service';
import { PrismaService } from '../common/prisma.service';
import { PresenceGateway } from '../presence/presence.gateway';
import { ChatGateway } from '../chat/chat.gateway';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class RoomsGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private redis: RedisService,
    private prisma: PrismaService,
    private presenceGateway: PresenceGateway,
    private chatGateway: ChatGateway,
  ) {}

  // room:join — User joins a room (Section 7)
  @SubscribeMessage('room:join')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string },
  ) {
    const userId = client.data.userId;
    if (!userId || !payload.roomId) return;

    const { roomId } = payload;

    // Check room exists
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });
    if (!room) return;

    // Check capacity
    const memberCount = await this.redis.scard(`room:members:${roomId}`);
    if (Number(memberCount) >= room.maxCapacity) {
      client.emit('room:error', { message: 'Room is full' });
      return;
    }

    // Join the Socket.io room (for broadcasting)
    client.join(roomId);

    // Add to Redis room members
    await this.redis.sadd(`room:members:${roomId}`, userId);
    await this.redis.set(`user:room:${userId}`, roomId);

    // Update presence status to "studying"
    await this.presenceGateway.updateStatus(userId, 'studying', roomId);

    // Get user info for broadcast
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, avatar: true },
    });

    // Broadcast to room that user joined
    this.server.to(roomId).emit('room:user_joined', { user });

    // Send current member list to the joining user
    const memberIds = await this.redis.smembers(`room:members:${roomId}`);
    const members = await this.prisma.user.findMany({
      where: { id: { in: memberIds } },
      select: { id: true, name: true, avatar: true },
    });
    client.emit('room:members', { members });

    // Send chat history to the joining user (last 50 messages)
    const chatHistory = await this.chatGateway.getChatHistory(roomId);
    client.emit('chat:history', { messages: chatHistory });

    console.log(`📚 User ${userId} joined room ${roomId}`);
  }

  // room:leave — User leaves a room (Section 7)
  @SubscribeMessage('room:leave')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string },
  ) {
    const userId = client.data.userId;
    if (!userId || !payload.roomId) return;

    const { roomId } = payload;

    // Leave Socket.io room
    client.leave(roomId);

    // Remove from Redis
    await this.redis.srem(`room:members:${roomId}`, userId);
    await this.redis.del(`user:room:${userId}`);

    // Update presence back to "online"
    await this.presenceGateway.updateStatus(userId, 'online');

    // Get user info for broadcast
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, avatar: true },
    });

    // Broadcast to room that user left
    this.server.to(roomId).emit('room:user_left', { user });

    // Send updated member list
    const memberIds = await this.redis.smembers(`room:members:${roomId}`);
    const members = await this.prisma.user.findMany({
      where: { id: { in: memberIds } },
      select: { id: true, name: true, avatar: true },
    });
    this.server.to(roomId).emit('room:members', { members });

    console.log(`👋 User ${userId} left room ${roomId}`);
  }
}