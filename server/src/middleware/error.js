import { env } from '../config/env.js';
import ApiError from '../utils/ApiError.js';

export const notFoundHandler = (req, _res, next) =>
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  let error = err;

  if (err.name === 'ValidationError') {
    error = ApiError.badRequest(
      'Validation failed',
      Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }))
    );
  } else if (err.name === 'CastError') {
    error = ApiError.badRequest(`Invalid value for "${err.path}"`);
  } else if (err.code === 11000) {
    error = ApiError.conflict(`Duplicate value for ${Object.keys(err.keyValue).join(', ')}`);
  }

  const statusCode = error.statusCode || 500;
  if (statusCode >= 500 && !env.isProd) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Something went wrong',
    ...(error.details ? { details: error.details } : {}),
    ...(env.isProd ? {} : { stack: err.stack }),
  });
};
