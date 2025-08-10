const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    message: err.message || 'Internal Server Error',
    statusCode: err.statusCode || 500
  };

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    error = {
      message: 'Validation Error',
      errors: messages,
      statusCode: 400
    };
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = {
      message: `${field} already exists`,
      statusCode: 400
    };
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    error = {
      message: 'Invalid ID format',
      statusCode: 400
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token',
      statusCode: 401
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Token expired',
      statusCode: 401
    };
  }

  // Blockchain/Web3 errors
  if (err.message && err.message.includes('blockchain')) {
    error = {
      message: 'Blockchain operation failed',
      details: err.message,
      statusCode: 503
    };
  }

  if (err.message && err.message.includes('network')) {
    error = {
      message: 'Network connection failed',
      details: err.message,
      statusCode: 503
    };
  }

  // File operation errors
  if (err.code === 'ENOENT') {
    error = {
      message: 'File not found',
      statusCode: 404
    };
  }

  if (err.code === 'EACCES') {
    error = {
      message: 'Permission denied',
      statusCode: 403
    };
  }

  // Rate limiting errors
  if (err.status === 429) {
    error = {
      message: 'Too many requests',
      statusCode: 429
    };
  }

  // Send error response
  res.status(error.statusCode).json({
    success: false,
    error: {
      message: error.message,
      ...(error.errors && { errors: error.errors }),
      ...(error.details && { details: error.details }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

module.exports = {
  errorHandler
};






