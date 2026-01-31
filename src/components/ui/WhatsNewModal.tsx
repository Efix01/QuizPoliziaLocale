import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle, TreePine, RefreshCw } from 'lucide-react';
import './WhatsNewModal.css';

const VERSION_KEY = 'whats_new_v3_quiz_limit_30'; // Updated to force modal to show again

const WhatsNewModal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        try {
            // Check if user has already seen this update
            const hasSeen = localStorage.getItem(VERSION_KEY);
            if (!hasSeen) {
                // Small delay to appear after app load
                const timer = setTimeout(() => {
                    setIsOpen(true);
                }, 1000);
                return () => clearTimeout(timer);
            }
        } catch (error) {
            console.warn('LocalStorage access blocked:', error);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        try {
            localStorage.setItem(VERSION_KEY, 'true');
        } catch (error) {
            console.warn('Could not save to LocalStorage:', error);
        }
    };

    if (!isOpen) return null;

    const features = [
        {
            icon: <RefreshCw size={24} />,
            color: 'var(--green-primary)',
            title: 'Sessioni da 30 Domande',
            description: <>Ho ascoltato i vostri feedback! Da ora, selezionando un argomento specifico, potrete affrontare sessioni da <strong>30 quiz</strong> (invece di 10).</>
        },
        {
            icon: <CheckCircle size={20} />,
            color: 'var(--orange-primary, #F59E0B)',
            title: 'Allenamento più Intenso',
            description: 'Ideale per coprire più argomenti in una sola volta e prepararsi al meglio.'
        },
        {
            icon: <TreePine size={20} />,
            color: '#3B82F6',
            title: 'Buono Studio!',
            description: 'Continuate così, la preparazione è fondamentale. Forza ragazzi! 💪'
        }
    ];

    return (
        <div className="whats-new-overlay">
            <div className="whats-new-content">
                <div className="whats-new-icon">
                    <Sparkles size={32} />
                </div>

                <h2 className="whats-new-title">Più Quiz per Voi! 🚀</h2>

                <ul className="whats-new-list">
                    {features.map((feature, index) => (
                        <li key={index} className="whats-new-item">
                            <div className="item-icon" style={{ color: feature.color }}>
                                {feature.icon}
                            </div>
                            <div className="item-content">
                                <h4>{feature.title}</h4>
                                <p>{feature.description}</p>
                            </div>
                        </li>
                    ))}
                </ul>

                <button className="whats-new-btn" onClick={handleClose}>
                    Grazie! Torno a studiare 📚
                </button>
            </div>
        </div>
    );
};

export default WhatsNewModal;
