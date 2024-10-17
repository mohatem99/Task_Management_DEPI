import Category from "../../db/models/category.model.js";

import Task from "../../db/models/task.model.js";
import { asyncHandler } from "../../middlewares/errorHandler.middleware.js";
import ApiError from "../../utils/apiError.js";

export const createCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  const category = await Category.create({ name, createdBy: req.user._id });

  res.status(201).json({
    status: "success",

    message: "Category created successfully",
    category,
  });
});

export const getUserCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find({ createdBy: req.user._id });

  res.status(200).json({
    status: "success",
    categories,
  });
});

export const updateUserCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  const category = await Category.findById(id);

  if (!category)
    return next(new ApiError(`no category found with id ${id}`, 404));

  if (category.createdBy.toString() !== req.user._id.toString()) {
    return next(
      new ApiError(`You are not authorized to update this category`, 403)
    );
  }
  const newCategory = await Category.findByIdAndUpdate(
    id,
    { name },
    { new: true }
  );

  res.status(200).json({ status: "success", newCategory });
});

export const deleteUserCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category)
    return next(new ApiError(`no category found with id ${id}`, 404));

  if (category.createdBy.toString() !== req.user._id.toString()) {
    return next(
      new ApiError(`You are not authorized to delete this category`, 403)
    );
  }

  await Category.findByIdAndDelete(id);
  // Delete the tasks related to the deleted category
  await Task.deleteMany({ category: id });
  res
    .status(200)
    .json({ status: "success", message: "Category and related tasks deleted" });
});

export const getUserCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const category = await Category.findById(id);
  if (!category)
    return next(new ApiError(`no category found with id ${id}`, 404));
  if (category.createdBy.toString() !== req.user._id.toString()) {
    return next(
      new ApiError(`You are not authorized to get this category`, 403)
    );
  }
  res.status(200).json({ status: "success", category });
});
