const { sendError } = require('../utils/responseHandler');

/**
 * 404 Handler for undefined routes
 */
const notFoundHandler = (req, res, next) => {
  return sendError(res, `Route ${req.originalUrl} not found`, 404);
};

/**
 * Global Error Handler
 */
const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Error:', err);
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  return sendError(res, message, statusCode);
};

module.exports = {
  notFoundHandler,
  errorHandler
};
