// src/repositories/meal.repository.js
import prisma from '../config/db.js';
import { getDayRange } from '../utils/dateUtils.js';

export const create = (data) =>
  prisma.mealEntry.create({ data });

export const findTodayByUser = (userId) => {
  const { start, end } = getDayRange();
  return prisma.mealEntry.findMany({
    where: { userId, loggedAt: { gte: start, lte: end } },
    orderBy: { loggedAt: 'asc' },
  });
};

export const findHistoryByUser = (userId, { skip = 0, take = 20, startDate, endDate } = {}) => {
  const where = { userId };
  if (startDate || endDate) {
    where.loggedAt = {};
    if (startDate) where.loggedAt.gte = startDate;
    if (endDate)   where.loggedAt.lte = endDate;
  }

  return prisma.mealEntry.findMany({
    where,
    orderBy: { loggedAt: 'desc' },
    skip,
    take,
  });
};

export const countHistory = (userId, { startDate, endDate } = {}) => {
  const where = { userId };
  if (startDate || endDate) {
    where.loggedAt = {};
    if (startDate) where.loggedAt.gte = startDate;
    if (endDate)   where.loggedAt.lte = endDate;
  }
  return prisma.mealEntry.count({ where });
};

export const findById = (id, userId) =>
  prisma.mealEntry.findFirst({ where: { id, userId } });

export const remove = (id) =>
  prisma.mealEntry.delete({ where: { id } });
