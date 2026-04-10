import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Target, BarChart3 } from 'lucide-react';
import Footer from '../components/Footer';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navbar */}
      <nav style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
          <ShieldCheck color="#3b82f6" size={28} />
          <span>Quiz Polizia Locale</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => navigate('/login')} style={{ background: 'transparent', color: '#cbd5e1', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: '600' }}>Accedi</button>
          <button onClick={() => navigate('/register')} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Registrati</button>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: 1.1, marginBottom: '1.5rem', maxWidth: '800px' }}>
          Preparati ai concorsi di Polizia Locale, <span style={{ color: '#3b82f6' }}>adattati al tuo Comune.</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '600px', marginBottom: '3rem', lineHeight: 1.6 }}>
          L'unica piattaforma che combina il core nazionale con le leggi della tua regione e i regolamenti del tuo comune. Non studiare a caso, studia quello che serve.
        </p>
        
        <button onClick={() => navigate('/register')} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '1rem 2.5rem', borderRadius: '12px', fontSize: '1.25rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}>
          Inizia Gratis Adesso
        </button>

        {/* Features */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginTop: '5rem', width: '100%', maxWidth: '1000px' }}>
          <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '16px', border: '1px solid #334155' }}>
            <Target color="#3b82f6" size={40} style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Studio Mirato</h3>
            <p style={{ color: '#94a3b8' }}>Scegli la regione e il comune del bando. Noi assembliamo i quiz perfetti per te.</p>
          </div>
          <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '16px', border: '1px solid #334155' }}>
            <BarChart3 color="#22c55e" size={40} style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Statistiche Intelligenti</h3>
            <p style={{ color: '#94a3b8' }}>Scopri subito se sei più debole sul TUEL, sul Codice della Strada o sulle leggi regionali.</p>
          </div>
          <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '16px', border: '1px solid #334155' }}>
            <ShieldCheck color="#f59e0b" size={40} style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Simulazioni d'Esame</h3>
            <p style={{ color: '#94a3b8' }}>Mettiti alla prova con timer e sistema di punteggio ufficiale dei concorsi.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
