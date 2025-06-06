const logger = require('../utils/logger');
const logErrorToDatabase = require('../utils/errorLogger');

const errorHandler = async (err, req, res, next) => {
  // Log to database
  await logErrorToDatabase(req.method, req.url, err.message, err.stack);

  // Log error to console or file
  logger.error(`[${req.method}] ${req.url} - ${err.message}`);

  // Send response
  res.status(err.status || 500).json({
    error: {
      status: err.status || 500,
      message: err.message || 'Internal Server Error',
    },
  });
};

module.exports = errorHandler;
