import React, { useState, useEffect } from 'react';
import { Sparkles, BookOpen } from 'lucide-react';
import './WhatsNewModal.css';

const VERSION_KEY = 'whats_new_v14_mar_2026_commissione'; // Aggiornato per annuncio commissione

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

    const PDF_LINK = "https://files.regione.sardegna.it/squidex/api/assets/redazionaleras/421a3ee7-e8bc-4f76-882d-b3a7330e5ce7/determinazione-nomina-prima-commissione-esaminatrice-n.-469-10363-12.03.2026-.pdf";

    const features = [
        {
            icon: <BookOpen size={24} color="#3B82F6" />, // Blu per comunicazioni ufficiali
            title: "Preparazione Concorso Polizia Locale! ⚖️",
            description: (
                <>
                    Inizia la preparazione per le prove scritte, pratiche e titoli del nuovo concorso.
                    <br />
                    <a
                        href={PDF_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'inline-block',
                            marginTop: '8px',
                            color: '#60A5FA',
                            textDecoration: 'underline',
                            fontWeight: '500'
                        }}
                    >
                        📄 Scarica PDF Ufficiale
                    </a>
                </>
            )
        },
        {
            icon: <BookOpen size={24} color="#F59E0B" />, // Ambra per il fuoco/incendi
            title: "Nuovi Quiz Disponibili! 🔥",
            description: "Aggiunte ben 54 nuove domande sulla normativa Antincendio (L. 353/2000): definizioni di legge, lotta attiva, catasto incendi e sistema sanzionatorio penale."
        },
        {
            icon: <Sparkles size={24} color="#10B981" />, // Smeraldo per il design nuovo
            title: 'Nuovissimo Design "Glass" ✨',
            description: "L'app ha un look nuovo! Modalità Studio e pop-up ora sfruttano un elegante design scuro semi-transparente (Glassmorphism), progettato per non affaticare gli occhi."
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
