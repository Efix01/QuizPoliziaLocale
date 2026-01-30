import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle, TreePine, RefreshCw } from 'lucide-react';
import './WhatsNewModal.css';

const VERSION_KEY = 'whats_new_v3_quiz_limit_30'; // Updated to force modal to show again

const WhatsNewModal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Check if user has already seen this update
        const hasSeen = localStorage.getItem(VERSION_KEY);
        if (!hasSeen) {
            // Small delay to appear after app load
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        // Save flag to localStorage
        localStorage.setItem(VERSION_KEY, 'true');
    };

    if (!isOpen) return null;

    return (
        <div className="whats-new-overlay">
            <div className="whats-new-content">
                <div className="whats-new-icon">
                    <Sparkles size={32} />
                </div>

                <h2 className="whats-new-title">Più Quiz per Voi! 🚀</h2>

                <ul className="whats-new-list">
                    <li className="whats-new-item">
                        <div className="item-icon" style={{ color: 'var(--green-primary)' }}>
                            <RefreshCw size={24} />
                        </div>
                        <div className="item-content">
                            <h4>Sessioni da 30 Domande</h4>
                            <p>Ho ascoltato i vostri feedback! Da ora, selezionando un argomento specifico, potrete affrontare sessioni da <strong>30 quiz</strong> (invece di 10).</p>
                        </div>
                    </li>

                    <li className="whats-new-item">
                        <div className="item-icon" style={{ color: 'var(--orange-primary, #F59E0B)' }}>
                            <CheckCircle size={20} />
                        </div>
                        <div className="item-content">
                            <h4>Allenamento più Intenso</h4>
                            <p>Ideale per coprire più argomenti in una sola volta e prepararsi al meglio.</p>
                        </div>
                    </li>

                    <li className="whats-new-item">
                        <div className="item-icon" style={{ color: '#3B82F6' }}>
                            <TreePine size={20} />
                        </div>
                        <div className="item-content">
                            <h4>Buono Studio!</h4>
                            <p>Continuate così, la preparazione è fondamentale. Forza ragazzi! 💪</p>
                        </div>
                    </li>
                </ul>

                <button className="whats-new-btn" onClick={handleClose}>
                    Grazie! Torno a studiare 📚
                </button>
            </div>
        </div>
    );
};

export default WhatsNewModal;
