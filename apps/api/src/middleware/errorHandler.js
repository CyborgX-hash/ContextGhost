import { errorResponse } from '../utils/response.js';

export function notFoundHandler(req, res) {
  return errorResponse(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

export function errorHandler(err, req, res, next) {
  // Do not leak internal stack traces or secrets to clients
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  if (process.env.NODE_ENV !== 'test') {
    console.error(`[API Error] ${req.method} ${req.originalUrl}:`, err);
  }

  return errorResponse(
    res,
    message,
    statusCode,
    err.errors || (process.env.NODE_ENV === 'development' ? err.details : undefined)
  );
}
