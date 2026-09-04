// Centralized, safe error handler
const errorHandler = (err, req, res, next) => {
  // Structured safe server log
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, {
    message: err.message,
    name: err.name,
    code: err.code
  });

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(400).json({
      success: false,
      message: `An account with that ${field} already exists. Try signing in instead.`
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: messages[0] || 'Invalid input data provided.',
      errors: messages
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.'
    });
  }

  // CastError (Invalid MongoDB ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Requested resource identifier is malformed.'
    });
  }

  // Default server error (No stack trace leakage to client)
  res.status(err.status || 500).json({
    success: false,
    message: err.isOperational ? err.message : 'An unexpected error occurred. Please try again later.'
  });
};

module.exports = errorHandler;
