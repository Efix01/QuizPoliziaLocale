import React, { useState, useEffect } from 'react';
import { Sparkles, Palette, AlertTriangle, History, Dumbbell, Heart } from 'lucide-react';
import './WhatsNewModal.css';

const VERSION_KEY = 'whats_new_v4_dark_glass';

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
            icon: <Palette size={24} />,
            color: '#A855F7', // Purple for design
            title: 'Nuovo Look Dark Glass',
            description: 'Un\'interfaccia moderna e riposante per le tue sessioni di studio notturne.'
        },
        {
            icon: <AlertTriangle size={24} />,
            color: '#F59E0B', // Amber for alerts
            title: 'Controllo Errori',
            description: 'Nella Simulazione d\'Esame ora vedi subito gli errori per imparare più in fretta.'
        },
        {
            icon: <History size={24} />,
            color: '#EF4444', // Red for errors/history
            title: 'Revisione Errori',
            description: 'Torna sui tuoi passi: una sezione dedicata per rivedere e riprovare le domande sbagliate.'
        },
        {
            icon: <Dumbbell size={24} />,
            color: '#06B6D4', // Cyan for physical
            title: 'Hub Fisico',
            description: 'Nuova sezione per preparare corsa, piegamenti e salto con timer integrati.'
        },
        {
            icon: <Heart size={24} />,
            color: '#EC4899', // Pink for love/luck
            title: 'Buono Studio da Efisio!!!',
            description: 'Un grande in bocca al lupo per la tua preparazione! 💪'
        }
    ];

    return (
        <div className="whats-new-overlay">
            <div className="whats-new-content">
                <div className="whats-new-icon">
                    <Sparkles size={32} />
                </div>

                <h2 className="whats-new-title">Novità da Quiz CFVA ✨</h2>

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
