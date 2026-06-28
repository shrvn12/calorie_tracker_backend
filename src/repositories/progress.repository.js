// src/repositories/progress.repository.js
import prisma from '../config/db.js';

// ── Weight Logs ──────────────────────────────────────────────────────────────

export const createWeightLog = (data) =>
  prisma.weightLog.create({ data });

export const findWeightHistory = (userId, { skip = 0, take = 30 } = {}) =>
  prisma.weightLog.findMany({
    where:   { userId },
    orderBy: { loggedAt: 'desc' },
    skip,
    take,
  });

// ── Daily Logs (calendar / history) ─────────────────────────────────────────

export const findDailyLogs = (userId, { start, end } = {}) =>
  prisma.dailyLog.findMany({
    where: {
      userId,
      ...(start || end
        ? { date: { ...(start && { gte: start }), ...(end && { lte: end }) } }
        : {}),
    },
    orderBy: { date: 'desc' },
  });

export const findDailyLogByDate = (userId, date) =>
  prisma.dailyLog.findUnique({
    where: { userId_date: { userId, date } },
  });
