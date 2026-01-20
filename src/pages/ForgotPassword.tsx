import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { Mail, ArrowLeft, KeyRound, MailCheck } from 'lucide-react';
import './ForgotPassword.css';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [globalError, setGlobalError] = useState<string | null>(null);

    const navigate = useNavigate();

    // Resend timer countdown
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    // Validate email
    const validateEmail = (emailValue: string): boolean => {
        if (!emailValue.trim()) {
            setEmailError('Inserisci la tua email');
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
            setEmailError('Inserisci un\'email valida');
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
            await sendPasswordResetEmail(auth, email);
            setIsSuccess(true);
            setResendTimer(60);
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'code' in error) {
                const code = (error as { code: string }).code;
                if (code === 'auth/user-not-found') {
                    setGlobalError('Nessun account trovato con questa email.');
                } else if (code === 'auth/invalid-email') {
                    setEmailError('Email non valida.');
                } else if (code === 'auth/too-many-requests') {
                    setGlobalError('Troppi tentativi. Riprova più tardi.');
                } else {
                    setGlobalError('Errore durante l\'invio. Riprova.');
                }
            } else {
                setGlobalError('Errore sconosciuto. Riprova.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0) return;

        setIsSubmitting(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setResendTimer(60);
        } catch {
            setGlobalError('Errore durante l\'invio. Riprova.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (emailError) setEmailError(null);
    };

    return (
        <div className="forgot-page">
            {/* Background Layers */}
            <div className="forgot-background">
                <div className="forgot-pattern" />
                <div className="forgot-particles">
                    <div className="particle" />
                    <div className="particle" />
                    <div className="particle" />
                    <div className="particle" />
                </div>
            </div>

            <div className="forgot-container">
                {/* Back to Login */}
                <button className="back-link" onClick={() => navigate('/login')}>
                    <ArrowLeft />
                    <span>Torna al login</span>
                </button>

                {/* Card */}
                <div className="forgot-card">
                    {!isSuccess ? (
                        /* ═══════ STATO 1: RICHIESTA ═══════ */
                        <div className="forgot-content request-state">
                            {/* Icon */}
                            <div className="forgot-icon-wrapper">
                                <KeyRound className="forgot-icon" />
                            </div>

                            {/* Title */}
                            <h1 className="forgot-title">Password dimenticata?</h1>
                            <p className="forgot-description">
                                Non preoccuparti, capita a tutti.<br />
                                Inserisci la tua email e ti invieremo le istruzioni.
                            </p>

                            {/* Global Error */}
                            {globalError && (
                                <div className="forgot-error">
                                    {globalError}
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="forgot-form">
                                <div className={`input-group ${emailError ? 'has-error' : ''}`}>
                                    <label htmlFor="email">Email</label>
                                    <Mail className="input-icon" />
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="nome@esempio.com"
                                        value={email}
                                        onChange={handleEmailChange}
                                        autoFocus
                                        autoComplete="email"
                                    />
                                    {emailError && (
                                        <div className="input-error">
                                            <span>{emailError}</span>
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className={`submit-button ${isSubmitting ? 'loading' : ''}`}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <span className="spinner" />
                                    ) : (
                                        'Invia Link di Recupero'
                                    )}
                                </button>
                            </form>
                        </div>
                    ) : (
                        /* ═══════ STATO 2: SUCCESSO ═══════ */
                        <div className="forgot-content success-state">
                            {/* Icon */}
                            <div className="forgot-icon-wrapper success">
                                <MailCheck className="forgot-icon" />
                            </div>

                            {/* Title */}
                            <h1 className="forgot-title">Controlla la posta</h1>
                            <p className="forgot-description">
                                Abbiamo inviato un link di recupero a:<br />
                                <strong className="email-highlight">{email}</strong>
                            </p>

                            {/* Spam Notice */}
                            <p className="spam-notice">
                                Non l'hai ricevuta? Controlla la cartella Spam
                                {resendTimer > 0 ? (
                                    <span className="resend-timer"> o riprova tra {resendTimer}s</span>
                                ) : (
                                    <button
                                        className="resend-link"
                                        onClick={handleResend}
                                        disabled={isSubmitting}
                                    >
                                        {' '}o <span className="resend-text">invia di nuovo</span>
                                    </button>
                                )}
                            </p>

                            {/* Back to Login Button */}
                            <button
                                className="secondary-button"
                                onClick={() => navigate('/login')}
                            >
                                Torna al login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
