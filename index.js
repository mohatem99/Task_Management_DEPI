import express from "express";
import cors from "cors";
import { config } from "dotenv";
import dbConnection from "./src/db/dbconnection.js";

import authRoutes from "./src/modules/auth/auth.routes.js";

import ApiError from "./src/utils/apiError.js";
import { globalError } from "./src/middlewares/errorHandler.middleware.js";
config();

dbConnection();
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to Task Management Api😍😎");
});

app.use("/api/auth", authRoutes);

app.use("*", (req, res, next) => {
  return next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

app.use(globalError);
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`server up and running on port ${PORT}`));
