export const asyncHandler = (handler) => (req, res, next) => (
  Promise.resolve(handler(req, res, next)).catch(next)
);

export function errorMiddleware(error, _req, res, _next) {
  console.error(error);
  res.status(error.status || 500).json({
    error: error.message || 'Error interno del servidor.',
  });
}
