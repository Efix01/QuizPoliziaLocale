import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, CheckCircle2, Zap, Trophy, Shield } from 'lucide-react';

const APP_VERSION = '1.2.0';

interface WhatsNewModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ isOpen, onClose }) => {
    // Gestione interna della visibilità automatica (opzionale se non passato da props)
    const [shouldShow, setShouldShow] = useState(isOpen);

    useEffect(() => {
        setShouldShow(isOpen);
    }, [isOpen]);

    const updates = [
        { icon: <Zap size={20} color="#f59e0b" />, title: 'Elite UI Sweep', text: 'Nuovo design Midnight Blue con animazioni fluide per un\'esperienza d\'élite.' },
        { icon: <Shield size={20} color="#3b82f6" />, title: 'Domande Regionali', text: 'Nuova banca dati aggiornata per Sardegna, Lazio e Lombardia.' },
        { icon: <Trophy size={20} color="#22c55e" />, title: 'Dashboard Statistiche', text: 'Monitora la tua precisione con grafici in tempo reale e streak di studio.' },
    ];

    return (
        <AnimatePresence>
            {shouldShow && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 5000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(12px)',
                    padding: '1.5rem',
                }}
                onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '100%',
                            maxWidth: '480px',
                            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                            border: '1px solid #334155',
                            borderRadius: '32px',
                            padding: '2.5rem',
                            position: 'relative',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        }}
                    >
                        {/* Header */}
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                background: 'rgba(59, 130, 246, 0.1)', 
                                color: '#3b82f6', 
                                borderRadius: '20px', 
                                padding: '1rem', 
                                marginBottom: '1.5rem' 
                            }}>
                                <Sparkles size={32} />
                            </div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#fff', margin: '0 0 0.5rem 0' }}>Cosa c'è di nuovo?</h2>
                            <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '700', letterSpacing: '0.1em' }}>VERSIONE {APP_VERSION}</span>
                        </div>

                        {/* Update List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
                            {updates.map((upd, i) => (
                                <div key={i} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                                    <div style={{ 
                                        padding: '0.75rem', 
                                        background: 'rgba(255,255,255,0.03)', 
                                        borderRadius: '16px', 
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        flexShrink: 0 
                                    }}>
                                        {upd.icon}
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#f8fafc', margin: '0 0 0.25rem 0' }}>{upd.title}</h4>
                                        <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>{upd.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* CTA */}
                        <button
                            onClick={onClose}
                            style={{
                                width: '100%',
                                background: '#3b82f6',
                                color: '#fff',
                                border: 'none',
                                padding: '1.1rem',
                                borderRadius: '16px',
                                fontWeight: '800',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
                                transition: 'all 0.2s',
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.background = '#2563eb';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.background = '#3b82f6';
                            }}
                        >
                            <CheckCircle2 size={20} />
                            Ottimo, andiamo!
                        </button>

                        <button 
                            onClick={onClose}
                            style={{ 
                                position: 'absolute', 
                                top: '1.25rem', 
                                right: '1.25rem', 
                                background: 'transparent', 
                                border: 'none', 
                                color: '#475569', 
                                cursor: 'pointer',
                                padding: '0.5rem'
                            }}
                        >
                            <X size={24} />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default WhatsNewModal;
