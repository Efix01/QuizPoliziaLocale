import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookieBanner: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('quiz-pl-cookie-consent');
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('quiz-pl-cookie-consent', 'accepted');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    style={{
                        position: 'fixed',
                        bottom: '1.5rem',
                        left: '1.5rem',
                        right: '1.5rem',
                        maxWidth: '500px',
                        zIndex: 3000,
                        margin: '0 auto',
                    }}
                >
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.95)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid #334155',
                        borderRadius: '24px',
                        padding: '1.5rem',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                            <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '50%', padding: '0.75rem', flexShrink: 0 }}>
                                <ShieldCheck size={24} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#fff', margin: '0 0 0.5rem 0' }}>La tua privacy conta</h3>
                                <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                                    Utilizziamo solo cookie tecnici per salvare i tuoi progressi di studio. 
                                    Leggi la nostra <Link to="/privacy" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '600' }}>Privacy Policy</Link>.
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsVisible(false)}
                                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.25rem' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <button
                            onClick={handleAccept}
                            style={{
                                width: '100%',
                                background: '#3b82f6',
                                color: '#fff',
                                border: 'none',
                                padding: '0.85rem',
                                borderRadius: '12px',
                                fontWeight: '700',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            Accetto, iniziamo!
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CookieBanner;
