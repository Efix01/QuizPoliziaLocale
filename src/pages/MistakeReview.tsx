import { useMemo, useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { usePL } from '../context/PLContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  RotateCcw, 
  ShieldCheck, 
  ArrowRight, 
  Trash2, 
  BookOpen,
  AlertCircle,
  Filter
} from 'lucide-react';
import { commitInChunks } from '../lib/firestoreHelpers';
import { doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

type LayerFilter = 'all' | 'core' | 'regionale' | 'comunale';

export default function MistakeReview() {
  const { erroriLog, resetErrori } = useProgress();
  const { tutteLeDomande } = usePL();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [layerFilter, setLayerFilter] = useState<LayerFilter>('all');
  const [isDeleting, setIsDeleting] = useState(false);

  // ===================================================
  // Stats per layer
  // ===================================================

  const statsByLayer = useMemo(() => {
    const stats = {
      core: 0,
      regionale: 0,
      comunale: 0,
    };

    Object.keys(erroriLog || {}).forEach(id => {
      const domanda = tutteLeDomande.find(d => d.id === id);
      if (domanda) stats[domanda.strato]++;
    });

    return stats;
  }, [erroriLog, tutteLeDomande]);

  const totaleErrori = statsByLayer.core + statsByLayer.regionale + statsByLayer.comunale;

  // ===================================================
  // Lista errori ordinata per priorità (SRS)
  // ===================================================

  const erroriOrdinati = useMemo(() => {
    return Object.entries(erroriLog || {})
      .map(([id, log]) => {
        const domanda = tutteLeDomande.find(d => d.id === id);
        if (!domanda) return null;

        return {
          id,
          domanda,
          count: log.count,
          lastError: new Date(log.lastError),
        };
      })
      .filter((e): e is NonNullable<typeof e> => e !== null)
      .filter(e => {
        // Applica filtro layer
        if (layerFilter === 'all') return true;
        return e.domanda.strato === layerFilter;
      })
      .sort((a, b) => {
        // Prima per frequenza (più errori = priorità alta)
        if (b.count !== a.count) return b.count - a.count;
        // Poi per recenza (più recente = priorità alta)
        return b.lastError.getTime() - a.lastError.getTime();
      });
  }, [erroriLog, tutteLeDomande, layerFilter]);

  // ===================================================
  // Navigazione al ripasso
  // ===================================================

  const avviaRipasso = (layer?: 'core' | 'regionale' | 'comunale') => {
    const erroriDaRipassare = layer
      ? erroriOrdinati.filter(e => e.domanda.strato === layer)
      : erroriOrdinati;

    if (erroriDaRipassare.length === 0) return;

    const domande = erroriDaRipassare.map(e => e.domanda);

    navigate('/study', {
      state: {
        domande,
        mode: 'mistakes',
        categoriaId: undefined,
        strato: layer,
      },
    });
  };

  // ===================================================
  // Reset errori con batch chunking
  // ===================================================

  const azzeraErrori = async () => {
    if (!user || !erroriLog) return;

    const conferma = window.confirm(
      `Sei sicuro di voler cancellare ${totaleErrori} errori? Questa azione non è reversibile.`
    );
    if (!conferma) return;

    setIsDeleting(true);

    try {
      const operations = Object.keys(erroriLog).map(id => ({
        type: 'delete' as const,
        ref: doc(db, `users/${user.uid}/errori/${id}`),
      }));

      await commitInChunks(operations);

      // Aggiorna stato locale
      resetErrori();

      alert('Tutti gli errori sono stati cancellati.');
    } catch (e) {
      console.error('Errore durante l\'azzeramento:', e);
      alert('Errore durante la cancellazione. Riprova.');
    } finally {
      setIsDeleting(false);
    }
  };

  // ===================================================
  // Tempo relativo (es. "3 giorni fa")
  // ===================================================

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'oggi';
    if (diffDays === 1) return 'ieri';
    if (diffDays < 7) return `${diffDays} giorni fa`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} settimane fa`;
    return `${Math.floor(diffDays / 30)} mesi fa`;
  };

  // ===================================================
  // Render
  // ===================================================

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '12px',
                padding: '0.75rem',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={32} color="#ef4444" />
                Revisione Errori
              </h1>
              <p style={{ color: '#94a3b8', marginTop: '0.25rem', fontSize: '1rem' }}>
                {totaleErrori} {totaleErrori === 1 ? 'domanda' : 'domande'} da rivedere
              </p>
            </div>
          </div>

          {totaleErrori > 0 && (
            <button
              onClick={azzeraErrori}
              disabled={isDeleting}
              style={{
                background: 'transparent',
                border: '1px solid #334155',
                borderRadius: '12px',
                padding: '0.75rem 1.5rem',
                color: isDeleting ? '#64748b' : '#ef4444',
                cursor: isDeleting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '600',
                opacity: isDeleting ? 0.5 : 1,
              }}
            >
              <Trash2 size={16} />
              {isDeleting ? 'Cancellazione...' : 'Azzera errori'}
            </button>
          )}
        </header>

        {/* Card Stats */}
        <section
          style={{
            background: '#1e293b',
            borderRadius: '24px',
            padding: '2rem',
            border: '1px solid #334155',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Totale errori */}
            <div style={{ textAlign: 'center', flex: '1', minWidth: '150px' }}>
              <h3 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '600', textTransform: 'uppercase' }}>
                Errori Totali
              </h3>
              <div style={{ fontSize: '3rem', fontWeight: '900', color: '#ef4444', lineHeight: 1 }}>{totaleErrori}</div>
            </div>

            {/* Stats per layer */}
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', flex: '2' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Core</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f8fafc' }}>{statsByLayer.core}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Regionale</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f8fafc' }}>{statsByLayer.regionale}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Comunale</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f8fafc' }}>{statsByLayer.comunale}</div>
              </div>
            </div>

            {/* Azioni rapide */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => avviaRipasso()}
                disabled={totaleErrori === 0}
                style={{
                  background: totaleErrori > 0 ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : '#334155',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.75rem 1.5rem',
                  color: '#fff',
                  cursor: totaleErrori > 0 ? 'pointer' : 'not-allowed',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <RotateCcw size={18} />
                Ripassa tutto
              </button>
            </div>
          </div>
        </section>

        {/* Filtro layer */}
        {totaleErrori > 0 && (
          <section style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontWeight: '600' }}>
              <Filter size={18} />
              Filtra:
            </div>
            {(['all', 'core', 'regionale', 'comunale'] as const).map(layer => (
              <button
                key={layer}
                onClick={() => setLayerFilter(layer)}
                style={{
                  background: layerFilter === layer ? '#3b82f6' : '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '0.5rem 1rem',
                  color: layerFilter === layer ? '#fff' : '#cbd5e1',
                  cursor: 'pointer',
                  fontWeight: '600',
                  textTransform: 'capitalize',
                }}
              >
                {layer === 'all' ? 'Tutti' : layer}
              </button>
            ))}
          </section>
        )}

        {/* Lista errori */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <AnimatePresence mode="popLayout">
            {erroriOrdinati.length > 0 ? (
              erroriOrdinati.map((errore, i) => (
                <motion.div
                  key={errore.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  style={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '20px',
                    padding: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1', minWidth: '250px' }}>
                    {/* Badge priorità */}
                    <div
                      style={{
                        background: errore.count >= 3 ? '#7f1d1d' : '#334155',
                        color: errore.count >= 3 ? '#ef4444' : '#94a3b8',
                        borderRadius: '12px',
                        width: '50px',
                        height: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        fontWeight: '900',
                        flexShrink: 0,
                      }}
                    >
                      {errore.count}
                    </div>

                    <div style={{ flex: '1' }}>
                      {/* Categoria */}
                      <div
                        style={{
                          display: 'inline-block',
                          background: '#334155',
                          color: '#cbd5e1',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '99px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          marginBottom: '0.5rem',
                        }}
                      >
                        {('categoria' in errore.domanda ? String(errore.domanda.categoria) : errore.domanda.categoriaId)} ({errore.domanda.strato})
                      </div>

                      {/* Testo domanda */}
                      <h4
                        style={{
                          fontSize: '1.05rem',
                          fontWeight: '600',
                          color: '#f8fafc',
                          margin: 0,
                          lineHeight: 1.4,
                          maxWidth: '600px',
                        }}
                      >
                        {errore.domanda.testo.length > 120
                          ? errore.domanda.testo.slice(0, 120) + '...'
                          : errore.domanda.testo}
                      </h4>

                      {/* Metadata */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          marginTop: '0.5rem',
                          fontSize: '0.85rem',
                          color: '#64748b',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <BookOpen size={14} />
                          {errore.count} {errore.count === 1 ? 'volta' : 'volte'}
                        </span>
                        <span>•</span>
                        <span>Ultimo: {formatRelativeTime(errore.lastError)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Azione */}
                  <button
                    onClick={() => avviaRipasso(errore.domanda.strato)}
                    style={{
                      background: '#334155',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '0.75rem',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#3b82f6';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = '#334155';
                      e.currentTarget.style.color = '#94a3b8';
                    }}
                  >
                    <ArrowRight size={20} />
                  </button>
                </motion.div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    background: '#065f46',
                    color: '#22c55e',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem auto',
                  }}
                >
                  <ShieldCheck size={40} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem', margin: 0 }}>
                  {layerFilter === 'all' ? 'Nessun errore!' : `Nessun errore nel layer ${layerFilter}`}
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '1.05rem', marginTop: '0.5rem' }}>
                  {layerFilter === 'all'
                    ? 'Continua così — il tuo registro è pulito.'
                    : 'Ottimo lavoro su questo layer. Prova con gli altri!'}
                </p>
                {layerFilter !== 'all' && (
                  <button
                    onClick={() => setLayerFilter('all')}
                    style={{
                      background: '#3b82f6',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '0.75rem 1.5rem',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: '600',
                      marginTop: '1.5rem',
                    }}
                  >
                    Mostra tutti
                  </button>
                )}
              </div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}
