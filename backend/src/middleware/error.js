import { logError } from '../lib/logger.js';

export const asyncHandler = (handler) => (req, res, next) => (
  Promise.resolve(handler(req, res, next)).catch(next)
);

export function errorMiddleware(error, req, res, _next) {
  logError(error, {
    method: req?.method,
    url: req?.originalUrl,
    status: error.status || 500,
  });

  res.status(error.status || 500).json({
    error: error.message || 'Error interno del servidor.',
  });
}
