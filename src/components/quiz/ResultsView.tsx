import { CheckCircle2, XCircle, Clock, TrendingUp, AlertTriangle, ArrowRight, BarChart3 } from 'lucide-react';

interface ResultsViewProps {
  risultati: {
    punteggioTotale: number;
    percentuale: number;
    corrette: number;
    errate: number;
    nonDate: number;
    tempo: number;
    statsByLayer: {
      core: { corrette: number; totali: number; percentuale: number };
      regionale: { corrette: number; totali: number; percentuale: number };
      comunale: { corrette: number; totali: number; percentuale: number };
    };
    categorieDeboli: Array<{
      nome: string;
      layer: 'core' | 'regionale' | 'comunale';
      percentuale: number;
      corrette: number;
      totali: number;
    }>;
  };
  onRevisione: () => void;
  onNuovoQuiz: () => void;
}

export default function ResultsView({ risultati, onRevisione, onNuovoQuiz }: ResultsViewProps) {
  const { percentuale, corrette, errate, nonDate, tempo, statsByLayer, categorieDeboli, punteggioTotale } = risultati;

  const totali = corrette + errate + nonDate;
  const isPassed = percentuale >= 60; // soglia personalizzabile
  const tempoMinuti = Math.floor(tempo / 60);
  const tempoSecondi = tempo % 60;

  const getColor = (pct: number) => pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Header con risultato principale */}
        <section style={{ 
          background: isPassed 
            ? 'linear-gradient(135deg, #065f46 0%, #047857 100%)' 
            : 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)', 
          borderRadius: '24px', 
          padding: '3rem 2rem', 
          textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ fontSize: '5rem', fontWeight: '900', marginBottom: '1rem', lineHeight: 1 }}>
            {percentuale}%
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', margin: 0 }}>
            {isPassed ? '✅ Superato!' : '❌ Non superato'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', margin: '0.5rem 0 0 0' }}>
            Punteggio: <strong>{punteggioTotale}</strong> / {totali} • {corrette} corrette, {errate} errate
            {nonDate > 0 && `, ${nonDate} non date`}
          </p>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>
            <Clock size={18} />
            <span>{tempoMinuti}:{tempoSecondi.toString().padStart(2, '0')}</span>
          </div>
        </section>

        {/* Stats per Layer */}
        <section style={{ background: '#1e293b', borderRadius: '20px', padding: '2rem', border: '1px solid #334155' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1.5rem 0' }}>
            <BarChart3 size={24} color="#3b82f6" />
            Prestazioni per Layer
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Core */}
            {statsByLayer.core.totali > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                  <span style={{ fontWeight: '600' }}>Core Nazionale</span>
                  <span style={{ color: '#94a3b8' }}>
                    {statsByLayer.core.corrette}/{statsByLayer.core.totali} ({statsByLayer.core.percentuale}%)
                  </span>
                </div>
                <div style={{ height: '12px', background: '#0f172a', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${statsByLayer.core.percentuale}%`, 
                    height: '100%', 
                    background: getColor(statsByLayer.core.percentuale),
                    transition: 'width 0.8s ease'
                  }} />
                </div>
              </div>
            )}

            {/* Regionale */}
            {statsByLayer.regionale.totali > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                  <span style={{ fontWeight: '600' }}>Regionale</span>
                  <span style={{ color: '#94a3b8' }}>
                    {statsByLayer.regionale.corrette}/{statsByLayer.regionale.totali} ({statsByLayer.regionale.percentuale}%)
                  </span>
                </div>
                <div style={{ height: '12px', background: '#0f172a', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${statsByLayer.regionale.percentuale}%`, 
                    height: '100%', 
                    background: getColor(statsByLayer.regionale.percentuale),
                    transition: 'width 0.8s ease'
                  }} />
                </div>
              </div>
            )}

            {/* Comunale */}
            {statsByLayer.comunale.totali > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                  <span style={{ fontWeight: '600' }}>Comunale</span>
                  <span style={{ color: '#94a3b8' }}>
                    {statsByLayer.comunale.corrette}/{statsByLayer.comunale.totali} ({statsByLayer.comunale.percentuale}%)
                  </span>
                </div>
                <div style={{ height: '12px', background: '#0f172a', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${statsByLayer.comunale.percentuale}%`, 
                    height: '100%', 
                    background: getColor(statsByLayer.comunale.percentuale),
                    transition: 'width 0.8s ease'
                  }} />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Categorie Deboli */}
        {categorieDeboli.length > 0 && (
          <section style={{ 
            background: '#1e293b', 
            borderRadius: '20px', 
            padding: '2rem', 
            border: '1px solid #334155',
            borderLeft: '4px solid #f59e0b'
          }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0' }}>
              <AlertTriangle size={24} color="#f59e0b" />
              Aree da migliorare
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#94a3b8', lineHeight: 2 }}>
              {categorieDeboli.slice(0, 5).map((cat, idx) => (
                <li key={idx}>
                  <strong style={{ color: '#f8fafc' }}>{cat.nome}</strong> 
                  <span style={{ color: '#64748b' }}> ({cat.layer})</span> — {cat.corrette}/{cat.totali} ({cat.percentuale}%)
                </li>
              ))}
            </ul>
            {categorieDeboli.length > 5 && (
              <p style={{ marginTop: '1rem', marginBottom: 0, color: '#64748b', fontSize: '0.9rem' }}>
                ...e altre {categorieDeboli.length - 5} categorie sotto il 60%
              </p>
            )}
          </section>
        )}

        {/* Azioni */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          
          <button
            onClick={onRevisione}
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '16px',
              padding: '1.5rem',
              color: '#f8fafc',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              transition: 'transform 0.2s, background 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.background = '#334155';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = '#1e293b';
            }}
          >
            <div style={{ 
              background: '#0f172a', 
              width: '50px', 
              height: '50px', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <XCircle size={28} color="#ef4444" />
            </div>
            <span>Rivedi gli errori</span>
          </button>

          <button
            onClick={onNuovoQuiz}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              border: 'none',
              borderRadius: '16px',
              padding: '1.5rem',
              color: '#f8fafc',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              transition: 'transform 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ 
              background: 'rgba(255,255,255,0.2)', 
              width: '50px', 
              height: '50px', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <ArrowRight size={28} />
            </div>
            <span>Nuovo Quiz</span>
          </button>

        </section>

      </div>
    </div>
  );
}
