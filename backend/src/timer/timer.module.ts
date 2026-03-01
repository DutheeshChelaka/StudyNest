import { Module } from '@nestjs/common';
import { TimerGateway } from './timer.gateway';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';

@Module({
  providers: [TimerGateway, PrismaService, RedisService],
  exports: [TimerGateway],
})
export class TimerModule {}