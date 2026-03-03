import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';
import { PriorityQueue, RoomScore } from '../algorithms/priority-queue';

@Injectable()
export class MatchingService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  // Find the best room for a user using Priority Queue
  async findBestRoom(userId: string): Promise<any> {
    // Get user's profile
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) return null;

    // Get all public rooms that aren't full
    const rooms = await this.prisma.room.findMany({
      where: { isPublic: true },
      include: { owner: { select: { id: true, name: true, avatar: true } } },
    });

    if (rooms.length === 0) return null;

    // Score each room and build priority queue
    const scoredRooms: RoomScore[] = [];

    for (const room of rooms) {
      // Get current member count from Redis
      const memberIds = await this.redis.smembers(`room:members:${room.id}`);
      const currentMembers = memberIds.length;

      // Skip full rooms
      if (currentMembers >= room.maxCapacity) continue;

      // Skip rooms user is already in
      if (memberIds.includes(userId)) continue;

      // Calculate score using the formula from Section 5.1
      let score = 0;

      // Subject match (40 points)
      if (user.subjects && room.subject) {
        const userSubjects = Array.isArray(user.subjects) ? user.subjects : [];
        if (userSubjects.some((s: string) => s.toLowerCase() === room.subject.toLowerCase())) {
          score += 40;
        }
      }

      // Friend count in room (30 points max)
      const friendships = await this.prisma.friendship.findMany({
        where: {
          status: 'ACCEPTED',
          OR: [{ requesterId: userId }, { receiverId: userId }],
        },
        select: { requesterId: true, receiverId: true },
      });
      const friendIds = friendships.map((f) =>
        f.requesterId === userId ? f.receiverId : f.requesterId,
      );
      const friendsInRoom = memberIds.filter((id) => friendIds.includes(id)).length;
      score += Math.min(friendsInRoom * 15, 30);

      // Occupancy ratio (20 points) — more active rooms score higher
      if (room.maxCapacity > 0) {
        score += (currentMembers / room.maxCapacity) * 20;
      }

      // Recency (10 points) — newer rooms score higher
      const hoursOld = (Date.now() - new Date(room.createdAt).getTime()) / (1000 * 60 * 60);
      score += Math.max(0, 10 - hoursOld * 0.1);

      scoredRooms.push({
        roomId: room.id,
        score,
        roomName: room.name,
        subject: room.subject,
        currentMembers,
        maxCapacity: room.maxCapacity,
      });
    }

    if (scoredRooms.length === 0) return null;

    // Build priority queue from all scored rooms — O(n)
    const pq = PriorityQueue.buildFromArray(scoredRooms);

    // Extract the best match — O(log n)
    const best = pq.extractMax();
    if (!best) return null;

    // Return full room details
    const bestRoom = await this.prisma.room.findUnique({
      where: { id: best.roomId },
      include: { owner: { select: { id: true, name: true, avatar: true } } },
    });

    return {
      ...bestRoom,
      currentMembers: best.currentMembers,
      matchScore: Math.round(best.score),
    };
  }
}