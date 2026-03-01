import { Injectable } from '@nestjs/common';
import { RedisService } from '../common/redis.service';
import { PrismaService } from '../common/prisma.service';

/**
 * Leaderboard Service using Redis Sorted Sets (Section 5.4)
 *
 * ZINCRBY: O(log n) | ZREVRANGE: O(log n + k) | ZREVRANK: O(log n)
 */

export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar: string | null;
  focusMinutes: number;
  rank: number;
}

@Injectable()
export class LeaderboardService {
  // Redis key prefixes for three time periods
  private readonly DAILY_KEY = 'lb:daily';
  private readonly WEEKLY_KEY = 'lb:weekly';
  private readonly ALL_TIME_KEY = 'lb:alltime';

  constructor(
    private redis: RedisService,
    private prisma: PrismaService,
  ) {}

  // Add focus minutes when a Pomodoro completes (Section 5.4)
  async addFocusTime(userId: string, minutes: number): Promise<void> {
    // ZINCRBY atomically increments the score (Section 5.4 — Redis Commands)
    await Promise.all([
      this.redis.zincrby(this.DAILY_KEY, minutes, userId),
      this.redis.zincrby(this.WEEKLY_KEY, minutes, userId),
      this.redis.zincrby(this.ALL_TIME_KEY, minutes, userId),
    ]);

    // Set TTL for daily key (resets at midnight)
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0); // Next midnight
    const secondsUntilMidnight = Math.floor((midnight.getTime() - now.getTime()) / 1000);
    await this.redis.expire(this.DAILY_KEY, secondsUntilMidnight);

    // Set TTL for weekly key (resets Monday midnight)
    const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + daysUntilMonday);
    nextMonday.setHours(0, 0, 0, 0);
    const secondsUntilMonday = Math.floor((nextMonday.getTime() - now.getTime()) / 1000);
    await this.redis.expire(this.WEEKLY_KEY, secondsUntilMonday);
  }

  // Get top users for a time period (Section 5.4)
  async getTopUsers(
    period: 'daily' | 'weekly' | 'alltime',
    limit: number = 10,
  ): Promise<LeaderboardEntry[]> {
    const key = this.getKey(period);

    // ZREVRANGE returns top-k users sorted by score descending
    const results = await this.redis.zrevrange(key, 0, limit - 1, 'WITHSCORES');

    // Results come as [userId, score, userId, score, ...]
    const entries: LeaderboardEntry[] = [];

    for (let i = 0; i < results.length; i += 2) {
      const userId = results[i];
      const focusMinutes = parseInt(results[i + 1]);

      // Get user details from PostgreSQL
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, avatar: true },
      });

      if (user) {
        entries.push({
          userId: user.id,
          name: user.name,
          avatar: user.avatar,
          focusMinutes,
          rank: entries.length + 1,
        });
      }
    }

    return entries;
  }

  // Get a specific user's rank and score (Section 5.4)
  async getUserRank(
    userId: string,
    period: 'daily' | 'weekly' | 'alltime',
  ): Promise<{ rank: number; focusMinutes: number } | null> {
    const key = this.getKey(period);

    // ZREVRANK returns 0-based rank (null if user not in set)
    const rank = await this.redis.zrevrank(key, userId);
    if (rank === null) return null;

    // ZSCORE returns the user's total focus minutes
    const score = await this.redis.zscore(key, userId);

    return {
      rank: rank + 1, // Convert to 1-based
      focusMinutes: parseInt(score || '0'),
    };
  }

  // Get the correct Redis key for a time period
  private getKey(period: 'daily' | 'weekly' | 'alltime'): string {
    switch (period) {
      case 'daily': return this.DAILY_KEY;
      case 'weekly': return this.WEEKLY_KEY;
      case 'alltime': return this.ALL_TIME_KEY;
    }
  }
}