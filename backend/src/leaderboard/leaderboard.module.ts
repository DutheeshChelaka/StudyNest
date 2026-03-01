import { Module } from '@nestjs/common';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';

@Module({
  controllers: [LeaderboardController],
  providers: [LeaderboardService, PrismaService, RedisService],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}