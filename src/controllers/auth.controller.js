// src/controllers/auth.controller.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as userRepo from '../repositories/user.repository.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// POST /auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await userRepo.findByEmail(email);
  if (existing) {
    return sendError(res, { message: 'Email already in use', statusCode: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await userRepo.create({ name, email, passwordHash });

  const token = signToken(user.id);
  return sendSuccess(res, { data: { user, token }, message: 'Registration successful', statusCode: 201 });
});

// POST /auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await userRepo.findByEmail(email);
  if (!user) {
    return sendError(res, { message: 'Invalid email or password', statusCode: 401 });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return sendError(res, { message: 'Invalid email or password', statusCode: 401 });
  }

  // Strip passwordHash before returning
  const { passwordHash: _, ...safeUser } = user;
  const token = signToken(user.id);

  return sendSuccess(res, { data: { user: safeUser, token }, message: 'Login successful' });
});

// GET /auth/me
export const getMe = asyncHandler(async (req, res) => {
  return sendSuccess(res, { data: { user: req.user } });
});
