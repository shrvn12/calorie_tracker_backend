// src/validators/user.validator.js
import { z } from 'zod';

export const registerSchema = z.object({
  name:     z.string().min(2).max(80),
  email:    z.string().email(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

export const updateProfileSchema = z.object({
  name:             z.string().min(2).max(80).optional(),
  age:              z.number().int().min(10).max(120).optional(),
  gender:           z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  heightCm:         z.number().min(50).max(300).optional(),
  currentWeightKg:  z.number().min(20).max(500).optional(),
  targetWeightKg:   z.number().min(20).max(500).optional(),
  goal:             z.enum(['LOSE_WEIGHT', 'MAINTAIN_WEIGHT', 'GAIN_WEIGHT', 'BUILD_MUSCLE']).optional(),
  activityLevel:    z.enum(['SEDENTARY', 'LIGHTLY_ACTIVE', 'MODERATELY_ACTIVE', 'VERY_ACTIVE', 'EXTRA_ACTIVE']).optional(),
  dailyCalorieGoal: z.number().int().min(500).max(10000).optional(),
  dailyWaterGoalMl: z.number().int().min(500).max(10000).optional(),
}).strict();
