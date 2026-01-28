import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle, TreePine, RefreshCw } from 'lucide-react';
import './WhatsNewModal.css';

const VERSION_KEY = 'whats_new_v2_zoologia_botanica'; // Updated to force modal to show again

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

                <h2 className="whats-new-title">Maxi Aggiornamento! 🌿🦌</h2>

                <ul className="whats-new-list">
                    <li className="whats-new-item">
                        <div className="item-icon" style={{ color: 'var(--green-primary)' }}>
                            <TreePine size={24} />
                        </div>
                        <div className="item-content">
                            <h4>Nuove Lezioni di Zoologia e Botanica!</h4>
                            <p>Abbiamo arricchito il materiale di studio:</p>
                            <ul style={{ paddingLeft: '1.2rem', marginTop: '0.2rem', listStyleType: 'disc' }}>
                                <li><strong>Zoologia:</strong> Mammiferi, Uccelli, Rettili, Anfibi, Pesci, Invertebrati ed Endemismi.</li>
                                <li><strong>Botanica:</strong> Querce, Conifere, Macchia Alta/Bassa e Flora endemica.</li>
                            </ul>
                        </div>
                    </li>

                    <li className="whats-new-item">
                        <div className="item-icon" style={{ color: 'var(--orange-primary, #F59E0B)' }}>
                            <CheckCircle size={20} />
                        </div>
                        <div className="item-content">
                            <h4>Nuovi Quiz Aggiunti</h4>
                            <p>Inseriti <strong>55 nuovi quiz</strong> specifici su questi argomenti per testare subito la tua preparazione!</p>
                        </div>
                    </li>

                    <li className="whats-new-item">
                        <div className="item-icon" style={{ color: '#3B82F6' }}>
                            <RefreshCw size={20} />
                        </div>
                        <div className="item-content">
                            <h4>Messaggio da Efisio</h4>
                            <p style={{ fontStyle: 'italic', marginBottom: '0.5rem' }}>
                                "Ciao ragazzi! 🌲 Sto mettendo tanto impegno per offrirvi il materiale, non sarà il migliore o il più completo, ma sono punti essenziali per la vostra preparazione.
                                Mentre voi studiate sodo, io cerco di lavorare per voi. Buono studio e non mollate! sono sicuro che il giorno del test non è cosi lontano!!"
                            </p>
                            <p style={{ fontWeight: 'bold', color: 'var(--green-primary)', textAlign: 'right', margin: 0 }}>Efisio..</p>
                        </div>
                    </li>
                </ul>

                <button className="whats-new-btn" onClick={handleClose}>
                    Grazie! Torno a studiare 📚
                </button>
            </div>
        </div>
    );
};

export default WhatsNewModal;
