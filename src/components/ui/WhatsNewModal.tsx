import React, { useState, useEffect } from 'react';
import { Sparkles, BookOpen, FileQuestion, Heart } from 'lucide-react';
import './WhatsNewModal.css';

const VERSION_KEY = 'whats_new_v10_feb_2026';

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
            icon: <BookOpen size={24} />,
            color: '#10B981', // Green
            title: "Gran lavoro di aggiornamento quasi quotidiano!! Nuovi Quiz:",
            description: "Aggiunti i quiz 1041-1220! Focus su Diritto Penale (attività di PG, reati) e Botanica Forestale (specie protette e L.R. 4/2025) e L.R. 26/1985."
        },
        {
            icon: <FileQuestion size={24} />,
            color: '#3B82F6', // Blue
            title: 'Aggiornamenti Normativi 2025/26',
            description: 'Il database è aggiornato con le ultimissime riforme: D.L. 116/2025 (sanzioni rifiuti) e L. 82/2025 (tutela animali).'
        },
        {
            icon: <Heart size={24} />,
            color: '#EC4899', // Pink
            title: 'Corpo Forestale',
            description: 'Nuova sezione Istituzionale sulla L.R. 26/1985 aggiornata (dipendenza dalla Presidenza della Regione). Buono studio!'
        }
    ];

    return (
        <div className="whats-new-overlay">
            <div className="whats-new-content">
                <div className="whats-new-icon">
                    <Sparkles size={32} />
                </div>

                <h2 className="whats-new-title">Aggiornamento Contenuti ✨</h2>

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
                    OK..vado a studiare! 📚
                </button>
            </div>
        </div>
    );
};

export default WhatsNewModal;
