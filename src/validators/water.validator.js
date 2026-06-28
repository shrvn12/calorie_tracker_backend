// src/validators/water.validator.js
import { z } from 'zod';

export const logWaterSchema = z.object({
  amountMl: z.number().int().min(50).max(2000),
  loggedAt: z.string().datetime().optional(), // ISO string — defaults to now()
});

export const weightSchema = z.object({
  weightKg: z.number().min(20).max(500),
  note:     z.string().max(200).optional(),
  loggedAt: z.string().datetime().optional(),
});
