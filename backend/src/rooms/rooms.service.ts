import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RoomsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  // POST /rooms — Create a new room
  async create(userId: string, dto: CreateRoomDto) {
    const data: any = {
      name: dto.name,
      subject: dto.subject,
      description: dto.description,
      isPublic: dto.isPublic ?? true,
      maxCapacity: dto.maxCapacity ?? 10,
      educationLevel: dto.educationLevel,
      medium: dto.medium,
      grade: dto.grade,
      stream: dto.stream,
      ownerId: userId,
    };

    // Hash password for private rooms (Section 12 — bcrypt 12 rounds)
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 12);
    }

    const room = await this.prisma.room.create({
      data,
      include: { owner: { select: { id: true, name: true, avatar: true } } },
    });

    return room;
  }

  // GET /rooms — List public rooms (paginated, filtered)
  async findAll(query: {
    page?: number;
    limit?: number;
    subject?: string;
    educationLevel?: string;
    grade?: number;
    medium?: string;
    search?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { isPublic: true };

    if (query.subject) where.subject = query.subject;
    if (query.educationLevel) where.educationLevel = query.educationLevel;
    if (query.grade) where.grade = query.grade;
    if (query.medium) where.medium = query.medium;
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    const [rooms, total] = await Promise.all([
      this.prisma.room.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { id: true, name: true, avatar: true } },
        },
      }),
      this.prisma.room.count({ where }),
    ]);

    // Add current member count from Redis for each room
    const roomsWithMembers = await Promise.all(
      rooms.map(async (room) => {
        const memberCount = await this.redis.scard(`room:members:${room.id}`);
        return { ...room, currentMembers: Number(memberCount) };
      }),
    );

    return {
      rooms: roomsWithMembers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // GET /rooms/:id — Get room details
  async findById(roomId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Get current members from Redis
    const memberIds = await this.redis.smembers(`room:members:${roomId}`);
    const currentMembers = memberIds.length;

    return { ...room, currentMembers };
  }

  // PATCH /rooms/:id — Update room (owner only)
  async update(roomId: string, userId: string, dto: UpdateRoomDto) {
    const room = await this.findById(roomId);

    if (room.ownerId !== userId) {
      throw new ForbiddenException('Only the room owner can update settings');
    }

    const data: any = { ...dto };

    // Hash new password if provided
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 12);
    }

    return this.prisma.room.update({
      where: { id: roomId },
      data,
      include: { owner: { select: { id: true, name: true, avatar: true } } },
    });
  }

  // DELETE /rooms/:id — Delete room (owner only)
  async delete(roomId: string, userId: string) {
    const room = await this.findById(roomId);

    if (room.ownerId !== userId) {
      throw new ForbiddenException('Only the room owner can delete the room');
    }

    // Clean up Redis data
    await this.redis.del(`room:members:${roomId}`);
    await this.redis.del(`timer:${roomId}`);

    await this.prisma.room.delete({ where: { id: roomId } });

    return { message: 'Room deleted successfully' };
  }

  // POST /rooms/:id/join — Join a room
  async join(roomId: string, userId: string, password?: string) {
    const room = await this.findById(roomId);

    // Check capacity
    const memberCount = await this.redis.scard(`room:members:${roomId}`);
    if (Number(memberCount) >= room.maxCapacity) {
      throw new BadRequestException('Room is full');
    }

    // Check password for private rooms
    if (!room.isPublic && room.password) {
      if (!password) {
        throw new BadRequestException('Password required for private rooms');
      }
      const isValid = await bcrypt.compare(password, room.password);
      if (!isValid) {
        throw new BadRequestException('Incorrect room password');
      }
    }

    // Add user to room in Redis
    await this.redis.sadd(`room:members:${roomId}`, userId);
    // Track which room the user is in
    await this.redis.set(`user:room:${userId}`, roomId);

    return { message: 'Joined room successfully' };
  }

  // POST /rooms/:id/leave — Leave a room
  async leave(roomId: string, userId: string) {
    // Remove user from room in Redis
    await this.redis.srem(`room:members:${roomId}`, userId);
    await this.redis.del(`user:room:${userId}`);

    // Check if room is empty — if owner left, transfer or close
    const remainingMembers = await this.redis.smembers(`room:members:${roomId}`);

    if (remainingMembers.length === 0) {
      // Room is empty — clean up timer
      await this.redis.del(`timer:${roomId}`);
    }

    return { message: 'Left room successfully' };
  }
}