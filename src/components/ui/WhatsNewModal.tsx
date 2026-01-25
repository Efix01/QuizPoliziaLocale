import React, { useState, useEffect } from 'react';
import { Sparkles, Save, BookOpen, CheckCircle } from 'lucide-react';
import './WhatsNewModal.css';

const VERSION_KEY = 'has_seen_update_v1_0_2'; // Updated to force modal to show again

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

                <h2 className="whats-new-title">Novità!</h2>

                <ul className="whats-new-list">
                    <li className="whats-new-item">
                        <div className="item-icon">
                            <Save size={20} />
                        </div>
                        <div className="item-content">
                            <h4>Salvataggio in Cloud</h4>
                            <p>I tuoi progressi sono ora salvati online. Cambia dispositivo senza perdere nulla.</p>
                        </div>
                    </li>

                    <li className="whats-new-item">
                        <div className="item-icon">
                            <CheckCircle size={20} />
                        </div>
                        <div className="item-content">
                            <h4>Migliore Lettura</h4>
                            <p>Il pulsante "Segna come letto" è sempre visibile e trovi nuove opzioni per ripassare.</p>
                        </div>
                    </li>

                    <li className="whats-new-item">
                        <div className="item-icon">
                            <BookOpen size={20} />
                        </div>
                        <div className="item-content">
                            <h4>App Gratuita</h4>
                            <p>Tutte le nuove funzioni sono ottimizzate per rimanere gratuite per sempre.</p>
                        </div>
                    </li>
                </ul>

                <button className="whats-new-btn" onClick={handleClose}>
                    Fantastico, ho capito!
                </button>
            </div>
        </div>
    );
};

export default WhatsNewModal;
