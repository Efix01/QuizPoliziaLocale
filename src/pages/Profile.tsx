import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Toggle from '../components/ui/Toggle';
import { LogoutModal, DeleteAccountModal } from '../components/ui/AccountModals';
import { useToast } from '../context/ToastContext';
import { useQuiz } from '../context/QuizContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { User, LogOut, Trash2, ChevronRight } from 'lucide-react';
import './Profile.css';

const Profile: React.FC = () => {
    const { showToast } = useToast();
    const { stats } = useQuiz();
    const { user, isAuthenticated } = useAuth();
    const { notificationsEnabled, setNotificationsEnabled } = useNotifications();
    const navigate = useNavigate();

    const [settings, setSettings] = useState({
        sound: true
    });

    // Modal states
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleSoundToggle = () => {
        setSettings(prev => {
            const newVal = !prev.sound;
            if (!newVal) showToast("Suoni disattivati", "info");
            return { ...prev, sound: newVal };
        });
    };

    const handleNotificationsToggle = () => {
        const newVal = !notificationsEnabled;
        setNotificationsEnabled(newVal);
        if (newVal) {
            showToast("Notifiche studio attivate!", "success");
        } else {
            showToast("Notifiche disattivate", "info");
        }
    };

    // Calculate stats
    const accuracy = stats.totalAnswered > 0
        ? Math.round((stats.correctCount / stats.totalAnswered) * 100)
        : 0;

    // Get user initials for avatar fallback
    const getInitials = () => {
        if (!user?.displayName) return user?.email?.charAt(0).toUpperCase() || '?';
        return user.displayName
            .split(' ')
            .map(n => n.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="profile-container">
            <h1 className="profile-title">Profilo</h1>

            {/* User Card */}
            <div className="user-card">
                <div className="user-header">
                    <div className="user-avatar">
                        {isAuthenticated && user?.photoURL ? (
                            <img src={user.photoURL} alt="" className="user-avatar-img" />
                        ) : isAuthenticated ? (
                            <span className="user-avatar-initials">{getInitials()}</span>
                        ) : (
                            <User />
                        )}
                    </div>
                    <div className="user-info">
                        <h2>{isAuthenticated ? (user?.displayName || 'Utente') : 'Ospite'}</h2>
                        <span className="user-id">
                            {isAuthenticated ? user?.email : 'Non registrato'}
                        </span>
                    </div>
                </div>

                {!isAuthenticated && (
                    <button
                        className="user-details-btn"
                        onClick={() => navigate('/login')}
                    >
                        Accedi o Registrati
                    </button>
                )}
            </div>

            {/* Stats Card */}
            <span className="section-label">Le tue Statistiche</span>
            <div className="stats-card">
                <div className="stats-grid">
                    <div className="stats-item">
                        <span className="stats-item-value">{stats.level}</span>
                        <span className="stats-item-label">Livello</span>
                    </div>
                    <div className="stats-item">
                        <span className="stats-item-value">{stats.totalAnswered}</span>
                        <span className="stats-item-label">Domande</span>
                    </div>
                    <div className="stats-item">
                        <span className="stats-item-value">{accuracy}%</span>
                        <span className="stats-item-label">Precisione</span>
                    </div>
                    <div className="stats-item">
                        <span className="stats-item-value">{stats.currentStreak}</span>
                        <span className="stats-item-label">Streak</span>
                    </div>
                </div>
            </div>

            {/* Settings */}
            <span className="section-label">Impostazioni</span>
            <div className="settings-card">
                <Toggle
                    label="Suoni Effetti"
                    checked={settings.sound}
                    onChange={handleSoundToggle}
                />
                <Toggle
                    label="Notifiche Studio"
                    checked={notificationsEnabled}
                    onChange={handleNotificationsToggle}
                />
            </div>

            {/* Account Section - Only for authenticated users */}
            {isAuthenticated && (
                <>
                    <span className="section-label">Account</span>
                    <div className="account-card">
                        <button
                            className="account-row"
                            onClick={() => setShowLogoutModal(true)}
                        >
                            <div className="account-row-left">
                                <LogOut className="account-icon" />
                                <span>Esci dall'app</span>
                            </div>
                            <ChevronRight className="account-chevron" />
                        </button>

                        <button
                            className="account-row account-row--danger"
                            onClick={() => setShowDeleteModal(true)}
                        >
                            <div className="account-row-left">
                                <Trash2 className="account-icon" />
                                <span>Elimina account</span>
                            </div>
                            <ChevronRight className="account-chevron" />
                        </button>
                    </div>
                </>
            )}

            {/* Modals */}
            <LogoutModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
            />
            <DeleteAccountModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
            />
        </div>
    );
};

export default Profile;
