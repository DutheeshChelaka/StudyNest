import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../common/prisma.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private prisma: PrismaService) {}

  // chat:send — Client sends a message (Section 7)
  @SubscribeMessage('chat:send')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; content: string },
  ) {
    const userId = client.data.userId;
    if (!userId || !payload.roomId || !payload.content) return;

    // Persist message to PostgreSQL (Section 4.1.5 — requirement 2)
    const message = await this.prisma.message.create({
      data: {
        content: payload.content,
        userId,
        roomId: payload.roomId,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Broadcast to all room members (chat:receive)
    this.server.to(payload.roomId).emit('chat:receive', { message });
  }

  // chat:typing — Typing indicator (Section 7)
  @SubscribeMessage('chat:typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; isTyping: boolean },
  ) {
    const userId = client.data.userId;
    if (!userId || !payload.roomId) return;

    // Broadcast typing status to room (except sender)
    client.to(payload.roomId).emit('chat:typing_update', {
      userId,
      isTyping: payload.isTyping,
    });
  }

  // Load chat history via REST (last 50 messages)
  async getChatHistory(roomId: string) {
    return this.prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
      take: 50,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });
  }
}