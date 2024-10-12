import { Router } from "express";
import { createTask } from "./task.controller.js";
import auth from "../../middlewares/authentication.middleware.js";

const router = Router();
router.post("/", auth(), createTask);
export default router;
