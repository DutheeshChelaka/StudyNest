import { Module } from '@nestjs/common';
import { PresenceGateway } from './presence.gateway';
import { RedisService } from '../common/redis.service';

@Module({
  providers: [PresenceGateway, RedisService],
  exports: [PresenceGateway],
})
export class PresenceModule {}