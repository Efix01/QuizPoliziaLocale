import { useState } from 'react';
import { db } from '../../lib/firebase';
import {
  collection, getDocs, writeBatch, doc,
} from 'firebase/firestore';
import { RefreshCw, CheckCircle, AlertTriangle, BarChart3 } from 'lucide-react';

// ─── Mappa: categoriaId → etichetta leggibile ───────────────────────────────
const CATEGORIA_LABELS: Record<string, string> = {
  cds:            'Codice della Strada',
  penale:         'Diritto Penale e Proc. Penale',
  l689:           'L. 689/81 — Sanzioni Amm.',
  l241:           'L. 241/90 — Procedimento Amm.',
  enti_locali:    'TUEL — Ordinamento Enti Locali',
  costituzionale: 'Diritto Costituzionale',
  amministrativo: 'Diritto Amministrativo',
  reg_generale:   'Normativa Regionale',
  com_generale:   'Regolamento Comunale',
};

// ─── Logica di rilevamento categoria dal contenuto del quiz ─────────────────
function detectCategoria(testo: string, spiegazione = '', fonte = ''): string {
  const t = `${testo} ${spiegazione} ${fonte}`.toLowerCase();

  if (t.includes('codice della strada') || t.includes('c.d.s') || t.includes('art. 14') && t.includes('stradale') || t.includes('velocità') && t.includes('strada') || t.includes('patente') || t.includes('autoveicol') || t.includes('ciclomotor') || t.includes('segnaletica') || t.includes('sorpasso') || t.includes('cds') && !t.includes('sequestro')) return 'cds';

  if (t.includes('689') || t.includes('sanzione amministrativa') || t.includes('depenalizzaz') || t.includes('oblazione') && t.includes('amministrativ')) return 'l689';

  if (t.includes('241') || t.includes('procedimento amministrativo') || t.includes('legge 241') || t.includes('silenzio-assenso') || t.includes('accesso agli atti') || t.includes('conferenza di servizi')) return 'l241';

  if (t.includes('tuel') || t.includes('d.lgs. 267') || t.includes('267/2000') || t.includes('ordinamento degli enti') || t.includes('consiglio comunale') || t.includes('giunta comunale') || t.includes('sindaco') || t.includes('statuto comunale') || t.includes('regolamento di polizia') || t.includes('polizia locale') && t.includes('regolamento')) return 'enti_locali';

  if (t.includes('costituzion') || t.includes('diritti fondamental') || t.includes('art. 1 cost') || t.includes('parlamento') || t.includes('republic')) return 'costituzionale';

  if (t.includes('arresto') || t.includes('sequestro') || t.includes('reato') || t.includes('c.p.p') || t.includes('codice penale') || t.includes('procedura penale') || t.includes('fermo di polizia giudiziaria') || t.includes('flagranza') || t.includes('denunci') || t.includes('oltraggio') || t.includes('resistenza') || t.includes('minaccia') || t.includes('lesioni')) return 'penale';

  if (t.includes('diritto amministrativo') || t.includes('atto amministrativo') || t.includes('ricorso') || t.includes('tar ') || t.includes('consiglio di stato') || t.includes('autotutela') || t.includes('annullamento d\'ufficio')) return 'amministrativo';

  return ''; // Categoria non rilevabile
}

interface QuizDoc {
  id: string;
  categoriaId: string;
  testo?: string;
  spiegazione?: string;
  fonte?: string;
  riferimentoNormativo?: { legge?: string };
}

interface MigrazionePreview {
  id: string;
  vecchia: string;
  nuova: string;
  rilevata: boolean;
}

