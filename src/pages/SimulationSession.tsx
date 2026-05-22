import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizPL } from '../hooks/useQuizPL';
import type { DomandaPL } from '../types/pl';
import { AlertTriangle, Clock, Target, PlayCircle, ArrowLeft } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import PaywallModal from '../components/dashboard/PaywallModal';

export default function SimulationSession() {
  const navigate = useNavigate();
  const { generaSimulazione, parametriEsame } = useQuizPL();
  const { progressiGlobali } = useProgress();
  
  const isPremium = progressiGlobali?.isPremium || false;
  const countSimulazioni = Number(localStorage.getItem('simulazioni_completate') || '0');
  const isLimitReached = !isPremium && countSimulazioni >= 3;

  const [isPaywallOpen, setIsPaywallOpen] = useState(isLimitReached);
  const [domandeDisponibili, setDomandeDisponibili] = useState<DomandaPL[]>([]);
  const [escludiLogica, setEscludiLogica] = useState(false);

  useEffect(() => {
    if (isLimitReached) {
      setIsPaywallOpen(true);
    }
  }, [isLimitReached]);

  const handleClosePaywall = () => {
    setIsPaywallOpen(false);
    navigate('/dashboard');
  };

  // Carica le domande subito per vedere se ce ne sono abbastanza
  useEffect(() => {
    let mounted = true;
    const load = async () => {
        const domande = await generaSimulazione(escludiLogica);
        if (mounted) setDomandeDisponibili(domande);
    };
    load();
    return () => { mounted = false; };
  }, [generaSimulazione, escludiLogica]);

  const handleAvvia = () => {
    if (domandeDisponibili.length === 0) return alert("Nessuna domanda disponibile.");
    // Navighiamo verso lo study mode passando la modalità simulazione
    navigate('/study', { 
      state: { 
        domande: domandeDisponibili, 
        mode: 'simulation_esame',
        escludiLogica
      } 
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      
      <div style={{ maxWidth: '600px', width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '24px', padding: '3rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
        
        <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          <ArrowLeft size={20} /> Torna indietro
        </button>

        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '1rem', color: '#fff' }}>Simulazione Esame Ufficiale</h1>
        <p style={{ color: '#cbd5e1', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '3rem' }}>
          Questa modalità ricrea le condizioni esatte del tuo concorso. Le domande sono proporzionate in base alla normativa (70% Nazionale, 25% Regionale, 5% Comunale).
        </p>

        {/* Tipologia Domande */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ color: '#e2e8f0', fontSize: '1rem', fontWeight: '700', marginBottom: '1rem' }}>
            Tipologia domande della simulazione:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div
              onClick={() => setEscludiLogica(false)}
              style={{
                padding: '1.25rem',
                background: !escludiLogica ? 'rgba(59, 130, 246, 0.1)' : '#0f172a',
                border: `2px solid ${!escludiLogica ? '#3b82f6' : '#334155'}`,
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
              }}
            >
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>Completa 📊</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.4' }}>
                Include quiz testuali e quesiti di logica/matematica.
              </div>
            </div>
            
            <div
              onClick={() => setEscludiLogica(true)}
              style={{
                padding: '1.25rem',
                background: escludiLogica ? 'rgba(59, 130, 246, 0.1)' : '#0f172a',
                border: `2px solid ${escludiLogica ? '#3b82f6' : '#334155'}`,
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
              }}
            >
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>Solo Testo ⚖️</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.4' }}>
                Esclude i quiz di logica e ragionamento matematico.
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#0f172a', padding: '1.5rem', borderRadius: '16px' }}>
            <Target color="#3b82f6" size={32} />
            <div>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Numero Domande</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{domandeDisponibili.length} (su {parametriEsame?.numeroDomande || 100} previste)</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#0f172a', padding: '1.5rem', borderRadius: '16px' }}>
            <Clock color="#f59e0b" size={32} />
            <div>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Tempo a disposizione</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{parametriEsame?.durataMinuti || 90} Minuti</div>
            </div>
          </div>
        </div>

        <div style={{ background: '#450a0a', border: '1px solid #991b1b', padding: '1.5rem', borderRadius: '16px', display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
          <AlertTriangle color="#ef4444" size={24} style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, color: '#fca5a5', fontSize: '0.95rem', lineHeight: '1.5' }}>
            Attenzione: le risposte errate applicano una penalità di <strong>{parametriEsame?.punteggioErrata || -0.25} punti</strong>. Se non sei sicuro, è meglio non rispondere (zero punti).
          </p>
        </div>

        <button 
          onClick={handleAvvia}
          style={{ width: '100%', background: '#3b82f6', color: 'white', border: 'none', padding: '1.25rem', borderRadius: '16px', fontSize: '1.25rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}
        >
          <PlayCircle size={28} />
          AVVIA LA PROVA
        </button>

      </div>
      
      <PaywallModal isOpen={isPaywallOpen} onClose={handleClosePaywall} reason="simulation" />
    </div>
  );
}
