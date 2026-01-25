import React, { useState, useEffect } from 'react';
import { Sparkles, Save, BookOpen, CheckCircle } from 'lucide-react';
import './WhatsNewModal.css';

const VERSION_KEY = 'has_seen_update_v1_0_3'; // Updated to force modal to show again

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
                            <BookOpen size={20} />
                        </div>
                        <div className="item-content">
                            <h4>Nuova Lezione Inglese B1</h4>
                            <p>Aggiunte nozioni di Inglese B1 specifico per il Corpo Forestale nel materiale di studio.</p>
                        </div>
                    </li>

                    <li className="whats-new-item">
                        <div className="item-icon">
                            <CheckCircle size={20} />
                        </div>
                        <div className="item-content">
                            <h4>Nuovi Quiz Inglese</h4>
                            <p>Inseriti 22 nuovi quiz di lingua inglese per testare subito la tua preparazione.</p>
                        </div>
                    </li>

                    <li className="whats-new-item">
                        <div className="item-icon">
                            <Save size={20} />
                        </div>
                        <div className="item-content">
                            <h4>Sempre Migliorati</h4>
                            <p>Continuiamo ad aggiungere contenuti per la tua preparazione al concorso.</p>
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
