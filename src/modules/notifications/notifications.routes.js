import { Router } from "express";
import auth from "../../middlewares/authentication.middleware.js";
import {
  getNotifications,
  readNotification,
} from "./notifications.controller.js";

const router = Router();

router.get("/", auth(), getNotifications);
router.put("/:notificationId", auth(), readNotification);

export default router;
