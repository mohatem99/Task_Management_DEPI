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

  let io = getSocket();
  console.log(assignedTo.toString() != req.user._id.toString());

  // Emit a socket event to notify the assigned user in real-time
  if (assignedTo.toString() != req.user._id.toString()) {
    const notificationData = await Notification.create({
      message: `You have been assigned a new task: ${title}`,
      recipient: assignedUser._id,
    });
    console.log(assignedTo);
    io.to(assignedTo).emit("taskAssigned", {
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

 // Fetch task stats for both created by the user and assigned to the user
 const completed = await Task.countDocuments({
   status: "completed",
   $or: [{ createdBy: userId }, { assignedTo: userId }],
 });

 const inProgress = await Task.countDocuments({
   status: "in progress",
   $or: [{ createdBy: userId }, { assignedTo: userId }],
 });

 const pending = await Task.countDocuments({
   status: "pending",
   $or: [{ createdBy: userId }, { assignedTo: userId }],
 });

 const highPriority = await Task.countDocuments({
   priority: "high",
   $or: [{ createdBy: userId }, { assignedTo: userId }],
 });

 const mediumPriority = await Task.countDocuments({
   priority: "medium",
   $or: [{ createdBy: userId }, { assignedTo: userId }],
 });

 const lowPriority = await Task.countDocuments({
   priority: "low",
   $or: [{ createdBy: userId }, { assignedTo: userId }],
 });

 // Group by categories (for tasks either created by or assigned to the user)
 const categories = await Task.aggregate([
   {
     $match: {
       $or: [{ createdBy: userId }, { assignedTo: userId }],
     },
   },
   { $group: { _id: "$category", count: { $sum: 1 } } },
 ]);

 // Group tasks by creation date (for tasks either created by or assigned to the user)
 const tasksByDate = await Task.aggregate([
   {
     $match: {
       $or: [{ createdBy: userId }, { assignedTo: userId }],
     },
   },
   {
     $group: {
       _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
       count: { $sum: 1 },
     },
   },
   { $sort: { _id: 1 } },
 ]);

 const stats = {
   statusStats: { completed, inProgress, pending },
   priorityStats: { highPriority, mediumPriority, lowPriority },
   categoryStats: categories,
   tasksByDate,
 };

 res.status(200).json({ status: "success", stats });

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
