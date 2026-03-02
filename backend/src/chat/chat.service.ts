import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  // Get chat history with reactions
  async getChatHistory(roomId: string) {
    return this.prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
      take: 50,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        reactions: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  // Create a message (text or with attachment)
  async createMessage(data: {
    content?: string;
    userId: string;
    roomId: string;
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
  }) {
    return this.prisma.message.create({
      data: {
        content: data.content || null,
        userId: data.userId,
        roomId: data.roomId,
        fileUrl: data.fileUrl || null,
        fileName: data.fileName || null,
        fileType: data.fileType || null,
        fileSize: data.fileSize || null,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        reactions: true,
      },
    });
  }

  // Add reaction to a message (one reaction per user per message)
  async addReaction(userId: string, messageId: string, emoji: string) {
    // Check if user already has ANY reaction on this message
    const existing = await this.prisma.messageReaction.findFirst({
      where: { userId, messageId },
    });

    if (existing) {
      if (existing.emoji === emoji) {
        // Same emoji — remove it (toggle off)
        await this.prisma.messageReaction.delete({
          where: { id: existing.id },
        });
        return { action: 'removed', emoji };
      } else {
        // Different emoji — update to new one
        await this.prisma.messageReaction.update({
          where: { id: existing.id },
          data: { emoji },
        });
        return { action: 'updated', emoji };
      }
    }

    // No existing reaction — create new one
    await this.prisma.messageReaction.create({
      data: { userId, messageId, emoji },
    });
    return { action: 'added', emoji };
  }

  // Get reactions for a message
  async getReactions(messageId: string) {
    return this.prisma.messageReaction.findMany({
      where: { messageId },
      include: {
        user: { select: { id: true, name: true } },
      },
    });
  }
}