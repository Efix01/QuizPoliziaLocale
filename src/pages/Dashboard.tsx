import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePL } from '../context/PLContext';
import { useProgress } from '../context/ProgressContext';
import { MapPin, BrainCircuit, Target, Timer, Flame, AlertCircle, TrendingUp, BookOpen } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profilo, domandeRegionali, domandeComunali } = usePL();
  const { progressiGlobali, erroriLog } = useProgress();

  if (!progressiGlobali) return null;

  const { quizCompletati, mediaPercentuale, streak, perCategoria } = progressiGlobali;
  const erroriCount = Object.keys(erroriLog || {}).length;

  // --- Calcolo Statistiche per Layer ---
  const getLayerFromCategoria = (catId: string): 'core' | 'regionale' | 'comunale' => {
    if (catId.startsWith('reg_')) return 'regionale';
    if (catId.startsWith('com_')) return 'comunale';
    return 'core';
  };

  const statsByLayer = Object.entries(perCategoria || {}).reduce(
    (acc, [catId, stats]) => {
      const layer = getLayerFromCategoria(catId);
      acc[layer].fatte += stats.fatte;
      acc[layer].corrette += stats.corrette;
      return acc;
    },
    {
      core: { fatte: 0, corrette: 0 },
      regionale: { fatte: 0, corrette: 0 },
      comunale: { fatte: 0, corrette: 0 },
    }
  );

  const pctCore = statsByLayer.core.fatte > 0 ? Math.round((statsByLayer.core.corrette / statsByLayer.core.fatte) * 100) : 0;
  const pctRegionale = statsByLayer.regionale.fatte > 0 ? Math.round((statsByLayer.regionale.corrette / statsByLayer.regionale.fatte) * 100) : 0;
  const pctComunale = statsByLayer.comunale.fatte > 0 ? Math.round((statsByLayer.comunale.corrette / statsByLayer.comunale.fatte) * 100) : 0;

  // Indice ponderato (70% core, 25% reg, 5% com)
  const indiceProntezza = Math.round((pctCore * 0.70) + (pctRegionale * 0.25) + (pctComunale * 0.05));

  const getColor = (pct: number) => pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>Bentornato, {user?.displayName?.split(' ')[0] || 'Agente'}!</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', marginTop: '0.5rem', fontSize: '1.1rem' }}>
              <MapPin size={18} color="#3b82f6" />
              <span>{profilo?.nomeRegione}</span>
              {profilo?.nomeComune && <span> • {profilo.nomeComune}</span>}
            </div>
          </div>
          <button 
            onClick={() => navigate('/onboarding')} 
            style={{ background: 'transparent', border: '1px solid #334155', color: '#cbd5e1', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
          >
            Cambia Concorso
          </button>
        </header>

        {/* Card Statistiche Principali */}
        <section style={{ background: '#1e293b', borderRadius: '24px', padding: '2rem', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', alignItems: 'center' }}>
            
            {/* Prontezza Globale */}
            <div style={{ textAlign: 'center', flex: '1', minWidth: '200px' }}>
              <h3 style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '0.5rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Prontezza Stimata</h3>
              <div style={{ fontSize: '4rem', fontWeight: '900', color: getColor(indiceProntezza), lineHeight: 1 }}>{indiceProntezza}%</div>
            </div>

            {/* Barre per Layer */}
            <div style={{ flex: '2', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Core Nazionale */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                  <span style={{ fontWeight: '600' }}>Core Nazionale</span>
                  <span style={{ color: '#94a3b8' }}>{statsByLayer.core.corrette}/{statsByLayer.core.fatte} ({pctCore}%)</span>
                </div>
                <div style={{ height: '10px', background: '#0f172a', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ width: `${pctCore}%`, height: '100%', background: getColor(pctCore), transition: 'width 0.5s ease' }} />
                </div>
              </div>

              {/* Regionale */}
              {(domandeRegionali?.length || 0) > 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                    <span style={{ fontWeight: '600' }}>Regionale</span>
                    <span style={{ color: '#94a3b8' }}>{statsByLayer.regionale.corrette}/{statsByLayer.regionale.fatte} ({pctRegionale}%)</span>
                  </div>
                  <div style={{ height: '10px', background: '#0f172a', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${pctRegionale}%`, height: '100%', background: getColor(pctRegionale), transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              )}

              {/* Comunale */}
              {(domandeComunali?.length || 0) > 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                    <span style={{ fontWeight: '600' }}>Comunale</span>
                    <span style={{ color: '#94a3b8' }}>{statsByLayer.comunale.corrette}/{statsByLayer.comunale.fatte} ({pctComunale}%)</span>
                  </div>
                  <div style={{ height: '10px', background: '#0f172a', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${pctComunale}%`, height: '100%', background: getColor(pctComunale), transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats Row */}
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} color="#3b82f6" />
              <span>Quiz: <strong>{quizCompletati}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="#22c55e" />
              <span>Media: <strong>{mediaPercentuale}%</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Flame size={20} color="#f59e0b" />
              <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{streak} Giorni</span>
            </div>
          </div>
        </section>

        {/* Modalità di Studio */}
        <section>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Cosa vuoi fare oggi?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            
            {/* Quiz Builder */}
            <div 
              onClick={() => navigate('/quiz-builder')}
              style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '2rem', cursor: 'pointer', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', gap: '1rem' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ background: '#0f172a', width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BrainCircuit size={32} color="#3b82f6" />
              </div>
              <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Quiz Personalizzato</h3>
              <p style={{ color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>Crea una sessione su misura: scegli la materia, il layer o fai un mix veloce.</p>
            </div>

            {/* Simulazione Esame */}
            <div 
              onClick={() => navigate('/simulation')}
              style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '2rem', cursor: 'pointer', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', gap: '1rem' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ background: '#0f172a', width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Timer size={32} color="#f59e0b" />
              </div>
              <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Simulazione Esame</h3>
              <p style={{ color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>Ricrea le condizioni reali del bando: {profilo?.parametriEsame?.numeroDomande || 100} domande, timer e punteggio penalizzato.</p>
            </div>

            {/* Ripasso Errori */}
            <div 
              onClick={() => erroriCount > 0 ? navigate('/mistakes') : null}
              style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '2rem', cursor: erroriCount > 0 ? 'pointer' : 'default', opacity: erroriCount > 0 ? 1 : 0.6, transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', gap: '1rem' }}
              onMouseOver={(e) => erroriCount > 0 && (e.currentTarget.style.transform = 'translateY(-5px)')}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ background: '#0f172a', width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertCircle size={32} color={erroriCount > 0 ? "#ef4444" : "#64748b"} />
              </div>
              <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Ripasso Errori</h3>
              <p style={{ color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                {erroriCount > 0 
                  ? `Hai ${erroriCount} domande da rivedere. Fissale nella memoria prima dell'esame.` 
                  : `Nessun errore da ripassare. Ottimo lavoro, continua così!`}
              </p>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
