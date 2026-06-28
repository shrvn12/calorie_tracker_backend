// src/utils/asyncHandler.js

/**
 * Wraps async route handlers to catch errors and forward to Express error handler.
 * @param {Function} fn - Async route handler
 * @returns {Function} Express middleware
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
