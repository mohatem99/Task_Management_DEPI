import Notification from "../../db/models/notification.model.js";
import { asyncHandler } from "../../middlewares/errorHandler.middleware.js";

export const getNotifications = asyncHandler(async (req, res, next) => {
  const notifications = await Notification.find({ recipient: req.user._id });
  res.status(200).json({ status: "success", notifications });
});

export const readNotification = asyncHandler(async (req, res, next) => {
  const { notificationId } = req.params;

  const notification = await Notification.findByIdAndUpdate(
    notificationId,
    {
      isRead: true,
    },
    { new: true }
  );
  res.status(200).json({ status: "success", notification });
});
