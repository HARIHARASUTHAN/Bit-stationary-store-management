/**
 * Centralized Express Error Handler
 */
export function errorHandler(err, req, res, next) {
  console.error('[Server Error]:', err.stack || err.message);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'An internal server error occurred.';

  res.status(statusCode).json({
    error: err.name || 'InternalServerError',
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}
