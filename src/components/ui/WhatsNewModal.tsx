import React, { useState, useEffect } from 'react';
import { Sparkles, BookOpen, Heart } from 'lucide-react';
import './WhatsNewModal.css';

const VERSION_KEY = 'whats_new_v13_mar_2026_buono_studio'; // Aggiornato per mostrare il messaggio di incoraggiamento

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
            icon: <BookOpen size={24} color="#F59E0B" />, // Ambra per il fuoco/incendi
            title: "Nuovi Quiz Disponibili! 🔥",
            description: "Aggiunte ben 54 nuove domande sulla normativa Antincendio (L. 353/2000): definizioni di legge, lotta attiva, catasto incendi e sistema sanzionatorio penale."
        },
        {
            icon: <Sparkles size={24} color="#10B981" />, // Smeraldo per il design nuovo
            title: 'Nuovissimo Design "Glass" ✨',
            description: "L'app ha un look nuovo! Modalità Studio e pop-up ora sfruttano un elegante design scuro semi-trasparente (Glassmorphism), progettato per non affaticare gli occhi."
        },
        {
            icon: <Heart size={24} color="#F43F5E" />,
            title: 'Buona prosecuzione di studio! 💪',
            description: <>Non perdetevi d'animo! Il ritardo delle prove scritte gioca a vostro favore per migliorare le conoscenze sulle <strong style={{ color: '#FFFFFF', fontWeight: 'bold' }}>materie forestali</strong>. Gli aggiornamenti dei quiz riprenderanno a breve!</>
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
