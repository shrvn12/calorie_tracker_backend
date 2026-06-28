// src/controllers/water.controller.js
import * as waterRepo from '../repositories/water.repository.js';
import { getWaterSummary } from '../services/water.service.js';
import { syncDailyLog } from '../services/streak.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { fromDateString } from '../utils/dateUtils.js';

// POST /water
export const logWater = asyncHandler(async (req, res) => {
  const { amountMl, loggedAt } = req.body;

  const log = await waterRepo.create({
    userId:   req.user.id,
    amountMl,
    ...(loggedAt && { loggedAt: new Date(loggedAt) }),
  });

  await syncDailyLog(req.user.id, log.loggedAt);

  return sendSuccess(res, { data: { log }, message: 'Water intake logged', statusCode: 201 });
});

// GET /water/today
export const getTodayWater = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const parsedDate = date ? fromDateString(date) : undefined;
  const summary = await getWaterSummary(req.user.id, parsedDate);
  return sendSuccess(res, { data: summary });
});

// DELETE /water/:waterId
export const deleteWater = asyncHandler(async (req, res) => {
  const { waterId } = req.params;
  const log = await waterRepo.findById(waterId, req.user.id);
  if (!log) {
    return sendError(res, { message: 'Water log not found', statusCode: 404 });
  }

  await waterRepo.remove(waterId);
  await syncDailyLog(req.user.id, log.loggedAt);

  return sendSuccess(res, { message: 'Water intake deleted' });
});
