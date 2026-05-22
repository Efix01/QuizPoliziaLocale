import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizPL } from '../hooks/useQuizPL';
import { usePL } from '../context/PLContext';
import { useProgress } from '../context/ProgressContext';
import PaywallModal from '../components/dashboard/PaywallModal';
import { ArrowLeft, Zap, FolderTree, Layers, PlayCircle, AlertTriangle, Info, ShieldCheck, BrainCircuit, Lock } from 'lucide-react';

// Nomi leggibili per i categoriaId interni
const CATEGORIA_LABELS: Record<string, string> = {
  cds:              'Codice della Strada (CdS)',
  penale:           'Diritto Penale e Proc. Penale',
  l689:             'Legge 689/81 — Sanzioni Amm.',
  l241:             'Legge 241/90 — Procedimento Amm.',
  tuel:             'TUEL — D.Lgs. 267/2000',
  enti_locali:      'TUEL — Ordinamento Enti Locali',
  costituzionale:   'Diritto Costituzionale',
  amministrativo:   'Diritto Amministrativo Generale',
  reg_generale:     'Normativa Regionale',
  com_generale:     'Regolamento Comunale',
};

// ===================================================
// Card opzione modalità
// ===================================================
const OptionCard = ({ icon: Icon, title, desc, active, onClick, locked }: { icon: React.ElementType, title: string, desc?: string, active: boolean, onClick: () => void, id?: string, locked?: boolean }) => (
  <div
    onClick={onClick}
    style={{
      background: active ? '#1e40af' : '#1e293b',
      border: `2px solid ${active ? '#3b82f6' : (locked ? 'rgba(245, 158, 11, 0.3)' : '#334155')}`,
      borderRadius: '16px',
      padding: '1.5rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      position: 'relative',
      opacity: locked ? 0.85 : 1,
    }}
  >
    <div
      style={{
        background: active ? '#3b82f6' : (locked ? 'rgba(245, 158, 11, 0.1)' : '#0f172a'),
        padding: '0.75rem',
        borderRadius: '12px',
        flexShrink: 0,
      }}
    >
      <Icon color={active ? '#fff' : (locked ? '#f59e0b' : '#94a3b8')} size={24} />
    </div>
    <div style={{ flex: 1 }}>
      <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', color: active ? '#fff' : (locked ? '#fef3c7' : '#cbd5e1'), display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {title}
        {locked && <Lock size={16} color="#f59e0b" style={{ flexShrink: 0 }} />}
      </h4>
      {desc && <h5 style={{ margin: 0, fontSize: '0.9rem', color: active ? '#bfdbfe' : '#64748b', fontWeight: 'normal' }}>{desc}</h5>}
    </div>
  </div>
);

