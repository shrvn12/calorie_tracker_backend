// src/repositories/water.repository.js
import prisma from '../config/db.js';

export const create = (data) =>
  prisma.waterLog.create({ data });

export const findById = (id, userId) =>
  prisma.waterLog.findFirst({ where: { id, userId } });

export const remove = (id) =>
  prisma.waterLog.delete({ where: { id } });
