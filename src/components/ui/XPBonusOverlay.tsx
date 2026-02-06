import React, { useEffect } from 'react';
import './XPBonusOverlay.css';

interface XPBonusOverlayProps {
    message: string;
    amount: number;
    onClose: () => void;
}

export const XPBonusOverlay: React.FC<XPBonusOverlayProps> = ({ message, amount, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="xp-bonus-overlay">
            <div className="xp-bonus-card animate-pop-in">
                <div className="xp-rays"></div>
                <div className="xp-icon">⭐</div>
                <h2 className="xp-title">{message}</h2>
                <div className="xp-amount">+{amount} Punti</div>
            </div>
        </div>
    );
};
