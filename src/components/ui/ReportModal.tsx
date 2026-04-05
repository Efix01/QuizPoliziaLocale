import React from 'react';
import { Flag, Mail, X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    questionId: number | string;
    category: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, questionId, category }) => {
    const generateEmailParams = () => {
        const subject = encodeURIComponent(`Segnalazione Errore - Quiz ID #${questionId}`);
        const body = encodeURIComponent(
            `Ciao Efisio,\n\nHo trovato un errore nel quesito ID #${questionId}\n` +
            `Argomento: ${category}\n\n` +
            `Dettagli errore:\n[Scrivi qui cosa c'è che non va]\n`
        );
        return { subject, body };
    };

    const handleDefaultMail = () => {
        const { subject, body } = generateEmailParams();
        window.location.href = `mailto:efix01@gmail.com?subject=${subject}&body=${body}`;
        onClose();
    };

    const handleGmail = () => {
        const { subject, body } = generateEmailParams();
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=efix01@gmail.com&su=${subject}&body=${body}`;
        window.open(gmailUrl, '_blank');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div 
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 5000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(15, 23, 42, 0.8)',
                        backdropFilter: 'blur(12px)',
                        padding: '1rem',
                    }}
                    onClick={onClose}
                >
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        style={{
                            width: '100%',
                            maxWidth: '440px',
                            background: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '32px',
                            padding: '2.5rem',
                            position: 'relative',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button 
                            onClick={onClose}
                            style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
                        >
                            <X size={24} />
                        </button>

                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                background: 'rgba(239, 68, 68, 0.1)', 
                                color: '#ef4444', 
                                borderRadius: '20px', 
                                padding: '1rem', 
                                marginBottom: '1.25rem' 
                            }}>
                                <Flag size={32} />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#f8fafc', margin: '0 0 0.5rem 0' }}>Segnala Errore</h2>
                            <p style={{ color: '#3b82f6', fontWeight: '800', fontSize: '0.85rem', letterSpacing: '0.1em' }}>ID QUESITO: #{questionId}</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: 'rgba(59, 130, 246, 0.05)', padding: '1.25rem', borderRadius: '16px', border: '1px dashed #1e40af' }}>
                                <CheckCircle size={20} color="#3b82f6" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
                                <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                                    Grazie! Verificherò la segnalazione con le fonti normative e aggiornerò il database al prossimo rilascio.
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <button 
                                onClick={handleGmail}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    borderRadius: '16px',
                                    border: 'none',
                                    background: '#3b82f6',
                                    color: '#fff',
                                    fontWeight: '800',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.75rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = '#2563eb'}
                                onMouseOut={(e) => e.currentTarget.style.background = '#3b82f6'}
                            >
                                <Mail size={20} />
                                Invia con Gmail
                            </button>
                            <button
                                onClick={handleDefaultMail}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    borderRadius: '16px',
                                    border: '1px solid #334155',
                                    background: 'transparent',
                                    color: '#cbd5e1',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.75rem',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s',
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <Mail size={18} />
                                App Mail Predefinita
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
