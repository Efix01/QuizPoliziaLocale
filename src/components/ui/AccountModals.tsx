import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuth } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AlertTriangle, ShieldCheck, Check, X, Eye, EyeOff } from 'lucide-react';

const auth = getAuth();

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

    return (
        <AnimatePresence>
            {isOpen && (
                <div 
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(15, 23, 42, 0.8)',
                        backdropFilter: 'blur(8px)',
                        padding: '1rem',
                    }}
                    onClick={onClose}
                >
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        style={{
                            width: '100%',
                            maxWidth: '400px',
                            background: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '24px',
                            padding: '2rem',
                            position: 'relative',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button 
                            onClick={onClose}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
                        >
                            <X size={20} />
                        </button>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#f8fafc', marginBottom: '1rem', marginTop: '0.5rem' }}>
                            Vuoi uscire?
                        </h2>
                        <p style={{ color: '#94a3b8', marginBottom: '2rem', lineHeight: 1.6 }}>
                            Potrai accedere di nuovo in qualsiasi momento per riprendere i tuoi studi.
                        </p>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button 
                                onClick={onClose}
                                style={{
                                    flex: 1,
                                    padding: '0.9rem',
                                    borderRadius: '12px',
                                    border: '1px solid #334155',
                                    background: 'transparent',
                                    color: '#cbd5e1',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                }}
                            >
                                Annulla
                            </button>
                            <button
                                onClick={handleLogout}
                                disabled={isLoading}
                                style={{
                                    flex: 1,
                                    padding: '0.9rem',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: '#3b82f6',
                                    color: '#fff',
                                    fontWeight: '700',
                                    cursor: isLoading ? 'default' : 'pointer',
                                    opacity: isLoading ? 0.7 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {isLoading ? <div className="loader-small" /> : 'Esce ora'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

interface DeleteAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose }) => {
    const { deleteAccount } = useAuth();
    useToast(); // mantenuto per coerenza col provider
    const navigate = useNavigate();

    const [step, setStep] = useState<'warning' | 'confirm' | 'success'>('warning');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleClose = () => {
        setStep('warning');
        setError(null);
        setPassword('');
        onClose();
    };

    const isGoogle = auth.currentUser?.providerData[0]?.providerId === 'google.com';

    const performDeletion = async () => {
        if (!isGoogle && !password) {
            setError('Inserisci la password per confermare l\'eliminazione.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            await deleteAccount(isGoogle ? undefined : password);
            setStep('success');
            setTimeout(() => {
                navigate('/');
                handleClose();
            }, 2500);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Errore durante l\'eliminazione.';
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div 
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(15, 23, 42, 0.8)',
                        backdropFilter: 'blur(8px)',
                        padding: '1rem',
                    }}
                    onClick={handleClose}
                >
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        style={{
                            width: '100%',
                            maxWidth: '400px',
                            background: '#1e293b',
                            border: `1px solid ${step === 'warning' ? '#ef4444' : '#334155'}`,
                            borderRadius: '24px',
                            padding: '2rem',
                            textAlign: 'center',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {step === 'warning' && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '50%', padding: '1rem', marginBottom: '1.5rem' }}>
                                    <AlertTriangle size={48} />
                                </div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#f8fafc', marginBottom: '1rem' }}>Eliminare l'account?</h2>
                                <p style={{ color: '#94a3b8', marginBottom: '2rem', lineHeight: 1.6 }}>
                                    Questa azione è <strong style={{ color: '#ef4444' }}>IRREVERSIBILE</strong>.<br />
                                    Tutti i tuoi dati verranno cancellati definitivamente.
                                </p>
                                <button 
                                    onClick={handleClose}
                                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: '#3b82f6', color: '#fff', border: 'none', fontWeight: '700', marginBottom: '1rem', cursor: 'pointer' }}
                                >
                                    Annulla e Rimani
                                </button>
                                <button
                                    onClick={() => setStep('confirm')}
                                    style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    Sì, voglio procedere
                                </button>
                            </div>
                        )}

                        {step === 'confirm' && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', borderRadius: '50%', padding: '1rem', marginBottom: '1.5rem' }}>
                                    <ShieldCheck size={48} />
                                </div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#f8fafc', marginBottom: '1rem' }}>Sei proprio sicuro?</h2>
                                <p style={{ color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                                    Perderai tutti i progressi e le statistiche accumulate finora.
                                </p>

                                {/* Campo password per utenti email/password */}
                                {!isGoogle && (
                                    <div style={{ width: '100%', marginBottom: '1.5rem', textAlign: 'left' }}>
                                        <label style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                                            Inserisci la tua password per confermare:
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                style={{
                                                    width: '100%', padding: '0.9rem 3rem 0.9rem 1rem',
                                                    background: '#0f172a', border: '1px solid #334155',
                                                    borderRadius: '12px', color: '#f8fafc',
                                                    fontSize: '1rem', boxSizing: 'border-box', outline: 'none',
                                                }}
                                                onKeyDown={e => e.key === 'Enter' && performDeletion()}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(p => !p)}
                                                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {error && <div style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '1rem', width: '100%', textAlign: 'left' }}>{error}</div>}
                                <button
                                    onClick={performDeletion}
                                    disabled={isLoading}
                                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: '#ef4444', color: '#fff', border: 'none', fontWeight: '700', marginBottom: '1rem', cursor: isLoading ? 'default' : 'pointer', opacity: isLoading ? 0.7 : 1 }}
                                >
                                    {isLoading ? 'Cancellazione in corso...' : 'Sì, elimina tutto'}
                                </button>
                                <button
                                    onClick={handleClose}
                                    style={{ background: 'transparent', border: 'none', color: '#64748b', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    Annulla
                                </button>
                            </div>
                        )}

                        {step === 'success' && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '50%', padding: '1rem', marginBottom: '1.5rem' }}>
                                    <Check size={48} />
                                </div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#f8fafc', marginBottom: '1rem' }}>Account eliminato</h2>
                                <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>
                                    Il tuo account è stato rimosso con successo. A presto.
                                </p>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
