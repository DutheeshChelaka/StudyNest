import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AchievementService {
  constructor(private prisma: PrismaService) {}

  // Check and award achievements after a Pomodoro completes
  async checkAndAward(userId: string): Promise<string[]> {
    const newAchievements: string[] = [];

    // Get user's total stats
    const stats = await this.prisma.studySession.aggregate({
      where: { userId },
      _sum: { focusMinutes: true, pomodorosCompleted: true },
    });

    const totalMinutes = stats._sum.focusMinutes || 0;
    const totalPomodoros = stats._sum.pomodorosCompleted || 0;

    // Get user's already earned achievements
    const earned = await this.prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    });
    const earnedIds = new Set(earned.map((e) => e.achievementId));

    // Get all achievements
    const achievements = await this.prisma.achievement.findMany();

    for (const achievement of achievements) {
      if (earnedIds.has(achievement.id)) continue;

      let qualified = false;

      switch (achievement.name) {
        case 'First Focus':
          qualified = totalPomodoros >= 1;
          break;
        case 'Hour Scholar':
          qualified = totalMinutes >= 60;
          break;
        case '10 Hour Club':
          qualified = totalMinutes >= 600;
          break;
        case '50 Hour Club':
          qualified = totalMinutes >= 3000;
          break;
        case '100 Hour Club':
          qualified = totalMinutes >= 6000;
          break;
        case 'Marathon Runner': {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayStats = await this.prisma.studySession.aggregate({
            where: {
              userId,
              startTime: { gte: today },
            },
            _sum: { pomodorosCompleted: true },
          });
          qualified = (todayStats._sum.pomodorosCompleted || 0) >= 8;
          break;
        }
        case 'Social Learner': {
          const rooms = await this.prisma.studySession.findMany({
            where: { userId, roomId: { not: null } },
            distinct: ['roomId'],
          });
          qualified = rooms.length >= 10;
          break;
        }
        case 'Night Owl': {
          const nightSession = await this.prisma.studySession.findFirst({
            where: {
              userId,
              startTime: { gte: new Date(new Date().setHours(22, 0, 0, 0)) },
            },
          });
          qualified = !!nightSession;
          break;
        }
        case 'Early Bird': {
          const earlySession = await this.prisma.studySession.findFirst({
            where: {
              userId,
              startTime: { lte: new Date(new Date().setHours(7, 0, 0, 0)) },
            },
          });
          qualified = !!earlySession;
          break;
        }
        default:
          qualified = totalMinutes >= achievement.requirement;
          break;
      }

      if (qualified) {
        await this.prisma.userAchievement.create({
          data: { userId, achievementId: achievement.id },
        });
        newAchievements.push(achievement.name);
      }
    }

    return newAchievements;
  }

  // Get user's achievements
  async getUserAchievements(userId: string) {
    return this.prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' },
    });
  }
}