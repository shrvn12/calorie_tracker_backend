// src/middleware/auth.js
import jwt from 'jsonwebtoken';
import { sendError } from '../utils/apiResponse.js';
import * as userRepo from '../repositories/user.repository.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return sendError(res, { message: 'No token provided', statusCode: 401 });
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userRepo.findById(decoded.userId);
    if (!user) {
      return sendError(res, { message: 'User not found', statusCode: 401 });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, { message: 'Token expired', statusCode: 401 });
    }
    return sendError(res, { message: 'Invalid token', statusCode: 401 });
  }
};
