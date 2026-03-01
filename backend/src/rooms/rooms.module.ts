import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';

@Module({
  controllers: [RoomsController],
  providers: [RoomsService, PrismaService, RedisService],
  exports: [RoomsService],
})
export class RoomsModule {}