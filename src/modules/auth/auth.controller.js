import crypto from "crypto";
import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { customAlphabet } from "nanoid";
import User from "../../db/models/user.model.js";
import { asyncHandler } from "../../middlewares/errorHandler.middleware.js";

import ApiError from "../../utils/apiError.js";

import { sendMail } from "../../services/sendEmail.service.js";
import { cloudinaryConfig } from "../../utils/cloudinary.js";
import { mailBody } from "../../utils/mailTemplate.js";
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return next(new ApiError("user already exists", 409));
  }

  if (!req.file) {
    return next(new ApiError("Image is required", 404));
  }

  const customId = nanoid(5);

  const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(
    req.file.path,
    {
      folder: `Task-Management/Avaters/${customId}`,
    }
  );
  const user = await User.create({
    email,
    name,
    password,
    image: { secure_url, public_id },
  });
  res.status(201).json({
    status: "success",
    message: "User created successfully",
    user,
  });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new ApiError("Invalid email or password", 401));
  }
  const token = jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET, {
    expiresIn: "1d",
  });
  delete user._doc.password;

  res.json({
    status: "success",
    message: "Logged in successfully",
    user,
    token,
  });
});

export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new ApiError(`There is no user with that email ${email}`, 404));
  }

  const code = customAlphabet("0123456789", 6);
  const otp = code();

  const hashedResetCode = crypto.createHash("sha256").update(otp).digest("hex");

  console.log(hashedResetCode);
  // Add expiration time for password reset code (10 min)
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;
  user.otp = hashedResetCode;

  await user.save();

  try {
    await sendMail({
      to: email,
      subject: "Code to reset password",

      htmlMessage: mailBody(otp),
    });
  } catch (err) {
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;
    user.otp = undefined;
    await user.save();
    return next(new ApiError("there is error in sending mail", 500));
  }

  res.status(200).json({
    status: "success",
    message: "Password reset code sent successfully",
  });
});
export const verifyPasswordResetCode = asyncHandler(async (req, res, next) => {
  const { resetCode } = req.body;
  console.log(resetCode);
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");
  console.log(hashedResetCode);

  const user = await User.findOne({
    otp: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  console.log(user);
  if (!user) {
    return next(new ApiError("Reset code invalid or expired"));
  }
  user.passwordResetVerified = true;
  await user.save();
  res.status(200).json({
    status: "success",
    message: "Password reset code verified successfully",
  });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, newPassword } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new ApiError(`There is no user with email ${email}`, 404));
  }
  // 2) Check if reset code verified
  if (!user.passwordResetVerified) {
    return next(new ApiError("Reset code not verified", 400));
  }

  user.password = newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;

  await user.save();
  const token = jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET, {
    expiresIn: "1d",
  });

  res.json({
    status: "success",

    user,
    token,
  });
});
