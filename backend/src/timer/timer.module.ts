import { Module } from '@nestjs/common';
import { TimerGateway } from './timer.gateway';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';
import { LeaderboardService } from '../leaderboard/leaderboard.service';
import { AchievementService } from '../leaderboard/achievement.service';

@Module({
  providers: [TimerGateway, PrismaService, RedisService, LeaderboardService, AchievementService],
  exports: [TimerGateway],
})
export class TimerModule {}