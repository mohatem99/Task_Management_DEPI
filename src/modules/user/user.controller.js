import User from "../../db/models/user.model.js";
import { asyncHandler } from "../../middlewares/errorHandler.middleware.js";

export const allUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    users,
  });
});
