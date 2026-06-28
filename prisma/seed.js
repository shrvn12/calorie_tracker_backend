// prisma/seed.js
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@calorie.app' },
    update: {},
    create: {
      name:             'Demo User',
      email:            'demo@calorie.app',
      passwordHash,
      age:              28,
      gender:           'MALE',
      heightCm:         178,
      currentWeightKg:  80,
      targetWeightKg:   75,
      goal:             'LOSE_WEIGHT',
      activityLevel:    'MODERATELY_ACTIVE',
      dailyCalorieGoal: 1900,
      dailyWaterGoalMl: 2500,
    },
  });

  console.log(`✅ Demo user created: ${user.email}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
