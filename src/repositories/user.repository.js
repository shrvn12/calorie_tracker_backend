// src/repositories/user.repository.js
import prisma from '../config/db.js';

const safeSelect = {
  id: true, email: true, name: true,
  age: true, gender: true, heightCm: true,
  currentWeightKg: true, targetWeightKg: true,
  goal: true, activityLevel: true,
  dailyCalorieGoal: true, dailyWaterGoalMl: true,
  avatarUrl: true, createdAt: true, updatedAt: true,
};

export const findById = (id) =>
  prisma.user.findUnique({ where: { id }, select: safeSelect });

export const findByEmail = (email) =>
  prisma.user.findUnique({ where: { email } }); // includes passwordHash

export const create = (data) =>
  prisma.user.create({ data, select: safeSelect });

export const update = (id, data) =>
  prisma.user.update({ where: { id }, data, select: safeSelect });
