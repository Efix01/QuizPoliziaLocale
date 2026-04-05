import React from 'react';
import { X, Bell } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

export const StudyNotificationBanner: React.FC = () => {
    const { notifications, dismissNotification, notificationsEnabled } = useNotifications();

    // Get the most recent reminder notification
    const latestReminder = notifications.find(n => n.type === 'reminder');

    if (!notificationsEnabled || !latestReminder) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                style={{
                    position: 'fixed',
                    top: '1rem',
                    left: '1rem',
                    right: '1rem',
                    maxWidth: '400px',
                    margin: '0 auto',
                    zIndex: 5000,
                    background: 'rgba(30, 41, 59, 0.95)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid #334155',
                    borderRadius: '20px',
                    padding: '1rem',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}
            >
                <div style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    color: '#3b82f6',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    flexShrink: 0
                }}>
                    {latestReminder.icon}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#f8fafc', marginBottom: '0.1rem' }}>
                        {latestReminder.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4 }}>
                        {latestReminder.message}
                    </div>
                </div>
                <button
                    onClick={() => dismissNotification(latestReminder.id)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#64748b',
                        padding: '0.25rem',
                        cursor: 'pointer',
                        display: 'flex'
                    }}
                >
                    <X size={18} />
                </button>
            </motion.div>
        </AnimatePresence>
    );
};

export const NotificationBadge: React.FC = () => {
    const { unreadCount, notificationsEnabled } = useNotifications();

    if (!notificationsEnabled || unreadCount === 0) return null;

    return (
        <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            minWidth: '18px',
            height: '18px',
            background: '#ef4444',
            color: '#fff',
            borderRadius: '10px',
            fontSize: '10px',
            fontWeight: '900',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            border: '2px solid #0f172a',
            boxShadow: '0 0 10px rgba(239, 68, 68, 0.4)'
        }}>
            {unreadCount > 9 ? '9+' : unreadCount}
        </span>
    );
};

export const NotificationBell: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
    const { unreadCount, notificationsEnabled } = useNotifications();

    return (
        <button 
            onClick={onClick}
            style={{
                position: 'relative',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                color: '#94a3b8',
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.color = '#f8fafc';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.color = '#94a3b8';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
            }}
        >
            <Bell size={20} />
            {notificationsEnabled && unreadCount > 0 && (
                <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        width: '8px',
                        height: '8px',
                        background: '#ef4444',
                        borderRadius: '50%',
                        border: '1px solid #1e293b'
                    }}
                />
            )}
        </button>
    );
};
