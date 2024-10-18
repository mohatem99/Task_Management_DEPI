import { Schema, model } from "mongoose";

const taskSchmea = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },

    dueDate: { type: Date, required: true },
    priority: { type: String, enum: ["low", "medium", "high"], default: "Low" },
    status: {
      type: String,
      enum: ["pending", "in progress", "completed"],
      default: "Pending",
    },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Task = model("Task", taskSchmea);
export default Task;
