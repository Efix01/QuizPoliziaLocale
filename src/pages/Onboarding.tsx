import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePL } from '../context/PLContext';
import { useAuth } from '../context/AuthContext';
import { MapPin, Building2, CheckCircle2 } from 'lucide-react';
import dataRegioni from '../data/regioni_pl.json';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cambiaRegione, cambiaComune } = usePL();
  
  const [step, setStep] = useState<'regione' | 'comune'>('regione');
  // STATO LOCALE ISTANTANEO PER LA UI
  const [selectedRegioneId, setSelectedRegioneId] = useState<string | null>(null); 
  
  const regioni = dataRegioni?.regioni || [];
  
  // Ora calcoliamo i comuni basandoci sulla scelta appena cliccata, non aspettiamo il Context
  const comuniDisponibili = selectedRegioneId 
    ? regioni.find((r: any) => r.id === selectedRegioneId)?.citta || []
    : [];

  const handleRegioneSelect = async (regioneId: string, nomeRegione: string) => {
    setSelectedRegioneId(regioneId); // 1. Aggiorniamo la UI all'istante
    setStep('comune');               // 2. Passiamo allo step 2
    await cambiaRegione(regioneId, nomeRegione); // 3. Salviamo nel database in background
  };

  const handleComuneSelect = async (comuneId: string, nomeComune: string) => {
    await cambiaComune(comuneId, nomeComune);
    navigate('/dashboard'); 
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      
      <div style={{ width: '100%', maxWidth: '800px', background: '#1e293b', borderRadius: '24px', padding: '3rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: '1px solid #334155' }}>
        
        {/* Header Onboarding */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2rem', color: '#f8fafc', marginBottom: '0.5rem' }}>
            Ciao {user?.displayName?.split(' ')[0] || 'Agente'}, prepariamo il tuo profilo
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
            {step === 'regione' ? 'In quale regione si terrà il concorso?' : 'Per quale comune stai concorrendo?'}
          </p>
        </div>

        {/* Progress Bar Visuale */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: step === 'regione' ? '#3b82f6' : '#22c55e' }}>
            {step === 'regione' ? <MapPin size={24} /> : <CheckCircle2 size={24} />}
            <span style={{ fontWeight: '600' }}>1. Regione</span>
          </div>
          <div style={{ height: '2px', width: '50px', background: step === 'comune' ? '#22c55e' : '#334155' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: step === 'comune' ? '#3b82f6' : '#64748b' }}>
            <Building2 size={24} />
            <span style={{ fontWeight: '600' }}>2. Comune</span>
          </div>
        </div>

        {/* Griglie di selezione */}
        {step === 'regione' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {regioni.map((r: any) => (
              <button 
                key={r.id} 
                onClick={() => handleRegioneSelect(r.id, r.nome)}
                style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '1.5rem', color: '#f8fafc', fontSize: '1.1rem', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#334155'}
              >
                {r.nome}
              </button>
            ))}
          </div>
        )}

        {step === 'comune' && (
          <div>
            <button 
              onClick={() => { setStep('regione'); setSelectedRegioneId(null); }} 
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              ← Torna alle Regioni
            </button>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {comuniDisponibili.length > 0 ? (
                comuniDisponibili.map((c: any) => (
                  <button 
                    key={c.id} 
                    onClick={() => handleComuneSelect(c.id, c.nome)}
                    style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '1.5rem', color: '#f8fafc', fontSize: '1.1rem', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = '#334155'}
                  >
                    {c.nome}
                  </button>
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#94a3b8', background: '#0f172a', borderRadius: '16px', border: '1px dashed #334155' }}>
                  <Building2 size={48} color="#475569" style={{ margin: '0 auto 1rem auto' }} />
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc' }}>Nessun Comune Inserito</h3>
                  <p style={{ margin: '0 0 1.5rem 0' }}>Al momento non ci sono database di domande comunali per questa regione.</p>
                  
                  <button onClick={() => navigate('/dashboard')} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Continua solo con il Regionale
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
