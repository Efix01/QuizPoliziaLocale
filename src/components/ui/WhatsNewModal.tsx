import React, { useState, useEffect } from 'react';
import { Sparkles, BookOpen, FileQuestion, Heart } from 'lucide-react';
import './WhatsNewModal.css';

const VERSION_KEY = 'whats_new_v7_sanzioni_2025';

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
            color: '#10B981', // Green for study material
            title: "Nuova Lezione: Sistema Sanzionatorio",
            description: "Tutto sulle sanzioni ambientali (D.Lgs. 152/2006). Focus su Art. 255 (Abbandono) e 256 (Gestione illecita)."
        },
        {
            icon: <FileQuestion size={24} />,
            color: '#3B82F6', // Blue for quizzes
            title: 'Io mi stò impegnando per te!!, oltre 120 Nuovi Quiz!',
            description: 'Mettiti alla prova su Sanzioni, Rifiuti, Incendi e Codice Penale. Database super aggiornato! 🚀'
        },
        {
            icon: <Heart size={24} />,
            color: '#EC4899', // Pink for love/luck
            title: 'Buono Studio!!!',
            description: 'La tua costanza ti premierà. Continua così.! 💪'
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
