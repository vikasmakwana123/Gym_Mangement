import React, { useState, useEffect } from "react";
import "../styles/NotificationsPanel.css";

/**
 * NotificationsPanel Component
 * Displays notifications for members with modal details
 */
const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/notifications");

      if (!response.ok) throw new Error("Failed to fetch notifications");

      const data = await response.json();
      setNotifications(data || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="notifications-panel loading">Loading notifications...</div>;
  }

  if (error) {
    return <div className="notifications-panel error">Error: {error}</div>;
  }

  return (
    <>
      <div className="notifications-panel-container h-[100vh]">
        <div className="notifications-header">
          <h3 className="flex items-center justify-center gap-4"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-bell-ring-icon lucide-bell-ring"><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M22 8c0-2.3-.8-4.3-2-6"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/><path d="M4 2C2.8 3.7 2 5.7 2 8"/></svg>  Notifications</h3>
          <span className="notification-count">{notifications.length}</span>
        </div>

        {notifications.length === 0 ? (
          <div className="no-notifications">
            <p>No notifications at the moment</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="notification-item"
                onClick={() => setSelectedNotification(notification)}
              >
                <div className="notification-icon">📌</div>
                <div className="notification-content">
                  <h4>{notification.title}</h4>
                  <p>{notification.description.substring(0, 80)}...</p>
                  <span className="notification-date">
                    {new Date(notification.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notification Modal */}
      {selectedNotification && (
        <div className="notification-modal-overlay" onClick={() => setSelectedNotification(null)}>
          <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📌 {selectedNotification.title}</h2>
              <button
                className="close-btn"
                onClick={() => setSelectedNotification(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-description">{selectedNotification.description}</p>
              <p className="modal-date">
                Posted on: {new Date(selectedNotification.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </p>
            </div>

            <div className="modal-footer">
              <button
                className="modal-close-btn"
                onClick={() => setSelectedNotification(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationsPanel;
