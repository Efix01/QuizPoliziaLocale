import { createContext, useContext } from 'react';

export interface StudyNotification {
    id: string;
    type: 'reminder' | 'streak' | 'achievement';
    title: string;
    message: string;
    icon: string;
    timestamp: number;
}

export interface NotificationContextType {
    notifications: StudyNotification[];
    unreadCount: number;
    notificationsEnabled: boolean;
    setNotificationsEnabled: (enabled: boolean) => void;
    addNotification: (notification: Omit<StudyNotification, 'id' | 'timestamp'>) => void;
    dismissNotification: (id: string) => void;
    clearAllNotifications: () => void;
    markLastStudyTime: () => void;
}

export const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};
