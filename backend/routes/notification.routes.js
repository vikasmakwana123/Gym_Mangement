import express from "express";
import {
  getAllNotifications,
  addNotification,
  deleteNotification,
} from "../controller/notification.controller.js";

const router = express.Router();

router.get("/", getAllNotifications);

router.post("/add", addNotification);

router.delete("/:notificationId", deleteNotification);

export default router;
