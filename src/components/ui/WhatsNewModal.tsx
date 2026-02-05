import React, { useState, useEffect } from 'react';
import { Sparkles, BookOpen, FileQuestion, Heart } from 'lucide-react';
import './WhatsNewModal.css';

const VERSION_KEY = 'whats_new_v5_content_update';

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
            icon: <FileQuestion size={24} />,
            color: '#3B82F6', // Blue for quizzes
            title: 'Nuovi Quiz Aggiunti',
            description: 'Il database è stato aggiornato con 20 nuovi quiz, e presto aumenteranno ancora!'
        },
        {
            icon: <BookOpen size={24} />,
            color: '#10B981', // Green for study material
            title: 'Nuova Lezione Legge 394/91',
            description: 'Aggiunta una lezione di sintesi sulla Legge Quadro Aree Protette: sanzioni, schemi e strategie di studio.'
        },
        {
            icon: <Heart size={24} />,
            color: '#EC4899', // Pink for love/luck
            title: 'Buono Studio da Efisio!!!',
            description: 'Continua a prepararti al meglio. In bocca al lupo! 💪'
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
                    Fantastico! 📚
                </button>
            </div>
        </div>
    );
};

export default WhatsNewModal;