export default function QuizBuilder() {
  const navigate = useNavigate();
  const { generaQuizCategoria, generaQuizStrato, generaQuizVeloce, generaSimulazione, generaQuizIntelligente, composizioneQuiz } = useQuizPL();
  const { domandeCore, domandeRegionali, domandeComunali, tutteLeDomande, profilo } = usePL();
  const { progressiGlobali } = useProgress();
  const isPremium = progressiGlobali?.isPremium || false;

  const [mode, setMode] = useState<'veloce' | 'categoria' | 'strato' | 'simulation_esame' | 'intelligent'>('veloce');
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [selectedStrato, setSelectedStrato] = useState<'core' | 'regionale' | 'comunale'>('core');
  const [numeroDomande, setNumeroDomande] = useState(20);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [antiAnxietyMode, setAntiAnxietyMode] = useState(false);
  const [escludiLogica, setEscludiLogica] = useState(false);

  const qtaDomandeEffettiva = useMemo(() => {
    return mode === 'simulation_esame' ? (profilo?.parametriEsame?.numeroDomande || 100) : numeroDomande;
  }, [mode, numeroDomande, profilo?.parametriEsame]);

  // ===================================================
  // Calcola pool disponibile per mode/categoria/strato
  // ===================================================

  const poolDisponibile = useMemo(() => {
    if (mode === 'veloce' || mode === 'intelligent') return tutteLeDomande.length;
    
    if (mode === 'simulation_esame') {
      return escludiLogica 
        ? tutteLeDomande.filter(d => d.categoriaId !== 'logica').length 
        : tutteLeDomande.length;
    }
    
    if (mode === 'categoria') {
      if (!selectedCategoria) return 0;
      return tutteLeDomande.filter(d => d.categoriaId === selectedCategoria).length;
    }

    if (mode === 'strato') {
      const map = {
        core: domandeCore.length,
        regionale: domandeRegionali.length,
        comunale: domandeComunali.length,
      };
      return map[selectedStrato];
    }

    return 0;
  }, [mode, selectedCategoria, selectedStrato, tutteLeDomande, domandeCore, domandeRegionali, domandeComunali, escludiLogica]);

  // ===================================================
  // Calcola categorie disponibili (per dropdown "Per Materia")
  // ===================================================

  const categorieDisponibili = useMemo(() => {
    const categorie = new Map<string, { nome: string; count: number }>();

    domandeCore.forEach(d => {
      if (!categorie.has(d.categoriaId)) {
        // Usa il nome leggibile, con fallback al campo categoria o all'ID
        const nomeLeggibile = CATEGORIA_LABELS[d.categoriaId]
          || ('categoria' in d ? String(d.categoria) : null)
          || d.categoriaId;
        categorie.set(d.categoriaId, { nome: nomeLeggibile, count: 0 });
      }
      categorie.get(d.categoriaId)!.count++;
    });

    return Array.from(categorie.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count);
  }, [domandeCore]);

  // ===================================================
  // Preview proporzioni layer (se mode = 'veloce')
  // ===================================================

  const previewProporzioni = useMemo(() => {
    if (mode !== 'veloce' && mode !== 'simulation_esame') return null;

    const comp = composizioneQuiz ?? { percentualeCore: 70, percentualeRegionale: 25, percentualeComunale: 5 };
    const n = qtaDomandeEffettiva;

    const nCore = Math.round(n * (comp.percentualeCore / 100));
    const nRegionale = Math.round(n * (comp.percentualeRegionale / 100));
    const nComunale = Math.round(n * (comp.percentualeComunale / 100));

    return { nCore, nRegionale, nComunale };
  }, [mode, qtaDomandeEffettiva, composizioneQuiz]);

  // ===================================================
  // Validazione e avvio
  // ===================================================

  const handleStart = () => {
    // Validazione: numero domande > pool disponibile
    if (qtaDomandeEffettiva > poolDisponibile) {
      alert(`Hai selezionato ${qtaDomandeEffettiva} domande, ma solo ${poolDisponibile} sono disponibili. Riduci il numero o cambia i filtri.`);
      return;
    }

    if (mode === 'strato' && !isPremium) {
      setIsPaywallOpen(true);
      return;
    }

    let domande;
    if (mode === 'veloce') {
      domande = generaQuizVeloce(numeroDomande);
    } else if (mode === 'intelligent') {
      domande = generaQuizIntelligente(numeroDomande);
    } else if (mode === 'simulation_esame') {
      domande = generaSimulazione(escludiLogica);
    } else if (mode === 'categoria') {
      if (!selectedCategoria) {
        alert('Seleziona una materia prima di iniziare.');
        return;
      }
      domande = generaQuizCategoria(selectedCategoria, numeroDomande);
    } else {
      domande = generaQuizStrato(selectedStrato, numeroDomande);
    }

    if (domande.length === 0) {
      alert('Nessuna domanda disponibile per i criteri scelti.');
      return;
    }

    navigate('/study', {
      state: { 
        domande, 
        mode, 
        categoriaId: selectedCategoria, 
        strato: selectedStrato,
        antiAnxietyMode: mode !== 'simulation_esame' && antiAnxietyMode,
        escludiLogica: mode === 'simulation_esame' && escludiLogica
      },
    });
  };

  // ===================================================

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              color: '#fff',
              padding: '0.75rem',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>Crea il tuo Quiz</h1>
            <p style={{ color: '#94a3b8', margin: '0.25rem 0 0 0' }}>
              Scegli gli argomenti su cui vuoi allenarti oggi.
            </p>
          </div>
        </header>

        {/* Step 1: Seleziona Modalità */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#e2e8f0' }}>1. Scegli la tipologia</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <OptionCard
              id="veloce"
              icon={Zap}
              title="Mix Completo"
              desc="Domande casuali da tutte le materie e normative."
              active={mode === 'veloce'}
              onClick={() => setMode('veloce')}
            />
            <OptionCard
              id="intelligent"
              icon={BrainCircuit}
              title="Allenamento Intelligente"
              desc="Ottimizza lo studio dando priorità a errori passati, materie deboli e domande lente."
              active={mode === 'intelligent'}
              onClick={() => setMode('intelligent')}
            />
            <OptionCard
              id="categoria"
              icon={FolderTree}
              title="Per Materia (Nazionale)"
              desc="Focalizzati su Codice della Strada, TUEL, Diritto Penale, ecc."
              active={mode === 'categoria'}
              onClick={() => setMode('categoria')}
            />
            <OptionCard
              id="strato"
              icon={Layers}
              title="Per Normativa Locale"
              desc="Studia solo le leggi Regionali o i regolamenti del tuo Comune."
              active={mode === 'strato'}
              locked={!isPremium}
              onClick={() => {
                if (!isPremium) {
                  setIsPaywallOpen(true);
                } else {
                  setMode('strato');
                  setSelectedStrato(domandeRegionali.length > 0 ? 'regionale' : 'comunale');
                }
              }}
            />
            <OptionCard
              id="simulation_esame"
              icon={ShieldCheck}
              title="Simulazione d'Esame"
              desc="Simula un esame reale con proporzioni e penalità ufficiali."
              active={mode === 'simulation_esame'}
              onClick={() => setMode('simulation_esame')}
            />
          </div>
        </div>

        {/* Step 2: Opzioni Specifiche */}
        <div
          style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '24px',
            padding: '2rem',
            marginBottom: '2rem',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#e2e8f0' }}>2. Dettagli Sessione</h2>

          {/* Mode: Categoria */}
          {mode === 'categoria' && (
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.75rem', color: '#94a3b8' }}>
                Seleziona la materia da studiare:
              </label>
              <select
                value={selectedCategoria}
                onChange={(e) => setSelectedCategoria(e.target.value)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  color: '#fff',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                }}
              >
                <option value="">-- Seleziona una materia --</option>
                {categorieDisponibili.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome} ({cat.count} domande)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Mode: Strato */}
          {mode === 'strato' && (
            <div
              style={{
                marginBottom: '2rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
              }}
            >
              <button
                disabled={domandeRegionali.length === 0}
                onClick={() => setSelectedStrato('regionale')}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  background: selectedStrato === 'regionale' ? '#3b82f6' : '#0f172a',
                  color: '#fff',
                  border: `1px solid ${selectedStrato === 'regionale' ? '#3b82f6' : '#334155'}`,
                  cursor: domandeRegionali.length > 0 ? 'pointer' : 'not-allowed',
                  opacity: domandeRegionali.length > 0 ? 1 : 0.5,
                  fontWeight: 'bold',
                }}
              >
                Regionale
                <br />
                <span style={{ fontWeight: 'normal', fontSize: '0.9rem', opacity: 0.8 }}>
                  ({domandeRegionali.length} dom.)
                </span>
              </button>
              <button
                disabled={domandeComunali.length === 0}
                onClick={() => setSelectedStrato('comunale')}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  background: selectedStrato === 'comunale' ? '#3b82f6' : '#0f172a',
                  color: '#fff',
                  border: `1px solid ${selectedStrato === 'comunale' ? '#3b82f6' : '#334155'}`,
                  cursor: domandeComunali.length > 0 ? 'pointer' : 'not-allowed',
                  opacity: domandeComunali.length > 0 ? 1 : 0.5,
                  fontWeight: 'bold',
                }}
              >
                Comunale
                <br />
                <span style={{ fontWeight: 'normal', fontSize: '0.9rem', opacity: 0.8 }}>
                  ({domandeComunali.length} dom.)
                </span>
              </button>
            </div>
          )}

          {/* Slider Quantità Domande (Nascosto in simulazione d'esame perché fisso) */}
          {mode !== 'simulation_esame' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <label style={{ color: '#94a3b8' }}>Quante domande vuoi affrontare?</label>
                <span
                  style={{
                    background: '#3b82f6',
                    color: '#fff',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '99px',
                    fontWeight: 'bold',
                  }}
                >
                  {numeroDomande}
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={numeroDomande}
                onChange={(e) => setNumeroDomande(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#3b82f6' }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: '#64748b',
                  fontSize: '0.85rem',
                  marginTop: '0.5rem',
                }}
              >
                <span>Breve (5)</span>
                <span>Intenso (50)</span>
              </div>
            </div>
          )}

          {/* Modalità Anti-Ansia (Studio Calmo) Toggle */}
          {mode !== 'simulation_esame' && (
            <div
              onClick={() => setAntiAnxietyMode(!antiAnxietyMode)}
              style={{
                marginTop: '1.5rem',
                padding: '1.25rem',
                background: antiAnxietyMode ? 'rgba(59, 130, 246, 0.1)' : '#0f172a',
                border: `1.5px solid ${antiAnxietyMode ? '#3b82f6' : '#334155'}`,
                borderRadius: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.05rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🧘 Modalità Anti-Ansia (Studio Calmo)
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.4' }}>
                  Nessun timer, feedback positivi incoraggianti, risultati protetti e privati che non influiscono sulle statistiche pubbliche.
                </p>
              </div>
              <div
                style={{
                  width: '50px',
                  height: '28px',
                  background: antiAnxietyMode ? '#3b82f6' : '#475569',
                  borderRadius: '99px',
                  position: 'relative',
                  transition: 'background-color 0.2s',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    background: '#fff',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '4px',
                    left: antiAnxietyMode ? '26px' : '4px',
                    transition: 'left 0.2s',
                  }}
                />
              </div>
            </div>
          )}

          {/* Esclusione Quiz Logica Toggle (visibile solo per simulazione) */}
          {mode === 'simulation_esame' && (
            <div
              onClick={() => setEscludiLogica(!escludiLogica)}
              style={{
                marginTop: '1.5rem',
                padding: '1.25rem',
                background: escludiLogica ? 'rgba(59, 130, 246, 0.1)' : '#0f172a',
                border: `1.5px solid ${escludiLogica ? '#3b82f6' : '#334155'}`,
                borderRadius: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.05rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  ⚖️ Escludi quiz di logica e matematici
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.4' }}>
                  Affronta la simulazione concentrandoti solo sulle materie giuridico-amministrative e quiz testuali.
                </p>
              </div>
              <div
                style={{
                  width: '50px',
                  height: '28px',
                  background: escludiLogica ? '#3b82f6' : '#475569',
                  borderRadius: '99px',
                  position: 'relative',
                  transition: 'background-color 0.2s',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    background: '#fff',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '4px',
                    left: escludiLogica ? '26px' : '4px',
                    transition: 'left 0.2s',
                  }}
                />
              </div>
            </div>
          )}

          {/* ✅ Indicatore domande disponibili */}
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: (mode === 'categoria' && !selectedCategoria) ? '#1e293b' : (qtaDomandeEffettiva > poolDisponibile ? '#7f1d1d' : '#065f46'),
              border: `1px solid ${(mode === 'categoria' && !selectedCategoria) ? '#3b82f6' : (qtaDomandeEffettiva > poolDisponibile ? '#991b1b' : '#047857')}`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            {(mode === 'categoria' && !selectedCategoria) ? (
              <Info size={20} color="#3b82f6" />
            ) : qtaDomandeEffettiva > poolDisponibile ? (
              <AlertTriangle size={20} color="#ef4444" />
            ) : (
              <Info size={20} color="#22c55e" />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                {(mode === 'categoria' && !selectedCategoria) ? 'In attesa di selezione' : (qtaDomandeEffettiva > poolDisponibile ? '⚠️ Attenzione' : '✅ Pronto')}
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                {(mode === 'categoria' && !selectedCategoria)
                  ? 'Seleziona una materia dal menu a tendina qui sopra per vedere le domande disponibili.'
                  : qtaDomandeEffettiva > poolDisponibile
                  ? `Hai selezionato ${qtaDomandeEffettiva} domande, ma solo ${poolDisponibile} sono disponibili. Riduci il numero.`
                  : `${poolDisponibile} domande disponibili per i criteri scelti.`}
              </div>
            </div>
          </div>

          {/* ✅ Preview proporzioni layer (se mode = 'veloce' o 'simulation_esame') */}
          {(mode === 'veloce' || mode === 'simulation_esame') && previewProporzioni && (
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '12px',
              }}
            >
              <div style={{ fontWeight: '600', marginBottom: '0.75rem', color: '#cbd5e1' }}>
                📊 Proporzioni {mode === 'simulation_esame' ? 'Esame' : 'previste'}:
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.9rem', color: '#94a3b8' }}>
                <span>
                  Core: <strong style={{ color: '#fff' }}>{previewProporzioni.nCore}</strong>
                </span>
                <span>•</span>
                <span>
                  Regionale: <strong style={{ color: '#fff' }}>{previewProporzioni.nRegionale}</strong>
                </span>
                <span>•</span>
                <span>
                  Comunale: <strong style={{ color: '#fff' }}>{previewProporzioni.nComunale}</strong>
                </span>
              </div>
              {mode === 'simulation_esame' && (
                 <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#60a5fa', fontStyle: 'italic' }}>
                    * In simulazione il numero di domande è fisso secondo i parametri d'esame.
                 </div>
              )}
            </div>
          )}
        </div>

        {/* CTA Avvio */}
        <button
          onClick={handleStart}
          disabled={qtaDomandeEffettiva > poolDisponibile || (mode === 'categoria' && !selectedCategoria)}
          style={{
            width: '100%',
            background: (mode === 'categoria' && !selectedCategoria) ? '#334155' : qtaDomandeEffettiva > poolDisponibile ? '#64748b' : '#22c55e',
            color: 'white',
            border: 'none',
            padding: '1.25rem',
            borderRadius: '16px',
            fontSize: '1.25rem',
            fontWeight: '800',
            cursor: (qtaDomandeEffettiva > poolDisponibile || (mode === 'categoria' && !selectedCategoria)) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            boxShadow: (qtaDomandeEffettiva > poolDisponibile || (mode === 'categoria' && !selectedCategoria))
              ? 'none'
              : '0 10px 15px -3px rgba(34, 197, 94, 0.3)',
            transition: 'transform 0.2s',
            opacity: (qtaDomandeEffettiva > poolDisponibile || (mode === 'categoria' && !selectedCategoria)) ? 0.6 : 1,
          }}
          onMouseOver={(e) => {
            if (!(qtaDomandeEffettiva > poolDisponibile || (mode === 'categoria' && !selectedCategoria))) e.currentTarget.style.transform = 'translateY(-3px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <PlayCircle size={28} />
          INIZIA IL QUIZ
        </button>
      </div>

      <PaywallModal isOpen={isPaywallOpen} onClose={() => setIsPaywallOpen(false)} reason="locale" />
    </div>
  );
}
