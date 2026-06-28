// src/services/streak.service.js
import prisma from '../config/db.js';
import { daysAgo, toDateString } from '../utils/dateUtils.js';
import { logger } from '../utils/logger.js';

/**
 * Compute the current streak for a user.
 * A streak day = the user logged at least one meal OR water entry.
 * @param {string} userId
 * @returns {Promise<number>} streak count in days
 */
export const calculateStreak = async (userId) => {
  const logs = await prisma.dailyLog.findMany({
    where: {
      userId,
      date: { gte: daysAgo(365) },
    },
    orderBy: { date: 'desc' },
    select: { date: true, totalCalories: true, totalWaterMl: true },
  });

  if (!logs.length) return 0;

  const activeDays = new Set(
    logs
      .filter((l) => l.totalCalories > 0 || l.totalWaterMl > 0)
      .map((l) => toDateString(l.date))
  );

  let streak = 0;
  let cursor = new Date();

  while (true) {
    const key = toDateString(cursor);
    if (activeDays.has(key)) {
      streak++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

/**
 * Update or create today's DailyLog and recalculate totals from source tables.
 * Called after any meal / water write.
 * @param {string} userId
 * @param {Date}   date    - UTC date for the log entry
 */
export const syncDailyLog = async (userId, date) => {
  const { getDayRange } = await import('../utils/dateUtils.js');
  const { start, end } = getDayRange(date);

  const [meals, waterLogs, user] = await Promise.all([
    prisma.mealEntry.findMany({
      where: { userId, loggedAt: { gte: start, lte: end } },
      select: { calories: true, proteinG: true, carbsG: true, fatG: true },
    }),
    prisma.waterLog.findMany({
      where: { userId, loggedAt: { gte: start, lte: end } },
      select: { amountMl: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { dailyCalorieGoal: true, dailyWaterGoalMl: true },
    }),
  ]);

  const totalCalories  = meals.reduce((s, m) => s + m.calories,  0);
  const totalProteinG  = meals.reduce((s, m) => s + m.proteinG,  0);
  const totalCarbsG    = meals.reduce((s, m) => s + m.carbsG,    0);
  const totalFatG      = meals.reduce((s, m) => s + m.fatG,      0);
  const totalWaterMl   = waterLogs.reduce((s, w) => s + w.amountMl, 0);

  // Normalize date to start of day for the unique constraint
  const dayStart = new Date(start);

  await prisma.dailyLog.upsert({
    where: { userId_date: { userId, date: dayStart } },
    create: {
      userId,
      date:          dayStart,
      totalCalories,
      totalProteinG,
      totalCarbsG,
      totalFatG,
      totalWaterMl,
      calorieGoal:   user?.dailyCalorieGoal ?? 2000,
      waterGoalMl:   user?.dailyWaterGoalMl ?? 2000,
    },
    update: {
      totalCalories,
      totalProteinG,
      totalCarbsG,
      totalFatG,
      totalWaterMl,
    },
  });

  logger.debug({ userId, date: toDateString(date) }, 'DailyLog synced');
};
