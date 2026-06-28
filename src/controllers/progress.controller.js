// src/controllers/progress.controller.js
import * as progressRepo from '../repositories/progress.repository.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getMonthRange } from '../utils/dateUtils.js';
import { z } from 'zod';

const weightHistoryQuery = z.object({
  page:  z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

const calendarQuery = z.object({
  year:  z.coerce.number().int().min(2020).max(2100).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
});

// POST /weight
export const logWeight = asyncHandler(async (req, res) => {
  const { weightKg, note, loggedAt } = req.body;

  const log = await progressRepo.createWeightLog({
    userId: req.user.id,
    weightKg,
    note,
    ...(loggedAt && { loggedAt: new Date(loggedAt) }),
  });

  return sendSuccess(res, { data: { log }, message: 'Weight logged', statusCode: 201 });
});

// GET /weight/history
export const getWeightHistory = asyncHandler(async (req, res) => {
  const { page, limit } = weightHistoryQuery.parse(req.query);
  const skip = (page - 1) * limit;

  const logs = await progressRepo.findWeightHistory(req.user.id, { skip, take: limit });

  return sendSuccess(res, {
    data: { logs },
    meta: { page, limit },
  });
});

// GET /calendar
export const getCalendar = asyncHandler(async (req, res) => {
  const now = new Date();
  const { year = now.getUTCFullYear(), month = now.getUTCMonth() + 1 } = calendarQuery.parse(req.query);

  const { start, end } = getMonthRange(year, month);
  const logs = await progressRepo.findDailyLogs(req.user.id, { start, end });

  // Build a date-keyed map for the client
  const byDate = {};
  for (const log of logs) {
    const key = log.date.toISOString().slice(0, 10);
    byDate[key] = {
      totalCalories: log.totalCalories,
      calorieGoal:   log.calorieGoal,
      totalWaterMl:  log.totalWaterMl,
      waterGoalMl:   log.waterGoalMl,
      metCalorieGoal: log.totalCalories >= log.calorieGoal * 0.8 &&
                      log.totalCalories <= log.calorieGoal * 1.1,
      metWaterGoal:   log.totalWaterMl  >= log.waterGoalMl,
    };
  }

  return sendSuccess(res, { data: { year, month, days: byDate } });
});
