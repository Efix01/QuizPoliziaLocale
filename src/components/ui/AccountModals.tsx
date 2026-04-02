import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AlertTriangle, ShieldCheck, Check } from 'lucide-react';
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
    const { deleteAccount } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [step, setStep] = useState<'warning' | 'confirm' | 'success'>('warning');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleClose = () => {
        setStep('warning');
        setError(null);
        onClose();
    };

    const handleConfirmWarning = () => {
        setStep('confirm');
    };

    const performDeletion = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await deleteAccount();
            setStep('success');
            setTimeout(() => {
                navigate('/');
                handleClose();
            }, 2500);
        } catch (err: any) {
            setError(err.message || 'Errore durante l\'eliminazione dell\'account.');
            showToast('Errore durante l\'eliminazione', 'error');
        } finally {
            setIsLoading(false);
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

                {/* Step 2: Final Confirmation */}
                {step === 'confirm' && (
                    <div className="modal-content">
                        <div className="modal-icon modal-icon--auth">
                            <ShieldCheck size={48} />
                        </div>
                        <h2 className="modal-title">Conferma Finale</h2>

                        <p className="modal-message">
                            Tutti i tuoi progressi, statistice e dati di studio verranno <strong className="text-danger">ELIMINATI PER SEMPRE</strong> dai nostri server.
                        </p>

                        {error && <div className="modal-error" style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</div>}

                        <button
                            className={`btn-danger btn-full ${isLoading ? 'loading' : ''}`}
                            onClick={performDeletion}
                            disabled={isLoading}
                        >
                            {isLoading ? <span className="spinner" /> : 'Sì, elimina tutto'}
                        </button>

                        <button className="link-muted" onClick={handleClose}>
                            Annulla e Torna Indietro
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
