import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { RoomsGateway } from './rooms.gateway';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';
import { PresenceModule } from '../presence/presence.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [PresenceModule, ChatModule],
  controllers: [RoomsController],
  providers: [RoomsService, RoomsGateway, PrismaService, RedisService],
  exports: [RoomsService],
})
export class RoomsModule {}