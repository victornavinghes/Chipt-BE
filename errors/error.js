const ErrorHandler = require("../utils/errorHandler.js");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Wrong mongodb id error
  if (err.name === "CastError") {
    const message = `Resource not found, Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // Mongoose duplicate key error
  if (err.name === "MongoServerError" && err.keyValue) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
  }

  // Wrong JWT Error
  if (err.name === "JsonWebTokenError") {
    const message = `JWT Error.`;
    err = new ErrorHandler(message, 400);
  }

  // JWT Expire Error
  if (err.name === "TokenExpiredError") {
    const message = `JWT is Expired.`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    err: err.stack,
  });
};
