import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Toggle from '../components/ui/Toggle';
import { LogoutModal, DeleteAccountModal } from '../components/ui/AccountModals';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
// Import rimosso per build pulita
import { 
    LogOut, Trash2, ChevronRight, Info, FileText, 
    Award, Target, TrendingUp, Zap, Settings
} from 'lucide-react';

const Profile: React.FC = () => {
    const { showToast } = useToast();
    const { user, isAuthenticated } = useAuth();
    const { progressiGlobali } = useProgress();
    const navigate = useNavigate();
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    // Materie Nazionali Core
    const materieNazionali = useMemo(() => ['cds', 'tuel', 'l241', 'l689', 'penale'], []);

    // Calcolo statistiche reali
    const stats = useMemo(() => {
        const pg = progressiGlobali;
        if (!pg) return { level: 1, xp: 0, totalAnswered: 0, correctCount: 0, currentStreak: 0, accuracy: 0 };

        const perCategoria = pg.perCategoria || {};
        const totalAnsweredCore = materieNazionali.reduce((sum, id) => sum + (perCategoria[id]?.fatte ?? 0), 0);
        const correctCountCore = materieNazionali.reduce((sum, id) => sum + (perCategoria[id]?.corrette ?? 0), 0);

        return {
            level: pg.livello ?? 1,
            xp: pg.xp ?? 0,
            totalAnswered: totalAnsweredCore,
            correctCount: correctCountCore,
            currentStreak: pg.streak ?? 0,
            accuracy: totalAnsweredCore > 0 ? Math.round((correctCountCore / totalAnsweredCore) * 100) : 0,
        };
    }, [progressiGlobali, materieNazionali]);

    const [settings, setSettings] = useState({ sound: true });
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
        showToast(newVal ? "Notifiche studio attivate!" : "Notifiche disattivate", newVal ? "success" : "info");
    };

    const initials = useMemo(() => {
        if (!user?.displayName) return user?.email?.charAt(0).toUpperCase() || '?';
        return user.displayName.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
    }, [user]);

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>Il Tuo Profilo</h1>

                {/* User Card */}
                <div style={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '20px',
                    padding: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: '#0f172a',
                        border: '2px solid #3b82f6',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.75rem',
                        fontWeight: '800',
                        color: '#3b82f6',
                        overflow: 'hidden',
                        flexShrink: 0
                    }}>
                        {isAuthenticated && user?.photoURL ? (
                            <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : initials}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0 0 0.25rem 0', color: '#f8fafc' }}>
                            {isAuthenticated ? (user?.displayName || 'Agente Scelto') : 'Ospite'}
                        </h2>
                        <div style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                            {isAuthenticated ? user?.email : 'Account non registrato'}
                        </div>
                    </div>

                    {!isAuthenticated && (
                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                background: '#3b82f6',
                                color: '#fff',
                                border: 'none',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '12px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'background 0.2s',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#2563eb'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#3b82f6'}
                        >
                            Accedi
                        </button>
                    )}
                </div>

                {/* Stats Grid */}
                <section>
                    <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', letterSpacing: '0.1em', marginBottom: '1rem' }}>
                        LA TUA PERFORMANCE
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                        gap: '1rem',
                    }}>
                        {[
                            { label: 'Livello', val: stats.level, icon: Award, color: '#3b82f6' },
                            { label: 'XP Totali', val: stats.xp, icon: Zap, color: '#f59e0b' },
                            { label: 'Domande', val: stats.totalAnswered, icon: Target, color: '#ef4444' },
                            { label: 'Precisione', val: `${stats.accuracy}%`, icon: TrendingUp, color: '#22c55e' },
                        ].map((m, i) => (
                            <div key={i} style={{
                                background: '#1e293b',
                                border: '1px solid #334155',
                                borderRadius: '20px',
                                padding: '1.5rem',
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem',
                            }}>
                                <m.icon size={20} color={m.color} />
                                <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{m.val}</div>
                                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase' }}>{m.label}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Preferences */}
                <section>
                    <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', letterSpacing: '0.1em', marginBottom: '1rem' }}>
                        IMPOSTAZIONI APP
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Toggle label="Suoni Effetti" checked={settings.sound} onChange={handleSoundToggle} />
                        <Toggle label="Notifiche Studio" checked={notificationsEnabled} onChange={handleNotificationsToggle} />
                    </div>
                </section>

                {/* Account & Information */}
                {[
                    {
                        label: 'PREFERENZE STUDIO',
                        visible: isAuthenticated,
                        items: [
                            { label: 'Impostazioni Materie e Concorso', icon: Settings, action: () => navigate('/settings'), color: undefined }
                        ]
                    },
                    {
                        label: 'INFORMAZIONI',
                        visible: true,
                        items: [
                            { label: 'Chi Siamo', icon: Info, action: () => navigate('/chi-siamo'), color: undefined },
                            { label: 'Privacy Policy', icon: FileText, action: () => navigate('/privacy'), color: undefined },
                            { label: 'Termini di Servizio', icon: FileText, action: () => navigate('/terms'), color: undefined },
                        ]
                    },
                    {
                        label: 'ACCOUNT E SICUREZZA',
                        visible: isAuthenticated,
                        items: [
                            { label: 'Esci dall\'app', icon: LogOut, action: () => setShowLogoutModal(true), color: '#94a3b8' },
                            { label: 'Elimina account', icon: Trash2, action: () => setShowDeleteModal(true), color: '#ef4444' },
                        ]
                    }
                ].filter(s => s.visible).map((section, idx) => (
                    <section key={idx}>
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', letterSpacing: '0.1em', marginBottom: '1rem' }}>
                            {section.label}
                        </div>
                        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '24px', overflow: 'hidden' }}>
                            {section.items.map((item, i) => (
                                <button
                                    key={i}
                                    onClick={item.action}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '1.25rem 1.5rem',
                                        background: 'transparent',
                                        border: 'none',
                                        borderBottom: i < section.items.length - 1 ? '1px solid #334155' : 'none',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                        textAlign: 'left',
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <item.icon size={20} color={item.color || '#3b82f6'} style={{ marginRight: '1rem' }} />
                                    <span style={{ flex: 1, fontWeight: '600', color: item.color === '#ef4444' ? '#ef4444' : '#cbd5e1' }}>
                                        {item.label}
                                    </span>
                                    <ChevronRight size={18} color="#475569" />
                                </button>
                            ))}
                        </div>
                    </section>
                ))}

                {/* Promise Card */}
                <div style={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    textAlign: 'left',
                    marginTop: '1rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem'
                }}>
                    <div style={{ color: '#3b82f6', marginTop: '0.25rem' }}>
                        <Target size={24} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#f8fafc', margin: '0 0 0.5rem 0' }}>Sempre Aggiornato</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                            Il database viene costantemente espanso con nuove normative e quiz. Il nostro impegno è fornire la migliore preparazione possibile per il tuo esame.
                        </p>
                    </div>
                </div>

                {/* Modals */}
                <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />
                <DeleteAccountModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} />
            </div>
        </div>
    );
};

export default Profile;
