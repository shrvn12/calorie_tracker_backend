// src/middleware/errorHandler.js
import { sendError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  logger.error(
    { err: { message: err.message, stack: err.stack }, path: req.path, method: req.method },
    'Unhandled error'
  );

  // Prisma known errors
  if (err.code === 'P2002') {
    return sendError(res, {
      message: `A record with that ${err.meta?.target?.join(', ')} already exists.`,
      statusCode: 409,
    });
  }

  if (err.code === 'P2025') {
    return sendError(res, { message: 'Record not found', statusCode: 404 });
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return sendError(res, { message: 'File too large. Maximum size is 5 MB.', statusCode: 413 });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, { message: 'Invalid token', statusCode: 401 });
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, { message: 'Token expired', statusCode: 401 });
  }

  // Generic multer error
  if (err.message?.includes('Only JPEG')) {
    return sendError(res, { message: err.message, statusCode: 400 });
  }

  const statusCode = err.statusCode ?? 500;
  const message    = statusCode < 500 ? err.message : 'Internal server error';

  return sendError(res, { message, statusCode });
};
