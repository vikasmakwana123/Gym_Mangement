import { db } from "../firebase.js";

/**
 * Get all notifications
 */
export const getAllNotifications = async (req, res) => {
  try {
    const notificationsSnapshot = await db.collection("notifications").orderBy("createdAt", "desc").get();
    const notifications = [];

    notificationsSnapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Add a new notification
 */
export const addNotification = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required" });
    }

    const notificationRef = await db.collection("notifications").add({
      title,
      description,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      message: "Notification created successfully",
      id: notificationRef.id,
    });
  } catch (error) {
    console.error("Error adding notification:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    if (!notificationId) {
      return res.status(400).json({ error: "Notification ID is required" });
    }

    await db.collection("notifications").doc(notificationId).delete();

    res.status(200).json({
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: error.message });
  }
};
