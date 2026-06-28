// src/controllers/meal.controller.js
import * as mealRepo from '../repositories/meal.repository.js';
import { extractCaloriesFromText } from '../services/ai/calorieExtractor.service.js';
import { extractCaloriesFromImage } from '../services/ai/imageFoodDetector.service.js';
import { syncDailyLog } from '../services/streak.service.js';
import { uploadToSupabase } from '../middleware/upload.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { fromDateString } from '../utils/dateUtils.js';

// POST /meals/text
export const logMealFromText = asyncHandler(async (req, res) => {
  const { description, mealType, loggedAt } = req.body;

  const nutrition = await extractCaloriesFromText(description);

  const meal = await mealRepo.create({
    userId: req.user.id,
    name: nutrition.name,
    description: nutrition.description,
    mealType: mealType ?? nutrition.mealType,
    calories: nutrition.calories,
    proteinG: nutrition.proteinG,
    carbsG: nutrition.carbsG,
    fatG: nutrition.fatG,
    fiberG: nutrition.fiberG,
    sugarG: nutrition.sugarG,
    sodiumMg: nutrition.sodiumMg,
    inputMethod: 'text',
    aiRaw: nutrition,
    ...(loggedAt && { loggedAt: new Date(loggedAt) }),
  });

  await syncDailyLog(req.user.id, meal.loggedAt);

  return sendSuccess(res, {
    data: { meal, aiConfidence: nutrition.confidence, aiNotes: nutrition.notes },
    message: 'Meal logged successfully',
    statusCode: 201,
  });
});

// POST /meals/image
export const logMealFromImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendError(res, { message: 'No image file provided', statusCode: 400 });
  }

  const { buffer, originalname, mimetype } = req.file;
  const { loggedAt } = req.body;

  // Run AI analysis on the image buffer
  const nutrition = await extractCaloriesFromImage(buffer, mimetype);

  // Upload to Supabase Storage (no temp file on disk)
  const imageUrl = await uploadToSupabase(buffer, originalname, mimetype);

  const meal = await mealRepo.create({
    userId: req.user.id,
    name: nutrition.name,
    description: nutrition.description,
    mealType: nutrition.mealType,
    imageUrl,
    calories: nutrition.calories,
    proteinG: nutrition.proteinG,
    carbsG: nutrition.carbsG,
    fatG: nutrition.fatG,
    fiberG: nutrition.fiberG,
    sugarG: nutrition.sugarG,
    sodiumMg: nutrition.sodiumMg,
    inputMethod: 'image',
    aiRaw: nutrition,
    ...(loggedAt && { loggedAt: new Date(loggedAt) }),
  });

  await syncDailyLog(req.user.id, meal.loggedAt);

  return sendSuccess(res, {
    data: { meal, aiConfidence: nutrition.confidence, aiNotes: nutrition.notes },
    message: 'Meal logged from image',
    statusCode: 201,
  });
});

// GET /meals/today
export const getTodayMeals = asyncHandler(async (req, res) => {
  const meals = await mealRepo.findTodayByUser(req.user.id);

  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      proteinG: acc.proteinG + m.proteinG,
      carbsG: acc.carbsG + m.carbsG,
      fatG: acc.fatG + m.fatG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  );

  return sendSuccess(res, {
    data: { meals, totals, count: meals.length },
  });
});

// GET /meals/history
export const getMealHistory = asyncHandler(async (req, res) => {
  const { page, limit, startDate, endDate } = req.query;
  const skip = (page - 1) * limit;

  const parsedStart = startDate ? fromDateString(startDate) : undefined;
  const parsedEnd = endDate ? fromDateString(endDate) : undefined;

  const [meals, total] = await Promise.all([
    mealRepo.findHistoryByUser(req.user.id, { skip, take: limit, startDate: parsedStart, endDate: parsedEnd }),
    mealRepo.countHistory(req.user.id, { startDate: parsedStart, endDate: parsedEnd }),
  ]);

  return sendSuccess(res, {
    data: { meals },
    meta: { total, page, limit, pages: Math.ceil(total / limit) },
  });
});

// DELETE /meals/:mealId
export const deleteMeal = asyncHandler(async (req, res) => {
  const { mealId } = req.params;

  const meal = await mealRepo.findById(mealId, req.user.id);
  if (!meal) {
    return sendError(res, { message: 'Meal not found', statusCode: 404 });
  }

  await mealRepo.remove(mealId);
  await syncDailyLog(req.user.id, meal.loggedAt);

  return sendSuccess(res, { message: 'Meal deleted' });
});

// PATCH /meals/:mealId
export const updateMeal = asyncHandler(async (req, res) => {
  const { mealId } = req.params;
  const { name, calories, proteinG, carbsG, fatG, mealType, loggedAt } = req.body;

  const meal = await mealRepo.findById(mealId, req.user.id);
  if (!meal) {
    return sendError(res, { message: 'Meal not found', statusCode: 404 });
  }

  const { default: prisma } = await import('../config/db.js');
  const updated = await prisma.mealEntry.update({
    where: { id: mealId },
    data: {
      ...(name !== undefined && { name }),
      ...(calories !== undefined && { calories }),
      ...(proteinG !== undefined && { proteinG }),
      ...(carbsG !== undefined && { carbsG }),
      ...(fatG !== undefined && { fatG }),
      ...(mealType !== undefined && { mealType }),
      ...(loggedAt !== undefined && { loggedAt: new Date(loggedAt) }),
    },
  });

  await syncDailyLog(req.user.id, updated.loggedAt);
  if (meal.loggedAt.getTime() !== updated.loggedAt.getTime()) {
    await syncDailyLog(req.user.id, meal.loggedAt);
  }

  return sendSuccess(res, { data: updated, message: 'Meal updated' });
});
