import React from 'react';
import { X, Bell } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import './StudyNotification.css';

export const StudyNotificationBanner: React.FC = () => {
    const { notifications, dismissNotification, notificationsEnabled } = useNotifications();

    // Get the most recent reminder notification
    const latestReminder = notifications.find(n => n.type === 'reminder');

    if (!notificationsEnabled || !latestReminder) return null;

    return (
        <div className="study-notification-banner">
            <div className="notification-icon">
                <span>{latestReminder.icon}</span>
            </div>
            <div className="notification-content">
                <strong>{latestReminder.title}</strong>
                <p>{latestReminder.message}</p>
            </div>
            <button
                className="notification-dismiss"
                onClick={() => dismissNotification(latestReminder.id)}
                aria-label="Chiudi notifica"
            >
                <X size={18} />
            </button>
        </div>
    );
};

export const NotificationBadge: React.FC = () => {
    const { unreadCount, notificationsEnabled } = useNotifications();

    if (!notificationsEnabled || unreadCount === 0) return null;

    return (
        <span className="notification-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
        </span>
    );
};

export const NotificationBell: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
    const { unreadCount, notificationsEnabled } = useNotifications();

    return (
        <button className="notification-bell" onClick={onClick}>
            <Bell size={20} />
            {notificationsEnabled && unreadCount > 0 && (
                <span className="notification-dot" />
            )}
        </button>
    );
};
