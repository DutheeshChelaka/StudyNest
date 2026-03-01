import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../common/redis.service';

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

  constructor(private redis: RedisService) {}

  // Called when a client connects via WebSocket
  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (!userId) {
      client.disconnect();
      return;
    }

    // Store user in client data for later use
    client.data.userId = userId;

    // Store presence in Redis (Section 4.1.3 — Redis Key Structure)
    await this.redis.set(
      `presence:${userId}`,
      JSON.stringify({
        status: 'online',
        roomId: null,
        socketId: client.id,
        lastSeen: Date.now(),
      }),
    );
    // Set TTL of 60 seconds (refreshed by heartbeat)
    await this.redis.expire(`presence:${userId}`, 60);

    // Broadcast to all clients that this user is online
    this.server.emit('presence:online', { userId, status: 'online' });

    console.log(`🟢 User connected: ${userId}`);
  }

  // Called when a client disconnects
  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;

    if (!userId) return;

    // 30-second grace period (Section 4.1.3 — Disconnect Handling)
    // Set a short TTL instead of deleting immediately
    await this.redis.expire(`presence:${userId}`, 30);

    // Clean up room membership if user was in a room
    const roomId = await this.redis.get(`user:room:${userId}`);
    if (roomId) {
      await this.redis.srem(`room:members:${roomId}`, userId);
      await this.redis.del(`user:room:${userId}`);

      // Notify room members
      this.server.to(roomId).emit('room:user_left', { userId });
    }

    // Broadcast offline after grace period
    setTimeout(async () => {
      const presence = await this.redis.get(`presence:${userId}`);
      if (!presence) {
        this.server.emit('presence:offline', { userId });
        console.log(`🔴 User disconnected: ${userId}`);
      }
    }, 30000);
  }

  // Heartbeat — called by client every 30 seconds to stay "online"
  async handleHeartbeat(client: Socket) {
    const userId = client.data.userId;
    if (!userId) return;

    // Refresh TTL
    await this.redis.expire(`presence:${userId}`, 60);
  }

  // Update user status (online/studying/away)
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

  // Get all online users
  async getOnlineUsers(): Promise<string[]> {
    const keys = await this.redis.keys('presence:*');
    return keys.map((key) => key.replace('presence:', ''));
  }
}