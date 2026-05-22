import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, BrainCircuit, Calendar, ClipboardCheck, 
  AlertTriangle, BarChart3, Trophy, BookOpen, 
  User, Settings, LogOut, Search, Bell, Flame, 
  Sparkles, Award, Play, X, Shield
} from 'lucide-react';
import { getAuth, signOut } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { useNotifications } from '../context/NotificationContext';
import { useQuizPL } from '../hooks/useQuizPL';
import { useToast } from '../context/ToastContext';
import { ottieniGradoCorrente } from '../utils/gradi';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();
  const { user } = useAuth();
  const { progressiGlobali } = useProgress();
  const { notifications, unreadCount, dismissNotification, clearAllNotifications } = useNotifications();
  const { generaQuizVeloce } = useQuizPL();
  const { showToast } = useToast();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isPremium, setIsPremium] = useState(() => localStorage.getItem('pl_premium') === 'true');
  const [activeSession, setActiveSession] = useState<any>(null);
  
  const notificationRef = useRef<HTMLDivElement>(null);

  // Aggiorna responsive layout
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Chiudi le notifiche se clicchi fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ascolta tasti rapidi (⌘K per ricerca)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        showToast("Ricerca rapida: in arrivo nel prossimo aggiornamento! 🔍", "info");
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showToast]);

  // Controlla sessione attiva in localStorage
  useEffect(() => {
    const checkActiveSession = () => {
      const activeSessionStr = localStorage.getItem('pl_active_session');
      if (activeSessionStr) {
        try {
          const parsed = JSON.parse(activeSessionStr);
          if (parsed && parsed.state && parsed.state.domande && parsed.state.domande.length > 0) {
            setActiveSession(parsed);
            return;
          }
        } catch (e) {}
      }
      setActiveSession(null);
    };

    checkActiveSession();
    const interval = setInterval(checkActiveSession, 3000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Errore durante il logout', error);
    }
  };

  const handleTogglePremium = () => {
    const nextVal = !isPremium;
    setIsPremium(nextVal);
    if (nextVal) {
      localStorage.setItem('pl_premium', 'true');
      showToast("Premium Attivato con Successo! 🚀 Benvenuto nell'Elite.", "success");
    } else {
      localStorage.removeItem('pl_premium');
      showToast("Abbonamento Premium disattivato.", "info");
    }
    setShowPremiumModal(false);
  };

  const handleFloatingCtaClick = () => {
    if (activeSession) {
      navigate('/study', {
        state: {
          ...activeSession.state,
          resumeIndex: activeSession.currentIndex,
          savedAnswers: activeSession.risposteDate,
          savedTimeLeft: activeSession.timeLeft,
        }
      });
      showToast("Ripresa sessione interrotta ⚡", "success");
    } else {
      const randomQuestions = generaQuizVeloce(5);
      if (randomQuestions && randomQuestions.length > 0) {
        navigate('/study', {
          state: {
            domande: randomQuestions,
            mode: 'micro_session'
          }
        });
        showToast("Avvio Sfida Rapida ⏱️ (5 Quiz random)", "success");
      } else {
        showToast("Nessuna domanda disponibile per la sfida.", "error");
      }
    }
  };

  // Calcolo dati utente e progresso
  const xp = progressiGlobali?.xp || 0;
  const livello = progressiGlobali?.livello || 1;
  const streak = progressiGlobali?.streak || 0;
  
  const xpPerLivello = 1000;
  const xpLivelloCorrente = xp % xpPerLivello;
  const progressPct = Math.min(100, Math.round((xpLivelloCorrente / xpPerLivello) * 100));

  const grado = ottieniGradoCorrente(livello);

  const initials = user?.displayName
    ? user.displayName.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() || '?';

  // Elementi Menu Principale
  const navItems = [
    { path: '/dashboard', label: 'Home', icon: Home },
    { path: '/quiz-builder', label: 'Quiz Adattivi', icon: BrainCircuit },
    { path: '/study-plan', label: 'Piano Studio', icon: Calendar },
    { path: '/simulation', label: 'Simulazioni', icon: ClipboardCheck },
    { path: '/mistakes', label: 'Ripasso Errori', icon: AlertTriangle },
    { path: '/progress', label: 'Statistiche', icon: BarChart3 },
    { path: '/leaderboard', label: 'Classifica', icon: Trophy },
    { path: '/library', label: 'Libreria Leggi', icon: BookOpen },
    { path: '/profile', label: 'Profilo', icon: User },
    { path: '/settings', label: 'Impostazioni', icon: Settings },
  ];

  // Elementi Bottom Nav Mobile (5 elementi chiave)
  const mobileNavItems = [
    { path: '/dashboard', label: 'Home', icon: Home },
    { path: '/quiz-builder', label: 'Quiz', icon: BrainCircuit },
    { path: '/simulation', label: 'Simula', icon: ClipboardCheck },
    { path: '/mistakes', label: 'Errori', icon: AlertTriangle },
    { path: '/profile', label: 'Profilo', icon: User },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', display: 'flex', color: '#f8fafc', fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      
      {/* 1. DESKTOP SIDEBAR */}
      {!isMobile && (
        <aside style={{
          width: '260px',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          background: '#0c1322',
          borderRight: '1px solid var(--border-elite)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '1.5rem 1rem',
          zIndex: 40,
        }}>
          {/* Logo e Titolo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div 
              onClick={() => navigate('/dashboard')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
            >
              <img src="/logo_quiz_pol_locale.png" alt="Logo" style={{ height: '36px', objectFit: 'contain' }} />
              <div>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  ELITE POLIZIA
                </span>
                <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--elite-primary)', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase' }}>
                  Academy
                </span>
              </div>
            </div>

            {/* Menu Links */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                      color: isActive ? '#fff' : '#94a3b8',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.88rem',
                      fontWeight: isActive ? '600' : '500',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={e => {
                      if (!isActive) {
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                      }
                    }}
                    onMouseOut={e => {
                      if (!isActive) {
                        e.currentTarget.style.color = '#94a3b8';
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <Icon size={18} color={isActive ? 'var(--elite-primary)' : '#64748b'} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Footer della Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid #1e293b', paddingTop: '1rem' }}>
            
            {/* Streak Indicator */}
            {streak > 0 && (
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  background: 'rgba(249, 115, 22, 0.08)', 
                  border: '1px solid rgba(249, 115, 22, 0.2)',
                  borderRadius: '10px',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  color: '#f97316'
                }}
              >
                <Flame size={16} fill="#f97316" color="#f97316" style={{ animation: 'pulse 2s infinite' }} />
                <span>Studio da {streak} giorni di fila!</span>
              </div>
            )}

            {/* Premium Box */}
            <div 
              onClick={() => setShowPremiumModal(true)}
              className={isPremium ? 'premium-glow' : ''}
              style={{
                background: isPremium 
                  ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.05) 100%)' 
                  : 'rgba(30, 41, 59, 0.4)',
                border: isPremium ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid var(--border-elite)',
                borderRadius: '14px',
                padding: '0.8rem 1rem',
                cursor: 'pointer',
                transition: 'all 0.3s',
                textAlign: 'center',
              }}
              onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.5)'}
              onMouseOut={e => e.currentTarget.style.borderColor = isPremium ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-elite)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                {isPremium ? (
                  <>
                    <Sparkles size={16} color="#f59e0b" fill="#f59e0b" />
                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#f59e0b' }}>PROFILO PREMIUM</span>
                  </>
                ) : (
                  <>
                    <Award size={16} color="#a855f7" />
                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#a855f7' }}>ATTIVA PREMIUM</span>
                  </>
                )}
              </div>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>
                {isPremium ? "Tutte le feature attivate 🌟" : "Sblocca AI Tutor e Simulazioni 👑"}
              </p>
            </div>

            {/* Esci */}
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'transparent',
                border: 'none',
                color: '#ef4444',
                fontSize: '0.82rem',
                fontWeight: '600',
                cursor: 'pointer',
                padding: '0.25rem 0.5rem',
                width: 'fit-content'
              }}
            >
              <LogOut size={14} /> Disconnetti
            </button>
          </div>
        </aside>
      )}

      {/* 2. MAIN LAYOUT SHELL */}
      <div style={{
        flex: 1,
        marginLeft: isMobile ? 0 : '260px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        
        {/* DESKTOP TOP BAR & MOBILE HEADER */}
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          background: 'rgba(9, 13, 22, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-elite)',
          height: '64px',
          padding: '0 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          {isMobile ? (
            // Mobile Brand
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src="/logo_quiz_pol_locale.png" alt="Logo" style={{ height: '32px' }} />
              <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fff' }}>ELITE ACADEMY</span>
            </div>
          ) : (
            // Desktop Notion Search
            <div style={{ position: 'relative', width: '300px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input 
                type="text" 
                placeholder="Cerca argomenti o leggi... (⌘K)" 
                readOnly
                onClick={() => showToast("Ricerca rapida in arrivo con il database completo! 🔍", "info")}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid var(--border-elite)',
                  borderRadius: '10px',
                  padding: '0.45rem 1rem 0.45rem 2.1rem',
                  fontSize: '0.82rem',
                  color: '#f8fafc',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              />
            </div>
          )}

          {/* Destra: Notifiche, Livello e Profilo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            
            {/* Notification Bell */}
            <div style={{ position: 'relative' }} ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  padding: '0.4rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    background: '#ef4444',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                  }} />
                )}
              </button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    style={{
                      position: 'absolute',
                      top: '40px',
                      right: 0,
                      width: '320px',
                      background: '#131c2e',
                      border: '1px solid var(--border-elite)',
                      borderRadius: '14px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
                      padding: '1rem',
                      zIndex: 100,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Notifiche ({unreadCount})</span>
                      {notifications.length > 0 && (
                        <button
                          onClick={clearAllNotifications}
                          style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}
                        >
                          Segna come lette
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '240px', overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '1.5rem 0', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                          Nessuna notifica al momento.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            style={{
                              display: 'flex',
                              gap: '0.5rem',
                              padding: '0.5rem',
                              borderRadius: '8px',
                              background: 'rgba(255,255,255,0.02)',
                              position: 'relative'
                            }}
                          >
                            <span style={{ fontSize: '1.25rem' }}>{notif.icon}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.8rem', fontWeight: '700' }}>{notif.title}</div>
                              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.1rem', lineHeight: '1.2' }}>{notif.message}</div>
                            </div>
                            <button
                              onClick={() => dismissNotification(notif.id)}
                              style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', alignSelf: 'flex-start' }}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Career/Level Bar (Desktop) */}
            {!isMobile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: '1px solid #1e293b', paddingLeft: '1.25rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end' }}>
                    <span>{grado.badgeEmoji}</span>
                    <span>{grado.titolo}</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                    Livello {livello} ({xpLivelloCorrente}/1000 XP)
                  </div>
                </div>

                {/* Level Progress Bar */}
                <div style={{ width: '60px', height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${progressPct}%`, height: '100%', background: 'linear-gradient(90deg, var(--elite-primary), var(--elite-accent))', borderRadius: '3px' }} />
                </div>
              </div>
            )}

            {/* Profile Avatar */}
            <div 
              onClick={() => navigate('/profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--elite-primary), var(--elite-accent))',
                color: '#fff',
                fontWeight: '800',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isPremium ? '0 0 10px rgba(245,158,11,0.3)' : 'none'
              }}>
                {initials}
              </div>
            </div>

          </div>
        </header>

        {/* CONTENUTO PAGINA ATTIVA */}
        <main style={{ 
          flex: 1, 
          padding: isMobile ? '1rem 0.75rem' : '2rem',
          paddingBottom: isMobile ? '80px' : '2rem' // Spazio per bottom nav mobile
        }}>
          <Outlet />
        </main>

        {/* 3. MOBILE BOTTOM NAV */}
        {isMobile && (
          <nav style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '64px',
            background: 'rgba(12, 19, 34, 0.95)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid var(--border-elite)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            zIndex: 40,
            paddingBottom: 'env(safe-area-inset-bottom)'
          }}>
            {mobileNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                    border: 'none',
                    color: isActive ? 'var(--elite-primary)' : '#64748b',
                    fontSize: '0.65rem',
                    fontWeight: isActive ? '700' : '500',
                    cursor: 'pointer',
                    gap: '0.2rem',
                  }}
                >
                  <Icon size={20} color={isActive ? 'var(--elite-primary)' : '#64748b'} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        )}

        {/* 4. FLOATING ACTION CTA ON MOBILE */}
        {isMobile && (
          <div style={{
            position: 'fixed',
            bottom: '80px',
            right: '16px',
            zIndex: 45,
          }}>
            <button
              onClick={handleFloatingCtaClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'linear-gradient(135deg, var(--elite-primary) 0%, var(--elite-accent) 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '30px',
                padding: '0.65rem 1rem',
                boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
                fontSize: '0.78rem',
                fontWeight: '800',
                cursor: 'pointer',
                animation: 'pulse 2.5s infinite',
              }}
            >
              <Play size={12} fill="#fff" />
              <span>{activeSession ? 'Riprendi Quiz ⚡' : 'Sfida Rapida ⏱️'}</span>
            </button>
          </div>
        )}

      </div>

      {/* 5. MOCK PREMIUM MODAL */}
      <AnimatePresence>
        {showPremiumModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(9, 13, 22, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '1rem',
          }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                maxWidth: '480px',
                width: '100%',
                background: '#131c2e',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '24px',
                padding: '2rem',
                position: 'relative',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              }}
            >
              <button
                onClick={() => setShowPremiumModal(false)}
                style={{
                  position: 'absolute',
                  top: '1.25rem',
                  right: '1.25rem',
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer'
                }}
              >
                <X size={20} />
              </button>

              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(245, 158, 11, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}>
                  <Award size={32} color="#f59e0b" fill="#f59e0b" />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', margin: 0 }}>
                  Passa all'Elite Premium
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: '0.4rem' }}>
                  Supera il concorso di Polizia Locale con gli strumenti migliori.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
                {[
                  { text: "Copilota AI Didattico attivo 24/7 per ogni spiegazione", icon: Sparkles, color: '#f59e0b' },
                  { text: "Simulazioni d'esame reali illimitate e senza pubblicità", icon: ClipboardCheck, color: '#3b82f6' },
                  { text: "Database completo con +10.000 domande sempre aggiornate", icon: Shield, color: '#10b981' },
                  { text: "Spiegazioni dettagliate con riferimenti normativi per ogni quiz", icon: BookOpen, color: '#a855f7' },
                  { text: "Statistiche avanzate di precisione e stima superamento esame", icon: BarChart3, color: '#ec4899' },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <div style={{ flexShrink: 0 }}>
                        <Icon size={16} color={item.color} />
                      </div>
                      <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{item.text}</span>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleTogglePremium}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#0f172a',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.85rem',
                  fontWeight: '800',
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
                  transition: 'opacity 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
                onMouseOut={e => e.currentTarget.style.opacity = '1'}
              >
                {isPremium ? 'Disattiva Account Premium Demo ❌' : 'Attiva Premium Demo Gratis 🚀'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 4px 15px rgba(99,102,241,0.4); }
          50% { transform: scale(1.04); box-shadow: 0 4px 20px rgba(99,102,241,0.6); }
          100% { transform: scale(1); box-shadow: 0 4px 15px rgba(99,102,241,0.4); }
        }
        .premium-glow {
          box-shadow: 0 0 12px rgba(245, 158, 11, 0.15);
          animation: borderGlow 3s infinite alternate;
        }
        @keyframes borderGlow {
          from { border-color: rgba(245, 158, 11, 0.3); }
          to { border-color: rgba(245, 158, 11, 0.6); }
        }
      `}</style>

    </div>
  );
}
