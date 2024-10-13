import { Router } from "express";
import {
  createTask,
  deleteTask,
  getTasks,
  tasksStats,
  updateTask,
} from "./task.controller.js";
import auth from "../../middlewares/authentication.middleware.js";

const router = Router();
router.route("/").post(auth(), createTask).get(auth(), getTasks);
router.route("/:id").put(auth(), updateTask).delete(auth(), deleteTask);
router.get("/stats", auth(), tasksStats);
export default router;
