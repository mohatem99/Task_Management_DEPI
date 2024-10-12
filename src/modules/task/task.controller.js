import Category from "../../db/models/category.model.js";
import Task from "../../db/models/task.model.js";
import { asyncHandler } from "../../middlewares/errorHandler.middleware.js";
import ApiError from "../../utils/apiError.js";

export const createTask = asyncHandler(async (req, res, next) => {
  const {
    title,
    description,

    dueDate,
    priority,
    status,
    categoryId,
    assignedTo,
  } = req.body;

  const category = await Category.findById(categoryId);
  if (!category) {
    return next(new ApiError(`no category found with id ${id}`, 404));
  }

  const assignedUser = await User.findById(assignedTo);

  if (!assignedUser) {
    return next(new ApiError(`no user found with id ${assignedTo}`, 404));
  }

  const task = await Task.create({
    title,
    description,
    dueDate,
    priority,
    status,
    category: category._id,
    assignedTo: assignedUser._id,
    createdBy: req.user._id,
  });

  res.status(201).json({
    status: "success",
    message: "Task created successfully",
    task,
  });
});

export const getTasks = asyncHandler(async (req, res, next) => {
  const tasks = await Task.find();

  res.status(200).json({
    status: "success",
    tasks,
  });
});

export const updateTask = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const {
    title,
    description,
    dueDate,
    priority,
    status,
    categoryId,
    assignedTo,
  } = req.body;

  const task = await Task.findByIdAndUpdate(
    id,
    {
      title,
      description,
      dueDate,
      priority,
      status,
      categoryId,
      assignedTo,
    },
    { new: true }
  );

  if (task.assignedTo) {
  }
  res.status(200).json({
    status: "success",
    message: "Task updated successfully",
    task,
  });
});
