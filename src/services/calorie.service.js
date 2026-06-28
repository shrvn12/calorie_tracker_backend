// src/services/calorie.service.js
import prisma from '../config/db.js';
import { getDayRange } from '../utils/dateUtils.js';

/**
 * Get calorie summary for a user on a given date.
 * @param {string} userId
 * @param {Date} date
 * @returns {Promise<object>}
 */
export const getDailySummary = async (userId, date = new Date()) => {
  const { start, end } = getDayRange(date);

  const [meals, user] = await Promise.all([
    prisma.mealEntry.findMany({
      where: { userId, loggedAt: { gte: start, lte: end } },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { dailyCalorieGoal: true },
    }),
  ]);

  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      proteinG: acc.proteinG + m.proteinG,
      carbsG:   acc.carbsG   + m.carbsG,
      fatG:     acc.fatG     + m.fatG,
      fiberG:   acc.fiberG   + m.fiberG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0 }
  );

  const calorieGoal  = user?.dailyCalorieGoal ?? 2000;
  const remaining    = calorieGoal - totals.calories;
  const percentage   = calorieGoal > 0 ? Math.round((totals.calories / calorieGoal) * 100) : 0;

  return { ...totals, calorieGoal, remaining, percentage, mealCount: meals.length };
};
