import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, KeyRound, MailCheck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock schema per compatibilità (normalmente importato da context/AuthProvider)
const ForgotPasswordSchema = {
    safeParse: (data: { email: string }) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            return { success: false, error: { issues: [{ message: 'Email non valida' }] } };
        }
        return { success: true };
    }
};

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [globalError, setGlobalError] = useState<string | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const validateEmail = (emailValue: string): boolean => {
        const result = ForgotPasswordSchema.safeParse({ email: emailValue });
        if (!result.success) {
            setEmailError(result.error?.issues[0]?.message || 'Email non valida');
            return false;
        }
        setEmailError(null);
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGlobalError(null);

        if (!validateEmail(email)) return;

        setIsSubmitting(true);
        try {
            // Simulazione invio (Sostituire con logica Auth reale se necessario)
            await new Promise(resolve => setTimeout(resolve, 1500));
            setIsSuccess(true);
            setResendTimer(60);
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Errore durante l\'invio. Riprova.';
            setGlobalError(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (emailError) setEmailError(null);
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            
            {/* Background Decorative Element */}
            <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>
                
                {/* Back Button */}
                <motion.button 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate('/login')}
                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '700', fontSize: '0.9rem', marginBottom: '2rem', cursor: 'pointer', outline: 'none' }}
                >
                    <ArrowLeft size={18} />
                    Torna al login
                </motion.button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '32px',
                        padding: '3rem 2.5rem',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        textAlign: 'center'
                    }}
                >
                    <AnimatePresence mode="wait">
                        {!isSuccess ? (
                            <motion.div
                                key="request"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
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
                                    <KeyRound size={32} />
                                </div>
                                
                                <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#fff', margin: '0 0 0.75rem 0' }}>Password dimenticata?</h1>
                                <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                                    Non preoccuparti. Inserisci la tua email e ti invieremo le istruzioni per il recupero.
                                </p>

                                {globalError && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '700', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                                        <AlertCircle size={18} />
                                        {globalError}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <label htmlFor="email" style={{ fontSize: '0.85rem', fontWeight: '800', color: '#64748b', letterSpacing: '0.1em' }}>EMAIL</label>
                                        <div style={{ position: 'relative' }}>
                                            <Mail size={18} color="#475569" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                            <input
                                                id="email"
                                                type="email"
                                                placeholder="nome@esempio.it"
                                                value={email}
                                                onChange={handleEmailChange}
                                                style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: '#0f172a', border: `1px solid ${emailError ? '#ef4444' : '#334155'}`, borderRadius: '16px', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }}
                                                onFocus={(e) => !emailError && (e.currentTarget.style.borderColor = '#3b82f6')}
                                                onBlur={(e) => !emailError && (e.currentTarget.style.borderColor = '#334155')}
                                            />
                                        </div>
                                        {emailError && <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: '700' }}>{emailError}</span>}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        style={{ width: '100%', padding: '1.1rem', borderRadius: '16px', background: '#3b82f6', color: '#fff', border: 'none', fontWeight: '800', fontSize: '1rem', cursor: isSubmitting ? 'default' : 'pointer', transition: 'all 0.2s', marginTop: '0.5rem', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}
                                        onMouseOver={(e) => !isSubmitting && (e.currentTarget.style.background = '#2563eb', e.currentTarget.style.transform = 'translateY(-2px)')}
                                        onMouseOut={(e) => !isSubmitting && (e.currentTarget.style.background = '#3b82f6', e.currentTarget.style.transform = 'translateY(0)')}
                                    >
                                        {isSubmitting ? 'Invio in corso...' : 'Invia Link di Recupero'}
                                    </button>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <div style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    background: 'rgba(34, 197, 94, 0.1)', 
                                    color: '#22c55e', 
                                    borderRadius: '20px', 
                                    padding: '1rem', 
                                    marginBottom: '1.5rem' 
                                }}>
                                    <MailCheck size={32} />
                                </div>
                                <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#fff', margin: '0 0 0.75rem 0' }}>Controlla la posta</h1>
                                <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
                                    Abbiamo inviato le istruzioni a:<br />
                                    <strong style={{ color: '#fff' }}>{email}</strong>
                                </p>
                                
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '2.5rem' }}>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
                                        Non hai ricevuto l'email? Controlla lo spam oppure 
                                        {resendTimer > 0 ? (
                                            <span style={{ fontWeight: '700', color: '#3b82f6' }}> riprova tra {resendTimer}s</span>
                                        ) : (
                                            <button onClick={handleSubmit} style={{ background: 'transparent', border: 'none', padding: 0, color: '#3b82f6', fontWeight: '800', cursor: 'pointer', textDecoration: 'underline' }}> invia di nuovo</button>
                                        )}
                                    </p>
                                </div>

                                <button
                                    onClick={() => navigate('/login')}
                                    style={{ width: '100%', padding: '1rem', background: 'transparent', border: '1px solid #334155', borderRadius: '16px', color: '#cbd5e1', fontWeight: '700', cursor: 'pointer' }}
                                >
                                    Torna al login
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

export default ForgotPassword;
