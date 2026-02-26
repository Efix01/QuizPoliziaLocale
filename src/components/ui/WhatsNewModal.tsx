import React, { useState, useEffect } from 'react';
import { Sparkles, BookOpen, FileQuestion, Heart } from 'lucide-react';
import './WhatsNewModal.css';

const VERSION_KEY = 'whats_new_v11_feb_2026_caccia_v2'; // Aggiornato per forzare la visualizzazione del nuovo design

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
            icon: <BookOpen size={24} color="#10B981" />, // Smeraldo per Botanica/Legge
            title: "Nuovi Quiz Disponibili! 🦌",
            description: "Aggiunte le domande 1221-1249 sulla Legge sulla Caccia (L. 157/1992): normativa, divieti e sistema sanzionatorio penale/amministrativo."
        },
        {
            icon: <FileQuestion size={24} color="#38BDF8" />, // Azzurro cielo
            title: 'Audit & Miglioramenti 🛡️',
            description: "Abbiamo fatto un check-up completo dell'app. Zero bug, più sicurezza (validazione Zod) e interfaccia ancora più fluida ed elegante."
        },
        {
            icon: <Heart size={24} color="#F43F5E" />, // Rosa acceso
            title: 'Continua a studiare! 💪',
            description: "Il traguardo è vicino. Mettiti alla prova regolarmente, ogni quiz superato è un passo in più verso il Corpo Forestale. In bocca al lupo!"
        }
    ];

    return (
        <div className="whats-new-overlay">
            <div className="whats-new-content">
                <div className="whats-new-icon">
                    <Sparkles size={36} />
                </div>

                <h2 className="whats-new-title">Aggiornamento ✨</h2>

                <ul className="whats-new-list">
                    {features.map((feature, index) => (
                        <li key={index} className="whats-new-item">
                            <div className="item-icon">
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
