import React, { useState } from 'react';
import { X, Megaphone } from 'lucide-react';
import './NewsBanner.css';

interface NewsBannerProps {
    id: string; // Unique ID for storing dismissed state
    title: string;
    message: string;
}

export const NewsBanner: React.FC<NewsBannerProps> = ({ id, title, message }) => {
    const [isVisible, setIsVisible] = useState(() => {
        return localStorage.getItem(`news_dismissed_${id}`) !== 'true';
    });

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem(`news_dismissed_${id}`, 'true');
    };

    if (!isVisible) return null;

    return (
        <div className="news-banner">
            <div className="news-icon">
                <Megaphone size={24} />
            </div>
            <div className="news-content">
                <strong>{title}</strong>
                <p>{message}</p>
            </div>
            <button
                className="news-dismiss"
                onClick={handleDismiss}
                aria-label="Chiudi notifica"
            >
                <X size={18} />
            </button>
        </div>
    );
};
