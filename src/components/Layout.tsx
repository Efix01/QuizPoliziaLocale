import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, BrainCircuit, BarChart3, LogOut, BookOpen, User } from 'lucide-react';
import { getAuth, signOut } from 'firebase/auth';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Errore durante il logout', error);
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Home', icon: Home },
    { path: '/quiz-builder', label: 'Quiz', icon: BrainCircuit },
    { path: '/progress', label: 'Statistiche', icon: BarChart3 },
    { path: '/library', label: 'Libreria', icon: BookOpen },
    { path: '/profile', label: 'Profilo', icon: User },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navbar fissa in alto */}
      <nav style={{ 
        position: 'sticky', top: 0, zIndex: 50, 
        background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)', 
        borderBottom: '1px solid #334155', padding: '0.75rem 1.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        {/* Logo visivo */}
        <div
          onClick={() => navigate('/dashboard')}
          style={{ cursor: 'pointer', transition: 'opacity 0.2s, transform 0.2s' }}
          onMouseOver={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'scale(1.03)'; }}
          onMouseOut={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <img src="/logo_quiz_pol_locale.png" alt="Quiz Polizia Locale" style={{ height: '44px', objectFit: 'contain', display: 'block' }} />
        </div>

        {/* Link di navigazione */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  background: isActive ? '#1e293b' : 'transparent',
                  color: isActive ? '#3b82f6' : '#94a3b8',
                  border: 'none', padding: '0.5rem 0.75rem', borderRadius: '8px',
                  cursor: 'pointer', fontWeight: isActive ? '600' : '500',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => !isActive && (e.currentTarget.style.color = '#f8fafc')}
                onMouseOut={(e) => !isActive && (e.currentTarget.style.color = '#94a3b8')}
                title={item.label}
              >
                <Icon size={20} />
                <span style={{ display: 'none' }} className="show-on-desktop">{item.label}</span>
              </button>
            );
          })}

          <div style={{ width: '1px', height: '24px', background: '#334155', margin: '0 0.5rem' }} />

          {/* Tasto Logout */}
          <button 
            onClick={handleLogout}
            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center', borderRadius: '8px' }}
            title="Esci"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* Contenuto dinamico della pagina */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>

    </div>
  );
}