export default function AdminMigrazioneCategorie() {
  const [loading, setLoading] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [preview, setPreview] = useState<MigrazionePreview[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [applying, setApplying] = useState(false);
  const [done, setDone] = useState(false);
  const [errore, setErrore] = useState('');

  // ─── Step 1: analizza i quiz attuali e crea una preview ─────────────────
  const handleAnalizza = async () => {
    setLoading(true);
    setPreviewing(false);
    setPreview([]);
    setDone(false);
    setErrore('');

    try {
      const snap = await getDocs(collection(db, 'domande_core'));
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as QuizDoc));

      // Conteggio categorie attuali
      const st: Record<string, number> = {};
      docs.forEach(d => { st[d.categoriaId] = (st[d.categoriaId] || 0) + 1; });
      setStats(st);

      // Proposta di riclassificazione
      const items: MigrazionePreview[] = docs.map(d => {
        const fonte = d.riferimentoNormativo?.legge || d.fonte || '';
        const nuova = detectCategoria(d.testo || '', d.spiegazione || '', fonte);
        return {
          id: d.id,
          vecchia: d.categoriaId,
          nuova: nuova || d.categoriaId, // se non rilevata, mantieni l'attuale
          rilevata: nuova !== '' && nuova !== d.categoriaId,
        };
      });

      setPreview(items);
      setPreviewing(true);
    } catch (e: any) {
      setErrore(`Errore analisi: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: applica le modifiche in batch ───────────────────────────────
  const handleApplica = async () => {
    const modifiche = preview.filter(p => p.rilevata);
    if (modifiche.length === 0) return;

    setApplying(true);
    setErrore('');
    try {
      // Firestore batch max 500 operazioni
      const chunks = [];
      for (let i = 0; i < modifiche.length; i += 499) {
        chunks.push(modifiche.slice(i, i + 499));
      }
      for (const chunk of chunks) {
        const batch = writeBatch(db);
        chunk.forEach(m => {
          batch.update(doc(db, 'domande_core', m.id), { categoriaId: m.nuova });
        });
        await batch.commit();
      }
      setDone(true);
    } catch (e: any) {
      setErrore(`Errore applicazione: ${e.message}`);
    } finally {
      setApplying(false);
    }
  };

  const modificheRilevate = preview.filter(p => p.rilevata).length;

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', color: '#f8fafc' }}>
      <h1 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>🔧 Migrazione Categorie Quiz</h1>
      <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
        Analizza i quiz in Firestore e riclassifica automaticamente quelli con categoria errata.
      </p>

      {/* ─── Statistiche attuali ──────────────────────────────────── */}
      {Object.keys(stats).length > 0 && (
        <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', color: '#94a3b8', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <BarChart3 size={16} /> Distribuzione attuale in Firestore
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
            {Object.entries(stats).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
              <div key={cat} style={{
                background: '#0f172a', borderRadius: '8px', padding: '0.5rem 1rem',
                border: '1px solid #334155', fontSize: '0.9rem',
              }}>
                <span style={{ color: '#64748b' }}>{CATEGORIA_LABELS[cat] || cat}: </span>
                <strong style={{ color: '#f8fafc' }}>{count}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── CTA Analizza ─────────────────────────────────────────── */}
      {!previewing && (
        <button
          onClick={handleAnalizza}
          disabled={loading}
          style={{
            padding: '1rem 2rem', borderRadius: '12px',
            background: '#3b82f6', border: 'none', color: '#fff',
            fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.6rem',
          }}
        >
          <RefreshCw size={18} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          {loading ? 'Analisi in corso...' : 'Analizza e proponi riclassificazione'}
        </button>
      )}

      {/* ─── Preview modifiche ────────────────────────────────────── */}
      {previewing && !done && (
        <>
          <div style={{
            padding: '1rem 1.5rem', borderRadius: '12px', marginBottom: '1.5rem',
            background: modificheRilevate > 0 ? 'rgba(251,146,60,0.1)' : 'rgba(16,185,129,0.1)',
            border: `1px solid ${modificheRilevate > 0 ? '#f97316' : '#10b981'}`,
            display: 'flex', alignItems: 'center', gap: '0.8rem',
          }}>
            <AlertTriangle size={20} color={modificheRilevate > 0 ? '#f97316' : '#10b981'} />
            <div>
              <strong>{modificheRilevate} quiz</strong> verranno riclassificati su{' '}
              <strong>{preview.length}</strong> totali.{' '}
              {preview.length - modificheRilevate} mantenuti invariati.
            </div>
          </div>

          {/* Lista cambiamenti */}
          {modificheRilevate > 0 && (
            <div style={{
              background: '#1e293b', borderRadius: '16px', border: '1px solid #334155',
              marginBottom: '1.5rem', maxHeight: '400px', overflowY: 'auto',
            }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #334155', display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: '1rem', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                <span>ID</span><span>Da</span><span>→ A</span>
              </div>
              {preview.filter(p => p.rilevata).map(p => (
                <div key={p.id} style={{
                  padding: '0.75rem 1.5rem', borderBottom: '1px solid #1e293b',
                  display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: '1rem',
                  fontSize: '0.85rem', background: '#0f172a',
                }}>
                  <span style={{ color: '#64748b', fontFamily: 'monospace' }}>{p.id}</span>
                  <span style={{ color: '#ef4444' }}>{CATEGORIA_LABELS[p.vecchia] || p.vecchia}</span>
                  <span style={{ color: '#10b981' }}>→ {CATEGORIA_LABELS[p.nuova] || p.nuova}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={handleApplica}
              disabled={applying || modificheRilevate === 0}
              style={{
                padding: '1rem 2rem', borderRadius: '12px',
                background: modificheRilevate > 0 ? '#10b981' : '#334155',
                border: 'none', color: modificheRilevate > 0 ? '#022c22' : '#64748b',
                fontWeight: 700, fontSize: '1rem', cursor: modificheRilevate > 0 ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', gap: '0.6rem',
              }}
            >
              <CheckCircle size={18} />
              {applying ? 'Applicazione in corso...' : `Applica ${modificheRilevate} modifiche`}
            </button>
            <button
              onClick={() => { setPreviewing(false); setPreview([]); setStats({}); }}
              style={{
                padding: '1rem 1.5rem', borderRadius: '12px',
                background: 'transparent', border: '1px solid #334155',
                color: '#94a3b8', cursor: 'pointer', fontWeight: 500,
              }}
            >
              Annulla
            </button>
          </div>
        </>
      )}

      {/* ─── Conferma ─────────────────────────────────────────────── */}
      {done && (
        <div style={{
          padding: '2rem', borderRadius: '16px', textAlign: 'center',
          background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981',
        }}>
          <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ color: '#10b981', margin: '0 0 0.5rem 0' }}>Migrazione completata!</h3>
          <p style={{ color: '#94a3b8' }}>{modificheRilevate} quiz sono stati riclassificati correttamente.</p>
        </div>
      )}

      {errore && (
        <div style={{ padding: '1rem', background: '#7f1d1d', borderRadius: '12px', marginTop: '1rem', color: '#fca5a5' }}>
          {errore}
        </div>
      )}
    </div>
  );
}
