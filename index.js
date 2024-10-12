import express from "express";
import cors from "cors";
import { config } from "dotenv";
import dbConnection from "./src/db/dbconnection.js";

import authRoutes from "./src/modules/auth/auth.routes.js";
import categoryRoutes from "./src/modules/category/category.routes.js";
import usersRoutes from "./src/modules/user/user.routes.js";

import taskRoutes from "./src/modules/task/task.routes.js";
import ApiError from "./src/utils/apiError.js";

import { globalError } from "./src/middlewares/errorHandler.middleware.js";
import {
  establishSocketConnection,
  getSocket,
} from "./src/utils/socket.io.utils.js";
config();

dbConnection();
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to Task Management Api😍😎");
});

app.use("/api/auth", authRoutes);

app.use("/api/users", usersRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tasks", taskRoutes);

app.use(globalError);
const PORT = process.env.PORT || 3000;
app.use("*", (req, res, next) => {
  return next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

const server = app.listen(PORT, () =>
  console.log(`server up and running on port ${PORT}`)
);
let io = establishSocketConnection(server);

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
