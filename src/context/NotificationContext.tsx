import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface StudyNotification {
    id: string;
    type: 'reminder' | 'streak' | 'achievement';
    title: string;
    message: string;
    icon: string;
    timestamp: number;
}

interface NotificationContextType {
    notifications: StudyNotification[];
    unreadCount: number;
    notificationsEnabled: boolean;
    setNotificationsEnabled: (enabled: boolean) => void;
    addNotification: (notification: Omit<StudyNotification, 'id' | 'timestamp'>) => void;
    dismissNotification: (id: string) => void;
    clearAllNotifications: () => void;
    markLastStudyTime: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

import { STORAGE_KEYS } from '../constants';

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<StudyNotification[]>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [notificationsEnabled, setNotificationsEnabledState] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED);
        return saved ? JSON.parse(saved) : true;
    });

    // Save notifications to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    }, [notifications]);

    // Save enabled state
    const setNotificationsEnabled = useCallback((enabled: boolean) => {
        setNotificationsEnabledState(enabled);
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED, JSON.stringify(enabled));
    }, []);

    // Check for study reminders on app load
    useEffect(() => {
        if (!notificationsEnabled) return;

        const lastStudy = localStorage.getItem(STORAGE_KEYS.LAST_STUDY);
        const lastVisit = localStorage.getItem(STORAGE_KEYS.LAST_VISIT);
        const now = Date.now();

        // Update last visit time
        localStorage.setItem(STORAGE_KEYS.LAST_VISIT, now.toString());

        if (lastStudy) {
            const hoursSinceStudy = (now - parseInt(lastStudy)) / (1000 * 60 * 60);
            const daysSinceStudy = Math.floor(hoursSinceStudy / 24);

            // Only show reminder if it's been a while AND this is a new session
            const isNewSession = !lastVisit || (now - parseInt(lastVisit)) > 30 * 60 * 1000; // 30 min gap

            if (isNewSession && daysSinceStudy >= 1) {
                let message = '';
                let icon = '📚';

                if (daysSinceStudy === 1) {
                    message = 'È passato un giorno dall\'ultimo studio. Continua così!';
                    icon = '💪';
                } else if (daysSinceStudy === 2) {
                    message = 'Sono 2 giorni che non studi. Non perdere il ritmo!';
                    icon = '⏰';
                } else if (daysSinceStudy >= 3 && daysSinceStudy < 7) {
                    message = `Sono ${daysSinceStudy} giorni che non studi. Il concorso si avvicina!`;
                    icon = '🔔';
                } else if (daysSinceStudy >= 7) {
                    message = `È passata più di una settimana! Riprendi a studiare oggi.`;
                    icon = '🚨';
                }

                if (message) {
                    // Add reminder notification (avoid duplicates)
                    const timeoutId = setTimeout(() => {
                        setNotifications(prev => {
                            const hasRecent = prev.some(n =>
                                n.type === 'reminder' &&
                                (now - n.timestamp) < 24 * 60 * 60 * 1000
                            );
                            if (hasRecent) return prev;

                            const newNotification: StudyNotification = {
                                id: `reminder-${now}`,
                                type: 'reminder',
                                title: 'Promemoria Studio',
                                message,
                                icon,
                                timestamp: now
                            };
                            return [newNotification, ...prev].slice(0, 10); // Keep max 10 notifications
                        });
                    }, 1000); // Small delay to avoid hydration mismatch/sync update issues
                    return () => clearTimeout(timeoutId);
                }
            }
        } else {
            // First time user - set initial study time
            localStorage.setItem(STORAGE_KEYS.LAST_STUDY, now.toString());
        }
    }, [notificationsEnabled]);

    const addNotification = useCallback((notification: Omit<StudyNotification, 'id' | 'timestamp'>) => {
        if (!notificationsEnabled) return;

        const newNotification: StudyNotification = {
            ...notification,
            id: `${notification.type}-${Date.now()}`,
            timestamp: Date.now()
        };

        setNotifications(prev => [newNotification, ...prev].slice(0, 10));
    }, [notificationsEnabled]);

    const dismissNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const clearAllNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    const markLastStudyTime = useCallback(() => {
        localStorage.setItem(STORAGE_KEYS.LAST_STUDY, Date.now().toString());
    }, []);

    const unreadCount = notifications.length;

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            notificationsEnabled,
            setNotificationsEnabled,
            addNotification,
            dismissNotification,
            clearAllNotifications,
            markLastStudyTime
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};
