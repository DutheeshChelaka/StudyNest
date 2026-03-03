import { Module } from '@nestjs/common';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';
import { AchievementService } from './achievement.service';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';

@Module({
  controllers: [LeaderboardController],
  providers: [LeaderboardService, AchievementService, PrismaService, RedisService],
  exports: [LeaderboardService, AchievementService],
})
export class LeaderboardModule {}