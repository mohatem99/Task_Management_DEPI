import ApiError from "../utils/apiError.js";

export const asyncHandler = (API) => {
  return (req, res, next) => {
    API(req, res, next).catch((err) =>
      next(new ApiError(err.message, err.statusCode))
    );
  };
};

export const globalError = (err, req, res, next) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });

  next();
};
