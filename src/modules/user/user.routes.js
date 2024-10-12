import { Router } from "express";
import { allUsers } from "./user.controller.js";
const router = Router();

router.route("/").get(allUsers);

export default router;
