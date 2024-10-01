import { Router } from "express";
import {
  forgetPassword,
  login,
  register,
  resetPassword,
  verifyPasswordResetCode,
} from "./auth.controller.js";
import { multerHost } from "../../middlewares/multer.middlware.js";
import { extenstions } from "../../utils/fileExtenstions.js";

const router = Router();

router.post(
  "/register",
  multerHost(extenstions.Images).single("image"),
  register
);
router.post("/login", login);
router.post("/forget-password", forgetPassword);
router.post("/verify-otp", verifyPasswordResetCode);
router.post("/reset-password", resetPassword);

export default router;
