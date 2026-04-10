import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, BrainCircuit, BarChart3, LogOut, BookOpen } from 'lucide-react';
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
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.2rem', color: '#f8fafc', cursor: 'pointer' }}
        >
          <div style={{ background: '#3b82f6', color: 'white', padding: '0.4rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '1rem', lineHeight: 1 }}>PL</span>
          </div>
          <span className="hide-on-mobile">Quiz Polizia Locale</span>
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
