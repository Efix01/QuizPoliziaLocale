import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePL } from '../context/PLContext';
import { useProgress } from '../context/ProgressContext';
import { MapPin, BrainCircuit, Target, Timer, Flame, AlertCircle, TrendingUp, BookOpen, Star, Brain } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profilo, domandeCore, domandeRegionali, domandeComunali } = usePL();
  const { progressiGlobali, erroriLog, srsData } = useProgress();

  const srsCount = useMemo(() => {
    if (!srsData) return 0;
    const now = new Date();
    return Object.values(srsData).filter(item => item && new Date(item.nextReview) <= now).length;
  }, [srsData]);

  // --- Mappa categorie → layer da domande caricate ---
  const categoriaDomandeMap = useMemo(() => {
    const map = new Map<string, 'core' | 'regionale' | 'comunale'>();
    
    // Aggreghiamo tutte le domande disponibili per mappare le categorie ai rispettivi strati
    [...domandeCore, ...domandeRegionali, ...domandeComunali].forEach(d => {
      if (d.categoriaId && !map.has(d.categoriaId)) {
        map.set(d.categoriaId, d.strato);
      }
    });
    
    return map;
  }, [domandeCore, domandeRegionali, domandeComunali]);

  // --- Calcolo Statistiche per Layer (memoizzato) ---
  const statsByLayer = useMemo(() => {
    const getLayerFromCategoria = (catId: string): 'core' | 'regionale' | 'comunale' => {
      // 1. Prova con prefissi (veloce per nuovi dati)
      if (catId.startsWith('reg_')) return 'regionale';
      if (catId.startsWith('com_')) return 'comunale';
      
      // 2. Cerca nella mappa costruita dalle domande caricate (robusto per legacy)
      const layer = categoriaDomandeMap.get(catId);
      if (layer) return layer;
      
      // 3. Fallback core
      return 'core';
    };

    return Object.entries(progressiGlobali?.perCategoria || {}).reduce(
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
  }, [progressiGlobali?.perCategoria, categoriaDomandeMap]);

  if (!progressiGlobali) return null;

  const { mediaPercentuale, streak } = progressiGlobali;
  const erroriCount = Object.keys(erroriLog || {}).length;

  const pctCore = statsByLayer.core.fatte > 0 
    ? Math.round((statsByLayer.core.corrette / statsByLayer.core.fatte) * 100) 
    : 0;
  
  const pctRegionale = statsByLayer.regionale.fatte > 0 
    ? Math.round((statsByLayer.regionale.corrette / statsByLayer.regionale.fatte) * 100) 
    : 0;
  
  const pctComunale = statsByLayer.comunale.fatte > 0 
    ? Math.round((statsByLayer.comunale.corrette / statsByLayer.comunale.fatte) * 100) 
    : 0;

  // --- Indice ponderato normalizzato sui layer disponibili ---
  const hasRegionali = (domandeRegionali?.length || 0) > 0;
  const hasComunali = (domandeComunali?.length || 0) > 0;

  let indiceProntezza: number;

  if (!hasRegionali && !hasComunali) {
    // Solo core → 100% del peso
    indiceProntezza = pctCore;
  } else if (hasRegionali && !hasComunali) {
    // Core + Regionale → 75/25
    indiceProntezza = Math.round((pctCore * 0.75) + (pctRegionale * 0.25));
  } else {
    // Tutti e tre i layer → 70/25/5
    indiceProntezza = Math.round((pctCore * 0.70) + (pctRegionale * 0.25) + (pctComunale * 0.05));
  }

  const getColor = (pct: number) => pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';

  const totDomandeFatte = statsByLayer.core.fatte + statsByLayer.regionale.fatte + statsByLayer.comunale.fatte;

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
        <section style={{ background: '#1e293b', borderRadius: '24px', padding: '2rem', border: '1px solid #334155', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', alignItems: 'center' }}>
            
            {/* Prontezza Globale */}
            <div style={{ textAlign: 'center', flex: '1', minWidth: '200px' }}>
              <h3 style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '0.5rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Prontezza Stimata
                {!hasRegionali && !hasComunali && <span style={{ fontSize: '0.75rem', display: 'block', marginTop: '0.25rem' }}>(solo Core)</span>}
              </h3>
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
              {hasRegionali && (
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
              {hasComunali && (
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
              <span>Domande: <strong>{totDomandeFatte}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="#22c55e" />
              <span>Media: <strong>{mediaPercentuale}%</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Flame size={20} color={streak > 0 ? "#f59e0b" : "#64748b"} />
              <span style={{ color: streak > 0 ? '#f59e0b' : '#64748b', fontWeight: 'bold' }}>
                {streak > 0 ? `${streak} Giorni` : 'Inizia oggi!'}
              </span>
            </div>
          </div>
        </section>

        {/* Prossimi Obiettivi */}
        {indiceProntezza < 75 && (
          <section style={{ background: '#1e293b', borderRadius: '20px', padding: '1.5rem', border: '1px solid #334155' }}>
            <h4 style={{ margin: 0, marginBottom: '1rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target size={20} />
              Per aumentare la tua prontezza:
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#94a3b8', lineHeight: 2 }}>
              {pctCore < 75 && <li>Completa almeno il <strong>75%</strong> del Core Nazionale (ora al {pctCore}%)</li>}
              {hasRegionali && pctRegionale < 75 && <li>Migliora il layer Regionale (ora al {pctRegionale}%)</li>}
              {hasComunali && pctComunale < 75 && <li>Migliora il layer Comunale (ora al {pctComunale}%)</li>}
              {erroriCount > 5 && <li>Rivedi i tuoi <strong>{erroriCount} errori</strong> prima di fare nuovi quiz</li>}
            </ul>
          </section>
        )}

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

            {/* Ripasso Intelligente SRS */}
            <div 
              onClick={() => srsCount > 0 ? navigate('/srs') : null}
              style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '2rem', cursor: srsCount > 0 ? 'pointer' : 'default', opacity: srsCount > 0 ? 1 : 0.6, transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', overflow: 'hidden' }}
              onMouseOver={(e) => srsCount > 0 && (e.currentTarget.style.transform = 'translateY(-5px)')}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {srsCount > 0 && (
                <div style={{ position: 'absolute', top: 0, right: 0, background: '#10b981', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '4px 12px', borderBottomLeftRadius: '10px' }}>
                  CONSIGLIATO OGGI
                </div>
              )}
              <div style={{ background: '#0f172a', width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: srsCount > 0 ? '0.5rem' : 0 }}>
                <Brain size={32} color={srsCount > 0 ? "#10b981" : "#64748b"} />
              </div>
              <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Addestramento Sniper</h3>
              <p style={{ color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                {srsCount > 0 
                  ? `Hai ${srsCount} domande in scadenza mnemonica. Alleniamole ora prima che svaniscano!` 
                  : `Tutte le tue conoscenze sono salde. Nessun decadimento mnemonico rilevato oggi.`}
              </p>
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

            {/* Domande Salvate */}
            <div 
              onClick={() => (progressiGlobali?.domandeSalvate?.length || 0) > 0 ? navigate('/bookmarks') : null}
              style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '2rem', cursor: (progressiGlobali?.domandeSalvate?.length || 0) > 0 ? 'pointer' : 'default', opacity: (progressiGlobali?.domandeSalvate?.length || 0) > 0 ? 1 : 0.6, transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', gap: '1rem' }}
              onMouseOver={(e) => (progressiGlobali?.domandeSalvate?.length || 0) > 0 && (e.currentTarget.style.transform = 'translateY(-5px)')}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ background: '#0f172a', width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Star size={32} color={(progressiGlobali?.domandeSalvate?.length || 0) > 0 ? "#f59e0b" : "#64748b"} />
              </div>
              <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Domande Salvate</h3>
              <p style={{ color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                {(progressiGlobali?.domandeSalvate?.length || 0) > 0 
                  ? `Hai ${progressiGlobali?.domandeSalvate?.length} domande nei segnalibri pronti da ripassare.` 
                  : `Nessuna domanda salvata. Clicca la stella durante i quiz.`}
              </p>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
