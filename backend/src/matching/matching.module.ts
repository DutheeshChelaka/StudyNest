import { Module } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';

@Module({
  providers: [MatchingService, PrismaService, RedisService],
  exports: [MatchingService],
})
export class MatchingModule {}