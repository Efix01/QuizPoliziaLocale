import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginSchema, RegisterSchema } from '../context/AuthProvider'; // Import schemas
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff, ArrowRight, AlertCircle, Check } from 'lucide-react';
import './Login.css';

import { getPasswordStrength, STRENGTH_CLASSES } from '../utils/passwordStrength';

const Login: React.FC = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; name?: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [cardExiting, setCardExiting] = useState(false);

    const { login, register, loginWithGoogle, error, clearError } = useAuth();
    const navigate = useNavigate();

    // Password strength for registration
    const passwordStrength = getPasswordStrength(password);

    // Validate form
    const validateForm = useCallback(() => {
        const errors: { email?: string; password?: string; name?: string } = {};

        if (isRegister) {
            const result = RegisterSchema.safeParse({ email, password, displayName });
            if (!result.success) {
                result.error.issues.forEach(issue => {
                    const path = issue.path[0] as string;
                    if (path === 'email') errors.email = issue.message;
                    if (path === 'password') errors.password = issue.message;
                    if (path === 'displayName') errors.name = issue.message;
                });
            }
        } else {
            const result = LoginSchema.safeParse({ email, password });
            if (!result.success) {
                result.error.issues.forEach(issue => {
                    const path = issue.path[0] as string;
                    if (path === 'email') errors.email = issue.message;
                    if (path === 'password') errors.password = issue.message;
                });
            }
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    }, [email, password, displayName, isRegister]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        clearError();

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            if (isRegister) {
                await register(email, password, displayName);
            } else {
                await login(email, password);
            }

            // Success animation sequence
            setIsSuccess(true);

            setTimeout(() => {
                setCardExiting(true);
            }, 300);

            setTimeout(() => {
                navigate('/');
            }, 700);

        } catch {
            // Error is handled via AuthContext state (error variable) which updates the UI
        } finally {
            if (!isSuccess) {
                setIsSubmitting(false);
            }
        }
    };

    const handleGoogleLogin = async () => {
        clearError();
        setIsSubmitting(true);
        try {
            await loginWithGoogle();

            // Success animation
            setIsSuccess(true);
            setTimeout(() => {
                setCardExiting(true);
            }, 300);
            setTimeout(() => {
                navigate('/');
            }, 700);

        } catch {
            // Error is handled via AuthContext state
            setIsSubmitting(false);
        }
    };

    const handleGuestContinue = () => {
        navigate('/');
    };

    const toggleMode = () => {
        setIsRegister(!isRegister);
        clearError();
        setLocalError(null);
        setFieldErrors({});
        setEmail('');
        setPassword('');
        setDisplayName('');
    };

    // Clear field error on change
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDisplayName(e.target.value);
        if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: undefined }));
    };

    return (
        <div className="login-page">
            {/* Background Layers */}
            <div className="login-background">
                <div className="login-pattern" />
                {/* Floating Particles (Fireflies) */}
                <div className="login-particles">
                    <div className="particle" />
                    <div className="particle" />
                    <div className="particle" />
                    <div className="particle" />
                    <div className="particle" />
                    <div className="particle" />
                </div>
            </div>

            <div className="login-container">
                {/* Back Button */}
                <button className="back-button" onClick={handleGuestContinue}>
                    <ArrowLeft />
                    <span>Torna alla Home</span>
                </button>

                {/* Login Card */}
                <div className={`login-card ${cardExiting ? 'success-exit' : ''}`}>
                    {/* Logo */}
                    <div className="login-logo">
                        <img src="/logo-pl.png" alt="Quiz Polizia Locale" className="login-logo-img" />
                    </div>

                    {/* Title */}
                    <h1 className="login-title">
                        {isRegister ? 'Crea il tuo account' : 'Accedi per continuare'}
                    </h1>
                    <p className="login-subtitle">
                        {isRegister
                            ? 'Sblocca tutti i quiz del concorso'
                            : 'Sblocca tutti i contenuti'}
                    </p>

                    {/* Google Login Button */}
                    <button
                        className="google-button"
                        onClick={handleGoogleLogin}
                        disabled={isSubmitting}
                        type="button"
                    >
                        <svg className="google-icon" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continua con Google
                    </button>

                    {/* Divider */}
                    <div className="divider">
                        <span>oppure</span>
                    </div>

                    {/* Error Message (global) */}
                    {(error || localError) && (
                        <div className="error-message">
                            {error || localError}
                        </div>
                    )}

                    {/* Form */}
                    <form
                        onSubmit={handleSubmit}
                        className={`login-form ${isSubmitting ? 'is-loading' : ''}`}
                    >
                        {/* Name field (only for registration) */}
                        {isRegister && (
                            <div className={`input-group ${fieldErrors.name ? 'has-error' : ''}`}>
                                <label htmlFor="displayName">Nome completo</label>
                                <User className="input-icon" />
                                <input
                                    id="displayName"
                                    type="text"
                                    placeholder="Mario Rossi"
                                    value={displayName}
                                    onChange={handleNameChange}
                                    autoComplete="name"
                                />
                                {fieldErrors.name && (
                                    <div className="input-error">
                                        <AlertCircle />
                                        <span>{fieldErrors.name}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Email field */}
                        <div className={`input-group ${fieldErrors.email ? 'has-error' : ''}`}>
                            <label htmlFor="email">Email</label>
                            <Mail className="input-icon" />
                            <input
                                id="email"
                                type="email"
                                placeholder="nome@esempio.com"
                                value={email}
                                onChange={handleEmailChange}
                                autoComplete="email"
                            />
                            {fieldErrors.email && (
                                <div className="input-error">
                                    <AlertCircle />
                                    <span>{fieldErrors.email}</span>
                                </div>
                            )}
                        </div>

                        {/* Password field */}
                        <div className={`input-group ${fieldErrors.password ? 'has-error' : ''}`}>
                            <label htmlFor="password">Password</label>
                            <Lock className="input-icon" />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={handlePasswordChange}
                                autoComplete={isRegister ? 'new-password' : 'current-password'}
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
                            >
                                {showPassword ? <EyeOff /> : <Eye />}
                            </button>

                            {/* Password strength indicator (registration only) */}
                            {isRegister && password.length > 0 && (
                                <>
                                    <div className="password-strength">
                                        {[1, 2, 3, 4].map(level => (
                                            <div
                                                key={level}
                                                className={`strength-bar ${passwordStrength.level >= level ? STRENGTH_CLASSES[passwordStrength.level] : ''}`}
                                            />
                                        ))}
                                    </div>
                                    <p className={`strength-label ${STRENGTH_CLASSES[passwordStrength.level]}`}>
                                        {passwordStrength.label}
                                    </p>
                                </>
                            )}

                            {fieldErrors.password && (
                                <div className="input-error">
                                    <AlertCircle />
                                    <span>{fieldErrors.password}</span>
                                </div>
                            )}

                            {/* Forgot Password Link (login mode only) */}
                            {!isRegister && (
                                <button
                                    type="button"
                                    className="forgot-link"
                                    onClick={() => navigate('/forgot-password')}
                                >
                                    Password dimenticata?
                                </button>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className={`submit-button ${isSubmitting && !isSuccess ? 'loading' : ''} ${isSuccess ? 'success' : ''}`}
                            disabled={isSubmitting}
                        >
                            {isSuccess ? (
                                <>
                                    <Check className="check-icon" size={20} />
                                    Accesso riuscito
                                </>
                            ) : isSubmitting ? (
                                <span className="spinner" />
                            ) : (
                                isRegister ? 'Crea Account' : 'Accedi'
                            )}
                        </button>
                    </form>

                    {/* Toggle Register/Login */}
                    <p className="toggle-mode">
                        {isRegister ? (
                            <>
                                Hai già un account?{' '}
                                <button type="button" onClick={toggleMode}>
                                    Accedi
                                </button>
                            </>
                        ) : (
                            <>
                                Non hai un account?{' '}
                                <button type="button" onClick={toggleMode}>
                                    Registrati
                                </button>
                            </>
                        )}
                    </p>

                    {/* Divider Thin */}
                    <div className="divider-thin" />

                    {/* Guest Continue */}
                    <button className="guest-button" onClick={handleGuestContinue} type="button">
                        <span>Continua come ospite</span>
                        <ArrowRight className="guest-arrow" size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
