// src/controllers/user.controller.js
import * as userRepo from '../repositories/user.repository.js';
import { computeGoalTargets } from '../services/goal.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET /users/profile
export const getProfile = asyncHandler(async (req, res) => {
  const targets = computeGoalTargets(req.user);
  return sendSuccess(res, { data: { user: req.user, targets } });
});

// PATCH /users/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const updated = await userRepo.update(req.user.id, req.body);

  // Recompute targets after update
  const targets = computeGoalTargets(updated);

  // Auto-update calorie goal if profile is complete and no manual override
  if (targets && !req.body.dailyCalorieGoal) {
    await userRepo.update(updated.id, { dailyCalorieGoal: targets.calorieGoal });
    updated.dailyCalorieGoal = targets.calorieGoal;
  }

  return sendSuccess(res, { data: { user: updated, targets }, message: 'Profile updated' });
});
