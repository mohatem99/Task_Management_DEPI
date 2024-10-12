import { Router } from "express";
import auth from "../../middlewares/authentication.middleware.js";
import {
  createCategory,
  deleteUserCategory,
  getUserCategories,
  updateUserCategory,
  getUserCategory,
} from "./category.controller.js";

const router = Router();
router.route("/").get(auth(), getUserCategories).post(auth(), createCategory);
router
  .route("/:id")
  .get(auth(), getUserCategory)
  .put(auth(), updateUserCategory)
  .delete(auth(), deleteUserCategory);

export default router;
