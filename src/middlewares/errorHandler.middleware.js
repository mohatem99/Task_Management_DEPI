import ApiError from "../utils/apiError.js";

export const asyncHandler = (API) => {
  return (req, res, next) => {
    API(req, res, next).catch((err) => next(new ApiError(err.message, 500)));
  };
};

export const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });

  next();
};
