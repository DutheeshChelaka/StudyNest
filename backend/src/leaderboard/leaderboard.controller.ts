import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { LeaderboardService } from './leaderboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('leaderboard')
@UseGuards(JwtAuthGuard)
export class LeaderboardController {
  constructor(private leaderboardService: LeaderboardService) {}

  // GET /leaderboard?period=daily&limit=10
  @Get()
  async getLeaderboard(
    @Query('period') period?: string,
    @Query('limit') limit?: string,
  ) {
    const validPeriod = ['daily', 'weekly', 'alltime'].includes(period || '')
      ? (period as 'daily' | 'weekly' | 'alltime')
      : 'weekly';

    return this.leaderboardService.getTopUsers(
      validPeriod,
      limit ? parseInt(limit) : 10,
    );
  }

  // GET /leaderboard/me?period=weekly — Get my rank
  @Get('me')
  async getMyRank(
    @Req() req: Request,
    @Query('period') period?: string,
  ) {
    const user = req.user as any;

    const validPeriod = ['daily', 'weekly', 'alltime'].includes(period || '')
      ? (period as 'daily' | 'weekly' | 'alltime')
      : 'weekly';

    return this.leaderboardService.getUserRank(user.id, validPeriod);
  }
}