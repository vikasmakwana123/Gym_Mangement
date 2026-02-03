import express from "express";
import {
  getAllNotifications,
  addNotification,
  deleteNotification,
} from "../controller/notification.controller.js";

const router = express.Router();

// Get all notifications
router.get("/", getAllNotifications);

// Add new notification (Admin only)
router.post("/add", addNotification);

// Delete notification (Admin only)
router.delete("/:notificationId", deleteNotification);

export default router;
