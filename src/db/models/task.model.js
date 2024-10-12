import { Schema, model } from "mongoose";

const taskSchmea = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },

    dueDate: { type: Date },
    priority: { type: String, enum: ["low", "medium", "high"], default: "Low" },
    status: {
      type: String,
      enum: ["pending", "in progress", "completed"],
      default: "Pending",
    },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Task = model("Task", taskSchmea);
export default Task;
