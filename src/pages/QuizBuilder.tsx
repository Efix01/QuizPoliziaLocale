import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizPL } from '../hooks/useQuizPL';
import { usePL } from '../context/PLContext';
import { ArrowLeft, Zap, FolderTree, Layers, PlayCircle } from 'lucide-react';

export default function QuizBuilder() {
  const navigate = useNavigate();
  const { generaQuizCategoria, generaQuizStrato, generaQuizVeloce } = useQuizPL();
  const { domandeCore, domandeRegionali, domandeComunali, profilo } = usePL();

  const [mode, setMode] = useState<'veloce' | 'categoria' | 'strato'>('veloce');
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [selectedStrato, setSelectedStrato] = useState<'core' | 'regionale' | 'comunale'>('core');
  const [numeroDomande, setNumeroDomande] = useState(20);

  const handleStart = () => {
    let domande;
    if (mode === 'veloce') {
      domande = generaQuizVeloce(numeroDomande);
    } else if (mode === 'categoria') {
      if (!selectedCategoria) return alert("Seleziona una materia");
      domande = generaQuizCategoria(selectedCategoria, numeroDomande);
    } else {
      domande = generaQuizStrato(selectedStrato, numeroDomande);
    }

    if (domande.length === 0) return alert("Nessuna domanda disponibile per i criteri scelti.");
    
    navigate('/study', { state: { domande, mode, categoriaId: selectedCategoria, strato: selectedStrato } });
  };

  const OptionCard = ({ id, icon: Icon, title, desc, active, onClick }: any) => (
    <div 
      onClick={onClick}
      style={{
        background: active ? '#1e40af' : '#1e293b',
        border: `2px solid ${active ? '#3b82f6' : '#334155'}`,
        borderRadius: '16px', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.2s',
        display: 'flex', alignItems: 'center', gap: '1rem'
      }}
    >
      <div style={{ background: active ? '#3b82f6' : '#0f172a', padding: '0.75rem', borderRadius: '12px' }}>
        <Icon color={active ? '#fff' : '#94a3b8'} size={24} />
      </div>
      <div>
        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', color: active ? '#fff' : '#cbd5e1' }}>{title}</h4>
        <p style={{ margin: 0, fontSize: '0.9rem', color: active ? '#bfdbfe' : '#64748b' }}>{desc}</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '0.75rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>Crea il tuo Quiz</h1>
            <p style={{ color: '#94a3b8', margin: '0.25rem 0 0 0' }}>Scegli gli argomenti su cui vuoi allenarti oggi.</p>
          </div>
        </header>

        {/* Step 1: Seleziona Modalità */}
        <div style={{ background: '#0f172a', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#e2e8f0' }}>1. Scegli la tipologia</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <OptionCard id="veloce" icon={Zap} title="Mix Completo" desc="Domande casuali da tutte le materie e normative." active={mode === 'veloce'} onClick={() => setMode('veloce')} />
            <OptionCard id="categoria" icon={FolderTree} title="Per Materia (Nazionale)" desc="Focalizzati su Codice della Strada, TUEL, Diritto Penale, ecc." active={mode === 'categoria'} onClick={() => setMode('categoria')} />
            <OptionCard id="strato" icon={Layers} title="Per Normativa Locale" desc="Studia solo le leggi Regionali o i regolamenti del tuo Comune." active={mode === 'strato'} onClick={() => setMode('strato')} />
          </div>
        </div>

        {/* Step 2: Opzioni Specifiche */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '24px', padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#e2e8f0' }}>2. Dettagli Sessione</h2>

          {mode === 'categoria' && (
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.75rem', color: '#94a3b8' }}>Seleziona la materia da studiare:</label>
              <select 
                value={selectedCategoria} 
                onChange={(e) => setSelectedCategoria(e.target.value)}
                style={{ width: '100%', padding: '1rem', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '12px', fontSize: '1.1rem', cursor: 'pointer' }}
              >
                <option value="">-- Seleziona una materia --</option>
                <option value="cds">Codice della Strada</option>
                <option value="tuel">Testo Unico Enti Locali (TUEL)</option>
                <option value="l241">Legge 241/90 (Procedimento Amm.)</option>
                <option value="l689">Legge 689/81 (Sanzioni Amm.)</option>
                <option value="penale">Diritto e Procedura Penale</option>
              </select>
            </div>
          )}

          {mode === 'strato' && (
            <div style={{ marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <button onClick={() => setSelectedStrato('core')} style={{ padding: '1rem', borderRadius: '12px', background: selectedStrato === 'core' ? '#3b82f6' : '#0f172a', color: '#fff', border: `1px solid ${selectedStrato === 'core' ? '#3b82f6' : '#334155'}`, cursor: 'pointer', fontWeight: 'bold' }}>
                Core Nazionale<br/><span style={{ fontWeight: 'normal', fontSize: '0.9rem', opacity: 0.8 }}>({domandeCore.length} dom.)</span>
              </button>
              <button disabled={domandeRegionali.length === 0} onClick={() => setSelectedStrato('regionale')} style={{ padding: '1rem', borderRadius: '12px', background: selectedStrato === 'regionale' ? '#3b82f6' : '#0f172a', color: '#fff', border: `1px solid ${selectedStrato === 'regionale' ? '#3b82f6' : '#334155'}`, cursor: domandeRegionali.length > 0 ? 'pointer' : 'not-allowed', opacity: domandeRegionali.length > 0 ? 1 : 0.5, fontWeight: 'bold' }}>
                Regionale ({profilo?.nomeRegione})<br/><span style={{ fontWeight: 'normal', fontSize: '0.9rem', opacity: 0.8 }}>({domandeRegionali.length} dom.)</span>
              </button>
              <button disabled={domandeComunali.length === 0} onClick={() => setSelectedStrato('comunale')} style={{ padding: '1rem', borderRadius: '12px', background: selectedStrato === 'comunale' ? '#3b82f6' : '#0f172a', color: '#fff', border: `1px solid ${selectedStrato === 'comunale' ? '#3b82f6' : '#334155'}`, cursor: domandeComunali.length > 0 ? 'pointer' : 'not-allowed', opacity: domandeComunali.length > 0 ? 1 : 0.5, fontWeight: 'bold' }}>
                Comunale ({profilo?.nomeComune})<br/><span style={{ fontWeight: 'normal', fontSize: '0.9rem', opacity: 0.8 }}>({domandeComunali.length} dom.)</span>
              </button>
            </div>
          )}

          {/* Slider Quantità Domande */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <label style={{ color: '#94a3b8' }}>Quante domande vuoi affrontare?</label>
              <span style={{ background: '#3b82f6', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '99px', fontWeight: 'bold' }}>{numeroDomande}</span>
            </div>
            <input 
              type="range" min="5" max="50" step="5" 
              value={numeroDomande} 
              onChange={(e) => setNumeroDomande(Number(e.target.value))} 
              style={{ width: '100%', cursor: 'pointer', accentColor: '#3b82f6' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              <span>Breve (5)</span>
              <span>Intenso (50)</span>
            </div>
          </div>
        </div>

        {/* CTA Avvio */}
        <button 
          onClick={handleStart}
          style={{ width: '100%', background: '#22c55e', color: 'white', border: 'none', padding: '1.25rem', borderRadius: '16px', fontSize: '1.25rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', boxShadow: '0 10px 15px -3px rgba(34, 197, 94, 0.3)', transition: 'transform 0.2s' }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <PlayCircle size={28} />
          INIZIA IL QUIZ
        </button>

      </div>
    </div>
  );
}
