// src/controllers/ai.controller.js  (dashboard lives here as the "ai" aggregation layer)
import { getDailySummary } from '../services/calorie.service.js';
import { getWaterSummary } from '../services/water.service.js';
import { calculateStreak } from '../services/streak.service.js';
import { computeGoalTargets } from '../services/goal.service.js';
import * as progressRepo from '../repositories/progress.repository.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { daysAgo, toDateString } from '../utils/dateUtils.js';

// GET /dashboard
export const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [calorieSummary, waterSummary, streak, targets, recentWeight] = await Promise.all([
    getDailySummary(userId),
    getWaterSummary(userId),
    calculateStreak(userId),
    Promise.resolve(computeGoalTargets(req.user)),
    progressRepo.findWeightHistory(userId, { take: 1 }),
  ]);

  // Last 7-day calorie trend
  const trendLogs = await progressRepo.findDailyLogs(userId, { start: daysAgo(6) });
  const trend = trendLogs
    .map((l) => ({
      date:          toDateString(l.date),
      calories:      l.totalCalories,
      calorieGoal:   l.calorieGoal,
      waterMl:       l.totalWaterMl,
    }))
    .reverse();

  return sendSuccess(res, {
    data: {
      today: {
        calories:   calorieSummary,
        water:      waterSummary,
      },
      streak,
      targets,
      currentWeightKg: recentWeight[0]?.weightKg ?? req.user.currentWeightKg ?? null,
      weekTrend: trend,
      user: {
        name:  req.user.name,
        goal:  req.user.goal,
        avatarUrl: req.user.avatarUrl,
      },
    },
  });
});
