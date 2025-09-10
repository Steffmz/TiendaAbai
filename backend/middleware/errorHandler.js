const { ApiError, InternalServerError } = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error(err);
  const internalError = new InternalServerError();
  res.status(internalError.statusCode).json({ error: internalError.message });
};

module.exports = errorHandler;
