// src/middleware/validate.js
import { sendError } from '../utils/apiResponse.js';

/**
 * Factory that returns an Express middleware validating req.body against a Zod schema.
 * @param {import('zod').ZodSchema} schema
 * @returns {import('express').RequestHandler}
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field:   e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, { message: 'Validation failed', statusCode: 422, errors });
  }
  req.body = result.data; // replace with coerced/parsed data
  next();
};

/**
 * Validate req.query against a Zod schema.
 */
export const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field:   e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, { message: 'Invalid query parameters', statusCode: 422, errors });
  }
  req.query = result.data;
  next();
};
