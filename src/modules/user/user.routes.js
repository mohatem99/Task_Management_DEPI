import { Router } from "express";
import {
  allUsers,
  getProfile,
  updateLoggedUser,
  updateLoggedUserPassword,
} from "./user.controller.js";
import { multerHost } from "../../middlewares/multer.middlware.js";
import { extenstions } from "../../utils/fileExtenstions.js";
import auth from "../../middlewares/authentication.middleware.js";

const router = Router();

router.route("/").get(auth(), allUsers);
router.get("/me", auth(), getProfile);

router.put(
  "/update-me",
  auth(),
  multerHost(extenstions.Images).single("image"),

  updateLoggedUser
);
router.put(
  "/update-my-password",
  auth(),

  updateLoggedUserPassword
);

export default router;
