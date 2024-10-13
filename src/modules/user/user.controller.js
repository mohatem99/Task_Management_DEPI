import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../../db/models/user.model.js";
import { asyncHandler } from "../../middlewares/errorHandler.middleware.js";
import ApiError from "../../utils/apiError.js";
import { cloudinaryConfig } from "../../utils/cloudinary.js";

export const allUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    users,
  });
});

export const updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return next(new ApiError("Passwords do not match", 400));
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(password, 12),
      passwordChangedAt: Date.now(),
    },
    { new: true }
  );

  if (!user) {
    return next(new ApiError(`User not found for this ${id}`));
  }
  const token = jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET, {
    expiresIn: "1d",
  });
  res.status(200).json({
    status: "success",
    user,
    token,
  });
});

export const updateLoggedUser = asyncHandler(async (req, res, next) => {
  const { name, email } = req.body;

  const userExist = await User.findById(req.user._id);

  if (!userExist) {
    return next(new ApiError(`User not found for this ${id}`));
  }

  if (name) {
    userExist.name = name;
  }
  if (email) {
    userExist.email = email;
  }
  if (req.file) {
    await cloudinaryConfig().uploader.destroy(userExist.image.public_id);

    const { public_id, secure_url } = await cloudinaryConfig().uploader.upload(
      req.file.path,
      {
        folder: `Task-Management/Avaters/${userExist.customId}`,
      }
    );

    userExist.image = { public_id, secure_url };
  }

  await userExist.save();
  res.status(200).json({
    status: "success",
    user: userExist,
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new ApiError(`User not found for this ${id}`, 400));
  }
  res.status(200).json({ status: "success", user });
});
