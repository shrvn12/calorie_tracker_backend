// src/services/water.service.js
import prisma from '../config/db.js';
import { getDayRange } from '../utils/dateUtils.js';

/**
 * Get water intake summary for a user on a given date.
 * @param {string} userId
 * @param {Date}   date
 * @returns {Promise<object>}
 */
export const getWaterSummary = async (userId, date = new Date()) => {
  const { start, end } = getDayRange(date);

  const [logs, user] = await Promise.all([
    prisma.waterLog.findMany({
      where: { userId, loggedAt: { gte: start, lte: end } },
      orderBy: { loggedAt: 'asc' },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { dailyWaterGoalMl: true },
    }),
  ]);

  const totalMl    = logs.reduce((s, l) => s + l.amountMl, 0);
  const goalMl     = user?.dailyWaterGoalMl ?? 2000;
  const remaining  = Math.max(0, goalMl - totalMl);
  const percentage = goalMl > 0 ? Math.round((totalMl / goalMl) * 100) : 0;

  return { logs, totalMl, goalMl, remaining, percentage };
};
