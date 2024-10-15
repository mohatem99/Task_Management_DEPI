import { Router } from "express";
import {
  createTask,
  deleteTask,
  getTasks,
  tasksStats,
  updateTask,
  getTask,
} from "./task.controller.js";
import auth from "../../middlewares/authentication.middleware.js";

const router = Router();
router.route("/").post(auth(), createTask).get(auth(), getTasks);
router
  .route("/:id")
  .put(auth(), updateTask)
  .delete(auth(), deleteTask)
  .get(auth(), getTask);
router.get("/stats", auth(), tasksStats);
export default router;
