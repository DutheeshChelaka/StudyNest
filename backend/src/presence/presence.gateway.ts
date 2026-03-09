import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../common/redis.service';
import { PrismaService } from '../common/prisma.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class PresenceGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private redis: RedisService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (!userId) {
      client.disconnect();
      return;
    }

    client.data.userId = userId;

    await this.redis.set(
      `presence:${userId}`,
      JSON.stringify({
        status: 'online',
        roomId: null,
        socketId: client.id,
        lastSeen: Date.now(),
      }),
    );
    await this.redis.expire(`presence:${userId}`, 60);

    this.server.emit('presence:online', { userId, status: 'online' });

    console.log(`🟢 User connected: ${userId}`);
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;

    if (!userId) return;

    await this.redis.expire(`presence:${userId}`, 30);

    // Clean up room membership if user was in a room
    const roomId = await this.redis.get(`user:room:${userId}`);
    if (roomId) {
      await this.redis.srem(`room:members:${roomId}`, userId);
      await this.redis.del(`user:room:${userId}`);

      // Get user info for the broadcast
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, avatar: true },
      });

      // Broadcast with user object (not just userId)
      this.server.to(roomId).emit('room:user_left', { user: user || { id: userId, name: 'Unknown', avatar: null } });

      // Send updated member list to remaining members
      const memberIds = await this.redis.smembers(`room:members:${roomId}`);
      const members = await this.prisma.user.findMany({
        where: { id: { in: memberIds } },
        select: { id: true, name: true, avatar: true },
      });
      this.server.to(roomId).emit('room:members', { members });
    }

    setTimeout(async () => {
      const presence = await this.redis.get(`presence:${userId}`);
      if (!presence) {
        this.server.emit('presence:offline', { userId });
        console.log(`🔴 User disconnected: ${userId}`);
      }
    }, 30000);
  }

  async handleHeartbeat(client: Socket) {
    const userId = client.data.userId;
    if (!userId) return;
    await this.redis.expire(`presence:${userId}`, 60);
  }

  async updateStatus(userId: string, status: string, roomId?: string) {
    await this.redis.set(
      `presence:${userId}`,
      JSON.stringify({
        status,
        roomId: roomId || null,
        lastSeen: Date.now(),
      }),
    );
    await this.redis.expire(`presence:${userId}`, 60);

    this.server.emit('presence:online', { userId, status });
  }

  async getOnlineUsers(): Promise<string[]> {
    const keys = await this.redis.keys('presence:*');
    return keys.map((key) => key.replace('presence:', ''));
  }
}