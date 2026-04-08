import { Outlet, Link, useLocation } from 'react-router-dom';
import { Cpu, Edit3, Shield, LogOut, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      console.error("Errore logout");
    }
  };

  const navItems = [
    { name: 'Panoramica', path: '/admin', icon: <Shield size={20} /> },
    { name: 'Cyborg Inbox', path: '/admin/cyborg-inbox', icon: <Cpu size={20} /> },
    { name: 'Carica Quiz', path: '/admin/carica-quiz', icon: <Upload size={20} /> },
    { name: 'Editor Domande', path: '/admin/editor-domande', icon: <Edit3 size={20} /> },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#020617', color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      
      {/* SIDEBAR */}
      <aside style={{ width: '260px', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', background: '#0f172a' }}>
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: '#10b981', padding: '0.5rem', borderRadius: '10px' }}>
            <Cpu size={24} color="#020617" />
          </div>
          <div>
            <h1 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, letterSpacing: '0.5px' }}>PANNELLO <span style={{ color: '#10b981' }}>CYBORG</span></h1>
            <p style={{ fontSize: '0.7rem', color: '#64748b', margin: 0, marginTop: '2px' }}>Accesso Riservato</p>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => {
            // Se exact match per '/admin', oppure include il path lungo per i sotto-router
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.includes(item.path));
            
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem 1rem', 
                  borderRadius: '10px', textDecoration: 'none', 
                  background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                  color: isActive ? '#10b981' : '#94a3b8',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.2s ease'
                }}
              >
                {item.icon}
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '1.5rem 1rem', borderTop: '1px solid #1e293b' }}>
          <button 
            onClick={handleLogout}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem 1rem', 
              width: '100%', background: 'transparent', border: 'none', color: '#ef4444', 
              cursor: 'pointer', fontWeight: 600, borderRadius: '10px', transition: 'background 0.2s' 
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut size={20} />
            Esci dall'App
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '30vh', background: 'radial-gradient(ellipse at top left, rgba(16, 185, 129, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ padding: '2.5rem', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Outlet />
        </div>
      </main>

    </div>
  );
}
