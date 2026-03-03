import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const achievements = [
    { name: 'First Focus', description: 'Complete your first Pomodoro', icon: '🌱', requirement: 0 },
    { name: 'Hour Scholar', description: 'Study for 1 hour total', icon: '🕐', requirement: 60 },
    { name: 'Study Streak', description: '7 consecutive days of studying', icon: '🔥', requirement: 0 },
    { name: 'Night Owl', description: 'Study after 10 PM', icon: '🌙', requirement: 0 },
    { name: 'Early Bird', description: 'Study before 7 AM', icon: '☀️', requirement: 0 },
    { name: '10 Hour Club', description: '10 hours of focused study', icon: '⭐', requirement: 600 },
    { name: '50 Hour Club', description: '50 hours of focused study', icon: '🏆', requirement: 3000 },
    { name: '100 Hour Club', description: '100 hours of focused study', icon: '👑', requirement: 6000 },
    { name: 'Social Learner', description: 'Study in 10 different rooms', icon: '👥', requirement: 0 },
    { name: 'Marathon Runner', description: '8 Pomodoros in one day', icon: '🏃', requirement: 0 },
  ];

  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { name: a.name },
      update: {},
      create: a,
    });
  }

  console.log('✅ Seeded 10 achievements');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());