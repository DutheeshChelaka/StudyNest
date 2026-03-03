import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../common/redis.service';
import { PrismaService } from '../common/prisma.service';
import { LeaderboardService } from '../leaderboard/leaderboard.service';
import { AchievementService } from '../leaderboard/achievement.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class TimerGateway {
  @WebSocketServer()
  server: Server;

  // Store active intervals so we can clear them
  private timerIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    private redis: RedisService,
    private prisma: PrismaService,
    private leaderboardService: LeaderboardService,
    private achievementService: AchievementService,
  ) {}

  // timer:start — Owner starts the Pomodoro
  @SubscribeMessage('timer:start')
  async handleStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: {
      roomId: string;
      focusDuration?: number;
      breakDuration?: number;
    },
  ) {
    const userId = client.data.userId;
    if (!userId || !payload.roomId) return;

    const { roomId } = payload;

    // Verify user is the room owner
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });
    if (!room || room.ownerId !== userId) {
      client.emit('timer:error', { message: 'Only the room owner can control the timer' });
      return;
    }

    // Don't start if already running
    if (this.timerIntervals.has(roomId)) return;

    const focusDuration = payload.focusDuration || 1500;
    const breakDuration = payload.breakDuration || 300;

    // Create timer state in Redis
    const timerState = {
      remaining: focusDuration,
      phase: 'focus',
      isRunning: true,
      pomodoroCount: 0,
      focusDuration,
      breakDuration,
      startedAt: Math.floor(Date.now() / 1000),
    };

    await this.redis.set(`timer:${roomId}`, JSON.stringify(timerState));

    // Start the server-side interval (ticks every second)
    this.startInterval(roomId);

    // Broadcast initial state
    this.server.to(roomId).emit('timer:tick', {
      remaining: timerState.remaining,
      state: timerState,
    });

    console.log(`⏱️ Timer started in room ${roomId}`);
  }

  // timer:pause — Owner pauses the timer
  @SubscribeMessage('timer:pause')
  async handlePause(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string },
  ) {
    const userId = client.data.userId;
    if (!userId || !payload.roomId) return;

    const { roomId } = payload;

    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });
    if (!room || room.ownerId !== userId) return;

    this.stopInterval(roomId);

    const timerData = await this.redis.get(`timer:${roomId}`);
    if (!timerData) return;

    const timerState = JSON.parse(timerData);
    timerState.isRunning = false;
    await this.redis.set(`timer:${roomId}`, JSON.stringify(timerState));

    this.server.to(roomId).emit('timer:tick', {
      remaining: timerState.remaining,
      state: timerState,
    });

    console.log(`⏸️ Timer paused in room ${roomId}`);
  }

  // timer:resume — Owner resumes the timer
  @SubscribeMessage('timer:resume')
  async handleResume(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string },
  ) {
    const userId = client.data.userId;
    if (!userId || !payload.roomId) return;

    const { roomId } = payload;

    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });
    if (!room || room.ownerId !== userId) return;

    if (this.timerIntervals.has(roomId)) return;

    const timerData = await this.redis.get(`timer:${roomId}`);
    if (!timerData) return;

    const timerState = JSON.parse(timerData);
    timerState.isRunning = true;
    await this.redis.set(`timer:${roomId}`, JSON.stringify(timerState));

    this.startInterval(roomId);

    console.log(`▶️ Timer resumed in room ${roomId}`);
  }

  // timer:reset — Owner resets the timer
  @SubscribeMessage('timer:reset')
  async handleReset(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string },
  ) {
    const userId = client.data.userId;
    if (!userId || !payload.roomId) return;

    const { roomId } = payload;

    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });
    if (!room || room.ownerId !== userId) return;

    this.stopInterval(roomId);
    await this.redis.del(`timer:${roomId}`);

    this.server.to(roomId).emit('timer:tick', {
      remaining: 0,
      state: { isRunning: false, phase: 'focus', pomodoroCount: 0 },
    });

    console.log(`🔄 Timer reset in room ${roomId}`);
  }

  // Server-side tick interval
  private startInterval(roomId: string) {
    const interval = setInterval(async () => {
      const timerData = await this.redis.get(`timer:${roomId}`);
      if (!timerData) {
        this.stopInterval(roomId);
        return;
      }

      const timerState = JSON.parse(timerData);

      timerState.remaining -= 1;

      if (timerState.remaining <= 0) {
        await this.handlePhaseComplete(roomId, timerState);
      } else {
        await this.redis.set(`timer:${roomId}`, JSON.stringify(timerState));
        this.server.to(roomId).emit('timer:tick', {
          remaining: timerState.remaining,
          state: timerState,
        });
      }
    }, 1000);

    this.timerIntervals.set(roomId, interval);
  }

  private stopInterval(roomId: string) {
    const interval = this.timerIntervals.get(roomId);
    if (interval) {
      clearInterval(interval);
      this.timerIntervals.delete(roomId);
    }
  }

  // Handle focus/break completion
  private async handlePhaseComplete(roomId: string, timerState: any) {
    if (timerState.phase === 'focus') {
      // Focus completed — log the session to PostgreSQL
      timerState.pomodoroCount += 1;

      // Log study session for all room members
      const memberIds = await this.redis.smembers(`room:members:${roomId}`);
      const focusMinutes = Math.floor(timerState.focusDuration / 60);

      for (const memberId of memberIds) {
        // Log study session
        await this.prisma.studySession.create({
          data: {
            userId: memberId,
            roomId,
            focusMinutes,
            pomodorosCompleted: 1,
            startTime: new Date(timerState.startedAt * 1000),
            endTime: new Date(),
          },
        });

        // Update leaderboard
        await this.leaderboardService.addFocusTime(memberId, focusMinutes);

        // Check and award achievements
        const newAchievements = await this.achievementService.checkAndAward(memberId);
        if (newAchievements.length > 0) {
          this.server.to(roomId).emit('achievement:unlocked', {
            userId: memberId,
            achievements: newAchievements,
          });
        }
      }

      // Broadcast completion
      this.server.to(roomId).emit('timer:complete', { type: 'focus' });

      // Start break phase
      const isLongBreak = timerState.pomodoroCount % 4 === 0;
      timerState.phase = isLongBreak ? 'long_break' : 'short_break';
      timerState.remaining = isLongBreak ? 900 : timerState.breakDuration;
      timerState.startedAt = Math.floor(Date.now() / 1000);

      await this.redis.set(`timer:${roomId}`, JSON.stringify(timerState));

      console.log(`✅ Focus completed in room ${roomId} (Pomodoro #${timerState.pomodoroCount})`);
    } else {
      // Break completed — start next focus
      this.server.to(roomId).emit('timer:complete', { type: timerState.phase });

      timerState.phase = 'focus';
      timerState.remaining = timerState.focusDuration;
      timerState.startedAt = Math.floor(Date.now() / 1000);

      await this.redis.set(`timer:${roomId}`, JSON.stringify(timerState));

      console.log(`☕ Break completed in room ${roomId}, starting focus`);
    }

    // Broadcast new phase
    this.server.to(roomId).emit('timer:tick', {
      remaining: timerState.remaining,
      state: timerState,
    });
  }
}