import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    deleteUser,
    reauthenticateWithCredential,
    EmailAuthProvider,
    reauthenticateWithPopup,
    GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AlertTriangle, ShieldCheck, Lock, Eye, EyeOff, Check } from 'lucide-react';
import './AccountModals.css';

interface LogoutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose }) => {
    const { logout } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            await logout();
            localStorage.removeItem('userSession');
            showToast('Sei uscito correttamente', 'success');
            navigate('/');
            onClose();
        } catch {
            showToast('Errore durante il logout', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card" onClick={e => e.stopPropagation()}>
                <h2 className="modal-title">Vuoi uscire?</h2>
                <p className="modal-message">
                    Potrai accedere di nuovo in qualsiasi momento.
                </p>
                <div className="modal-buttons">
                    <button className="btn-secondary" onClick={onClose}>
                        Annulla
                    </button>
                    <button
                        className={`btn-primary ${isLoading ? 'loading' : ''}`}
                        onClick={handleLogout}
                        disabled={isLoading}
                    >
                        {isLoading ? <span className="spinner" /> : 'Esci'}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface DeleteAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState<'warning' | 'reauth' | 'success'>('warning');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isGoogleUser = user?.providerData?.[0]?.providerId === 'google.com';

    const handleClose = () => {
        setStep('warning');
        setPassword('');
        setError(null);
        onClose();
    };

    const handleConfirmWarning = () => {
        setStep('reauth');
    };

    const handleGoogleReauth = async () => {
        if (!auth.currentUser) return;

        setIsLoading(true);
        setError(null);

        try {
            const provider = new GoogleAuthProvider();
            await reauthenticateWithPopup(auth.currentUser, provider);
            await performDeletion();
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'code' in err) {
                const code = (err as { code: string }).code;
                if (code === 'auth/popup-closed-by-user') {
                    setError('Conferma annullata.');
                } else {
                    setError('Errore durante la conferma Google.');
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordReauth = async () => {
        if (!auth.currentUser || !user?.email) return;

        setIsLoading(true);
        setError(null);

        try {
            const credential = EmailAuthProvider.credential(user.email, password);
            await reauthenticateWithCredential(auth.currentUser, credential);
            await performDeletion();
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'code' in err) {
                const code = (err as { code: string }).code;
                if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
                    setError('Password non corretta.');
                } else {
                    setError('Errore durante la verifica.');
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    const performDeletion = async () => {
        if (!auth.currentUser) return;

        try {
            await deleteUser(auth.currentUser);
            localStorage.clear();
            setStep('success');

            setTimeout(() => {
                navigate('/');
                handleClose();
            }, 2000);
        } catch {
            setError('Errore durante l\'eliminazione.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-card modal-card--delete" onClick={e => e.stopPropagation()}>

                {/* Step 1: Warning */}
                {step === 'warning' && (
                    <div className="modal-content">
                        <div className="modal-icon modal-icon--warning">
                            <AlertTriangle />
                        </div>
                        <h2 className="modal-title">Eliminare l'account?</h2>
                        <p className="modal-message">
                            Questa azione è <strong className="text-danger">IRREVERSIBILE</strong>.<br />
                            Tutti i tuoi dati verranno cancellati definitivamente.
                        </p>
                        <button className="btn-primary btn-full" onClick={handleClose}>
                            Annulla
                        </button>
                        <button
                            className="link-danger"
                            onClick={handleConfirmWarning}
                        >
                            Sì, voglio eliminare
                        </button>
                    </div>
                )}

                {/* Step 2: Re-authentication */}
                {step === 'reauth' && (
                    <div className="modal-content">
                        <div className="modal-icon modal-icon--auth">
                            <ShieldCheck />
                        </div>
                        <h2 className="modal-title">Conferma la tua identità</h2>

                        {isGoogleUser ? (
                            <>
                                <p className="modal-message">
                                    Hai effettuato l'accesso con Google.<br />
                                    Clicca sotto per confermare.
                                </p>

                                {error && <div className="modal-error">{error}</div>}

                                <button
                                    className={`btn-google ${isLoading ? 'loading' : ''}`}
                                    onClick={handleGoogleReauth}
                                    disabled={isLoading}
                                >
                                    <svg viewBox="0 0 24 24" width="20" height="20">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    {isLoading ? 'Conferma...' : 'Conferma con Google'}
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="modal-message">
                                    Per sicurezza, inserisci nuovamente la password.
                                </p>

                                {error && <div className="modal-error">{error}</div>}

                                <div className="modal-input-group">
                                    <Lock className="input-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff /> : <Eye />}
                                    </button>
                                </div>

                                <button
                                    className={`btn-danger btn-full ${isLoading ? 'loading' : ''}`}
                                    onClick={handlePasswordReauth}
                                    disabled={isLoading || !password}
                                >
                                    {isLoading ? <span className="spinner" /> : 'Elimina definitivamente'}
                                </button>
                            </>
                        )}

                        <button className="link-muted" onClick={handleClose}>
                            Annulla
                        </button>
                    </div>
                )}

                {/* Step 3: Success */}
                {step === 'success' && (
                    <div className="modal-content">
                        <div className="modal-icon modal-icon--success">
                            <Check />
                        </div>
                        <h2 className="modal-title">Account eliminato</h2>
                        <p className="modal-message">
                            Il tuo account è stato rimosso con successo.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
