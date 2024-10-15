import Category from "../../db/models/category.model.js";
import Task from "../../db/models/task.model.js";
import User from "../../db/models/user.model.js";
import Notification from "../../db/models/notification.model.js";
import { asyncHandler } from "../../middlewares/errorHandler.middleware.js";
import ApiError from "../../utils/apiError.js";
import { getSocket } from "../../utils/socket.io.utils.js";

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
  console.log(category);
  if (!category) {
    return next(new ApiError(`no category found with id ${id}`, 404));
  }

  const assignedUser = await User.findById(assignedTo);

  if (!assignedUser) {
    return next(new ApiError(`no user found with id ${assignedTo}`, 404));
  }

  const newTask = await Task.create({
    title,
    description,
    dueDate: Date(dueDate),
    priority,
    status,
    category: category._id,
    assignedTo: assignedUser._id,
    createdBy: req.user._id,
  });

  const notificationData = await Notification.create({
    message: `You have been assigned a new task: ${title}`,
    recipient: assignedUser._id,
  });

  let io = getSocket();

  // Emit a socket event to notify the assigned user in real-time
  if (assignedTo.toString() != req.user._id.toString()) {
    io.to(assignedTo).emit("taskAssigned", {
      message: notificationData.message,
      task: newTask,
    });
    io.to(assignedTo).emit("task", {
      message: notificationData.message,
      task: newTask,
    });
  }
  res.status(201).json({
    status: "success",
    message: "Task created successfully",
    newTask,
  });
});

export const getTasks = asyncHandler(async (req, res, next) => {
  const tasks = await Task.find({
    $or: [{ createdBy: req.user._id }, { assignedTo: req.user._id }],
  }).populate("createdBy assignedTo category");
  console.log(tasks);

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

    priority,
    status,
    categoryId,
    assignedTo,
  } = req.body;
  const taskExist = await Task.findById(id);
  if (!taskExist) {
    return next(new ApiError(`no task found with id ${id}`, 404));
  }
  // need to check if the user created the task or assigned to it to update
  console.log(taskExist.createdBy.toString() !== req.user._id.toString());
  console.log(taskExist.assignedTo.toString() !== req.user._id.toString());
  if (
    taskExist.createdBy.toString() !== req.user._id.toString() &&
    taskExist.assignedTo.toString() !== req.user._id.toString()
  ) {
    return next(
      new ApiError(`You are not authorized to update this Task`, 403)
    );
  }
  // Check if assignedTo has changed and if assignedTo is different from createdBy
  const isAssignedToChanged =
    assignedTo && assignedTo !== String(taskExist.assignedTo);
  const isAssignedToDifferentFromCreatedBy =
    assignedTo && assignedTo !== String(taskExist.createdBy);

  const newTask = await Task.findByIdAndUpdate(
    id,
    {
      title,
      description,

      priority,
      status,
      categoryId,
      assignedTo,
    },
    { new: true }
  );

  if (isAssignedToChanged && isAssignedToDifferentFromCreatedBy) {
    console.log("hi");
    const io = getSocket();
    const notificationData = await Notification.create({
      message: `You have been assigned a new task: ${title}`,
      recipient: assignedTo,
    }); // Emit a socket event to notify the assigned user in real-time
    io.to(assignedTo.toString()).emit("taskAssigned", {
      message: notificationData.message,
      task: newTask,
    });
  }
  res.status(200).json({
    status: "success",
    message: "Task updated successfully",
    newTask,
  });
});

export const deleteTask = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const taskExist = await Task.findById(id);
  if (!taskExist) {
    return next(new ApiError(`no task found with id ${id}`, 404));
  }
  // need to check if the user created the task to delete
  if (taskExist.createdBy.toString() !== req.user._id.toString()) {
    return next(
      new ApiError(`You are not authorized to delete this Task`, 403)
    );
  }

  await Task.findByIdAndDelete(id);
  res.status(200).json({
    status: "success",
    message: "Task deleted successfully",
  });
});
export const tasksStats = asyncHandler(async (req, res, next) => {
  const userId = req.user._id; // The authenticated user's ID from the token
  console.log(userId);
  // Fetch task stats for the authenticated user only
  const completed = await Task.countDocuments({
    status: "completed",
    createdBy: userId,
  });
  console.log(completed);
  const inProgress = await Task.countDocuments({
    status: "in progress",
    createdBy: userId,
  });
  const pending = await Task.countDocuments({ status: "pending", userId });

  const highPriority = await Task.countDocuments({
    priority: "high",
    createdBy: userId,
  });
  const mediumPriority = await Task.countDocuments({
    priority: "medium",
    createdBy: userId,
  });
  const lowPriority = await Task.countDocuments({
    priority: "low",
    createdBy: userId,
  });

  const categories = await Task.aggregate([
    { $match: { createdBy: userId } }, // Only include tasks for the authenticated user
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);

  const tasksByDate = await Task.aggregate([
    { $match: { createdBy: userId } }, // Only include tasks for the authenticated user
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Using createdAt added by timestamps: true
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } }, // Sort by date
  ]);

  const stats = {
    statusStats: { completed, inProgress, pending },
    priorityStats: { highPriority, mediumPriority, lowPriority },
    categoryStats: categories,
    tasksByDate,
  };

  res.status(200).json({ status: "success", stats });
  // const userId = req.user._id; // The authenticated user's ID from the token

  // const stats = await Task.aggregate([
  //   {
  //     $match: { userId: userId }, // Match only tasks belonging to the authenticated user
  //   },
  //   {
  //     $facet: {
  //       statusStats: [
  //         {
  //           $group: {
  //             _id: "$status",
  //             count: { $sum: 1 },
  //           },
  //         },
  //       ],
  //       priorityStats: [
  //         {
  //           $group: {
  //             _id: "$priority",
  //             count: { $sum: 1 },
  //           },
  //         },
  //       ],
  //       categoryStats: [
  //         {
  //           $group: {
  //             _id: "$category",
  //             count: { $sum: 1 },
  //           },
  //         },
  //       ],
  //       tasksByDate: [
  //         {
  //           $group: {
  //             _id: {
  //               $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
  //             },
  //             count: { $sum: 1 },
  //           },
  //         },
  //         { $sort: { _id: 1 } }, // Sort by date in ascending order
  //       ],
  //     },
  //   },
  // ]);

  // const structuredStats = {
  //   statusStats: {
  //     completed:
  //       stats[0].statusStats.find((s) => s._id === "Completed")?.count || 0,
  //     inProgress:
  //       stats[0].statusStats.find((s) => s._id === "In Progress")?.count || 0,
  //     pending:
  //       stats[0].statusStats.find((s) => s._id === "Pending")?.count || 0,
  //   },
  //   priorityStats: {
  //     highPriority:
  //       stats[0].priorityStats.find((p) => p._id === "High")?.count || 0,
  //     mediumPriority:
  //       stats[0].priorityStats.find((p) => p._id === "Medium")?.count || 0,
  //     lowPriority:
  //       stats[0].priorityStats.find((p) => p._id === "Low")?.count || 0,
  //   },
  //   categoryStats: stats[0].categoryStats,
  //   tasksByDate: stats[0].tasksByDate,
  // };

  res.json(structuredStats);
});

export const getTask = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const taskExist = await Task.findById(id).populate(
    "createdBy assignedTo category"
  );
  if (!taskExist) {
    return next(new ApiError(`no task found with id ${id}`, 404));
  }

  res.status(200).json({
    status: "success",
    task: taskExist,
  });
});
