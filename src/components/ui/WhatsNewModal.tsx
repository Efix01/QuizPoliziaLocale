import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle, TreePine } from 'lucide-react';
import './WhatsNewModal.css';

const VERSION_KEY = 'has_seen_update_v1_0_efisio'; // Updated to force modal to show again

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
                        <div className="item-icon" style={{ color: 'var(--green-primary)' }}>
                            <TreePine size={24} />
                        </div>
                        <div className="item-content">
                            <h4>Messaggio dallo Sviluppatore</h4>
                            <p style={{ fontStyle: 'italic', marginBottom: '0.5rem' }}>
                                "Ehi! 👋 Spero di preparare nuovi quiz e lezioni per voi. Non vi lascio soli.
                                Finché voi studiate, io cercherò di aggiornare Quiz CFVA. A presto con le novità! 🌲"
                            </p>
                            <p style={{ fontWeight: 'bold', color: 'var(--green-primary)', textAlign: 'right', margin: 0 }}>— Efisio</p>
                        </div>
                    </li>

                    <li className="whats-new-item">
                        <div className="item-icon">
                            <CheckCircle size={20} />
                        </div>
                        <div className="item-content">
                            <h4>Sempre Migliorati</h4>
                            <p>Stiamo lavorando per rendere l'esperienza sempre più stabile e completa.</p>
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
