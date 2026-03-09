import { Module } from '@nestjs/common';
import { PresenceGateway } from './presence.gateway';
import { RedisService } from '../common/redis.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  providers: [PresenceGateway, RedisService, PrismaService],
  exports: [PresenceGateway],
})
export class PresenceModule {}