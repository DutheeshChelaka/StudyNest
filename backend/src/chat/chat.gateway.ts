import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private chatService: ChatService) {}

  // chat:send — Send a text message or file message
  @SubscribeMessage('chat:send')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: {
      roomId: string;
      content?: string;
      fileUrl?: string;
      fileName?: string;
      fileType?: string;
      fileSize?: number;
    },
  ) {
    const userId = client.data.userId;
    if (!userId || !payload.roomId) return;

    // Must have either content or file
    if (!payload.content && !payload.fileUrl) return;

    const message = await this.chatService.createMessage({
      content: payload.content,
      userId,
      roomId: payload.roomId,
      fileUrl: payload.fileUrl,
      fileName: payload.fileName,
      fileType: payload.fileType,
      fileSize: payload.fileSize,
    });

    // Broadcast to all room members
    this.server.to(payload.roomId).emit('chat:receive', { message });
  }

  // chat:typing — Typing indicator
  @SubscribeMessage('chat:typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; isTyping: boolean },
  ) {
    const userId = client.data.userId;
    if (!userId || !payload.roomId) return;

    client.to(payload.roomId).emit('chat:typing_update', {
      userId,
      isTyping: payload.isTyping,
    });
  }

  // chat:react — Add or remove a reaction
  @SubscribeMessage('chat:react')
  async handleReaction(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; messageId: string; emoji: string },
  ) {
    const userId = client.data.userId;
    if (!userId || !payload.messageId || !payload.emoji) return;

    const result = await this.chatService.addReaction(
      userId,
      payload.messageId,
      payload.emoji,
    );

    // Get updated reactions for the message
    const reactions = await this.chatService.getReactions(payload.messageId);

    // Broadcast updated reactions to all room members
    this.server.to(payload.roomId).emit('chat:reaction_update', {
      messageId: payload.messageId,
      reactions,
    });
  }

  // Get chat history (called by RoomsGateway)
  async getChatHistory(roomId: string) {
    return this.chatService.getChatHistory(roomId);
  }
}