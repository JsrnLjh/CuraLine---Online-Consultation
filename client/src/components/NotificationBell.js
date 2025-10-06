import React, { useState } from 'react';
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import './NotificationBell.css';

function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleMarkAsRead = (e, notificationId) => {
    e.stopPropagation();
    markAsRead(notificationId);
  };

  const handleDelete = (e, notificationId) => {
    e.stopPropagation();
    deleteNotification(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
        return '📅';
      case 'cancellation':
        return '❌';
      case 'reschedule':
        return '🔄';
      case 'reminder':
        return '⏰';
      case 'completion':
        return '✅';
      default:
        return '📢';
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return time.toLocaleDateString();
  };

  return (
    <div className="notification-bell-container">
      <button className="notification-bell" onClick={toggleDropdown}>
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead} className="mark-all-read">
                <CheckCheck size={16} />
                Mark all read
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <Bell size={48} color="#d1d5db" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <span className="notification-time">{getTimeAgo(notification.createdAt)}</span>
                  </div>
                  <div className="notification-actions">
                    {!notification.read && (
                      <button 
                        onClick={(e) => handleMarkAsRead(e, notification.id)}
                        className="action-btn"
                        title="Mark as read"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button 
                      onClick={(e) => handleDelete(e, notification.id)}
                      className="action-btn delete"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
