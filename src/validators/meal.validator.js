// src/validators/meal.validator.js
import { z } from 'zod';

export const textMealSchema = z.object({
  description: z.string().min(3).max(1000),
  mealType:    z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']).optional(),
  loggedAt:    z.string().datetime().optional(),
});

export const updateMealSchema = z.object({
  name:        z.string().min(1).optional(),
  calories:    z.number().min(0).optional(),
  proteinG:    z.number().min(0).optional(),
  carbsG:      z.number().min(0).optional(),
  fatG:        z.number().min(0).optional(),
  mealType:    z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']).optional(),
  loggedAt:    z.string().datetime().optional(),
});

export const mealHistoryQuerySchema = z.object({
  page:      z.coerce.number().int().min(1).default(1),
  limit:     z.coerce.number().int().min(1).max(100).default(20),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
