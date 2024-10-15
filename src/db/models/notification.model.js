import { Schema, model } from "mongoose";

const notificationSchema = new Schema(
  {
    message: {
      type: String,
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    taskId: { type: Schema.Types.ObjectId, ref: "Task" }, // Optional: task-related notifications
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = model("Notification", notificationSchema);

export default Notification;
