import { useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { Upload, CheckCircle, AlertCircle, FileJson } from 'lucide-react';
import type { CategoriaId } from '../../types/pl';

// ================================================
// Mappatura categoria → CategoriaId interno
// ================================================
const mapCategoria = (cat: string): CategoriaId => {
  const c = (cat || '').toLowerCase().trim();
  
  // Categorie NAZIONALI — check specifici e precisi
  if (c === 'cds' || c.includes('codice della strada') || c.includes('codice stradale')) return 'cds';
  if (c === 'penale' || c.includes('diritto penale') || c.includes('proc. penale') || c.includes('procedura penale') || c.includes('cpp') || c.includes('c.p.p') || c.includes('sequestro') || c.includes('arresto') || c.includes('reato')) return 'penale';
  if (c === 'l689' || c.includes('689') || c.includes('depenalizzazione') || c.includes('sanzioni amministrative')) return 'l689';
  if (c === 'l241' || c.includes('241') || c.includes('procedimento amministrativo') || c.includes('legge sul procedimento')) return 'l241';
  if (c === 'tuel' || c.includes('tuel') || c.includes('d.lgs. 267') || c.includes('267/2000') || c.includes('ordinamento degli enti locali') || c.includes('enti locali')) return 'enti_locali';
  if (c === 'costituzionale' || c.includes('costituzione') || c.includes('costituzional')) return 'costituzionale';
  if (c === 'amministrativo' || c.includes('diritto amministrativo')) return 'amministrativo';
  
  // Categorie LOCALI (regolamenti specifici)
  if (c === 'reg_generale' || c.includes('regolamento regionale') || c.includes('normativa regionale')) return 'reg_generale';
  if (c === 'com_generale' || c.includes('regolamento comunale') || c.includes('normativa comunale') || c.includes('comune di')) return 'com_generale';
  
  // Fallback sicuro → materia generica nazionale
  return 'amministrativo';
};

// "A. Testo risposta" → "Testo risposta"
const stripPrefix = (s: string) => s.replace(/^[A-D][.)]\s*/i, '').trim();

// "D" | "d" | 3 → 0..3
const letteraToIndex = (v: string | number): number => {
  if (typeof v === 'number') return Math.max(0, Math.min(3, v));
  const map: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
  return map[v.trim().toUpperCase()] ?? 0;
};

// ================================================
// Validazione di un singolo quiz input
// ================================================
interface QuizInput {
  id?: string;
  categoria?: string;
  domanda?: string;
  testo?: string;
  opzioni: string[];
  corretta: string | number;
  spiegazione?: string;
  source?: string;
}

const FORMATO_ESEMPIO = `[
  {
    "id": "0001",
    "categoria": "penale",
    "domanda": "Testo della domanda?",
    "opzioni": [
      "A. Prima risposta",
      "B. Seconda risposta",
      "C. Terza risposta",
      "D. Quarta risposta"
    ],
    "corretta": "D",
    "spiegazione": "Spiegazione normativa...",
    "source": "Art. 380 c.p.p."
  }
]`;

export default function CaricaQuiz() {
  const [text, setText] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [log, setLog] = useState<string[]>([]);
  const [stats, setStats] = useState({ nuovi: 0, duplicati: 0, errori: 0 });
  const [modalitaAggiornamento, setModalitaAggiornamento] = useState(false);

  const addLog = (msg: string, tipo: 'info' | 'warn' | 'error' = 'info') => {
    const prefix = tipo === 'error' ? '❌' : tipo === 'warn' ? '⚠️' : '✓';
    setLog(prev => [...prev, `${prefix} ${msg}`]);
  };

  const handleCarica = async () => {
    if (!text.trim()) return;
    setStatus('processing');
    setLog([]);
    setStats({ nuovi: 0, duplicati: 0, errori: 0 });

    let nuovi = 0, duplicati = 0, errori = 0;

    try {
      let parsed: QuizInput[];
      try {
        const raw = JSON.parse(text);
        parsed = Array.isArray(raw) ? raw : [raw];
        addLog(`JSON valido. ${parsed.length} quiz trovati.`);
      } catch {
        throw new Error('Il JSON non è valido. Controlla virgole e parentesi graffe.');
      }

      for (const item of parsed) {
        const id = String(item.id || '').trim();
        const testo = (item.domanda || item.testo || '').trim();
        
        // Validazione campi obbligatori
        if (!testo) { addLog(`ID ${id || '?'}: campo "domanda" mancante`, 'error'); errori++; continue; }
        if (!item.opzioni || item.opzioni.length < 4) { addLog(`ID ${id}: opzioni insufficienti (servono 4)`, 'error'); errori++; continue; }

        // Controllo duplicato (saltato in modalità aggiornamento)
        if (!modalitaAggiornamento) {
          const qSnap = await getDocs(query(collection(db, 'domande_core'), where('testo', '==', testo)));
          if (!qSnap.empty) {
            addLog(`ID ${id}: già presente in archivio (salto)`, 'warn');
            duplicati++;
            continue;
          }
        }

        const opzioniPulite = item.opzioni.slice(0, 4).map(stripPrefix);
        const risposta = letteraToIndex(item.corretta);
        const catId = mapCategoria(item.categoria || '');

        const docId = id ? `CORE-${id}` : `CORE-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const tipoOperazione = modalitaAggiornamento ? 'UPDATE' : 'NEW_IMPORT';
        const motivazione = modalitaAggiornamento
          ? `Aggiornamento manuale — sostituzione quiz categoria: ${catId}`
          : `Caricamento manuale — categoria: ${catId}`;

        await addDoc(collection(db, 'bozze_aggiornamenti'), {
          tipo: tipoOperazione,
          domandaOriginaleId: docId,
          motivoVariazione: motivazione,
          fonte: item.source || item.categoria || 'Manuale',
          createdAt: new Date().toISOString(),
          nuovaDomanda: {
            id: docId,
            strato: 'core',
            categoriaId: catId,
            testo,
            opzioni: opzioniPulite,
            rispostaCorretta: risposta,
            spiegazione: item.spiegazione || '',
            fonte: item.source || '',
            riferimentoNormativo: {
              legge: item.source || '',
              articolo: (item.source?.match(/[Aa]rt\.?\s*([\d\w/-]+)/)?.[1]) || ''
            },
            livelloDifficolta: 2,
            tags: [],
          }
        });

        addLog(`ID ${id}: ${modalitaAggiornamento ? 'inviato per SOSTITUZIONE ✓' : 'inviato in Inbox ✓'}`);
        nuovi++;
      }

      setStats({ nuovi, duplicati, errori });
      setStatus(errori > 0 && nuovi === 0 ? 'error' : 'completed');
      addLog(`Fatto! Nuovi: ${nuovi} | Duplicati: ${duplicati} | Errori: ${errori}`);
    } catch (err) {
      addLog(`ERRORE FATALE: ${err instanceof Error ? err.message : 'Sconosciuto'}`, 'error');
      setStatus('error');
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <Upload color="#10b981" size={32} /> Carica Quiz
        </h2>
        <p style={{ color: '#94a3b8', margin: 0 }}>
          Incolla qui il JSON dei quiz nel formato standard. Verranno inviati alla <strong>Cyborg Inbox</strong> per la tua approvazione prima di andare live.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
        {/* Area Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={FORMATO_ESEMPIO}
              style={{
                width: '100%', height: '480px', background: '#0f172a',
                border: `1px solid ${status === 'error' ? '#ef4444' : '#334155'}`,
                borderRadius: '16px', padding: '1.5rem', color: '#f8fafc',
                fontFamily: 'ui-monospace, monospace', fontSize: '0.85rem',
                resize: 'none', outline: 'none', boxSizing: 'border-box',
              }}
            />
            {status === 'processing' && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.8)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '40px', height: '40px', border: '3px solid #1e293b', borderTop: '3px solid #10b981', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
                  <p style={{ fontWeight: 600, color: '#10b981' }}>Processando...</p>
                </div>
              </div>
            )}
          </div>

          {/* Toggle Modalità Aggiornamento */}
          <div
            onClick={() => setModalitaAggiornamento(m => !m)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.8rem',
              padding: '0.8rem 1.2rem', borderRadius: '12px', cursor: 'pointer',
              background: modalitaAggiornamento ? 'rgba(251, 146, 60, 0.15)' : '#1e293b',
              border: `1px solid ${modalitaAggiornamento ? '#f97316' : '#334155'}`,
              transition: 'all 0.2s',
            }}
          >
            {/* Toggle switch visuale */}
            <div style={{
              width: '40px', height: '22px', borderRadius: '11px',
              background: modalitaAggiornamento ? '#f97316' : '#334155',
              position: 'relative', transition: 'background 0.2s', flexShrink: 0
            }}>
              <div style={{
                position: 'absolute', top: '3px',
                left: modalitaAggiornamento ? '21px' : '3px',
                width: '16px', height: '16px', borderRadius: '50%',
                background: '#fff', transition: 'left 0.2s'
              }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: modalitaAggiornamento ? '#f97316' : '#94a3b8' }}>
                {modalitaAggiornamento ? '⚡ Modalità SOSTITUZIONE attiva' : 'Modalità Sostituzione'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.1rem' }}>
                {modalitaAggiornamento
                  ? 'I quiz con lo stesso ID sovrascriveranno i documenti esistenti'
                  : 'Attiva per sostituire quiz già presenti'}
              </div>
            </div>
          </div>

          <button
            onClick={handleCarica}
            disabled={status === 'processing' || !text.trim()}
            style={{
              padding: '1rem', borderRadius: '12px', border: 'none',
              background: (!text.trim() || status === 'processing')
                ? '#1e293b'
                : modalitaAggiornamento ? '#f97316' : '#10b981',
              color: (!text.trim() || status === 'processing') ? '#64748b' : '#020617',
              fontWeight: 700, fontSize: '1rem', cursor: !text.trim() ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
              transition: 'all 0.2s',
            }}
          >
            <Upload size={18} />
            {status === 'processing'
              ? 'Caricamento in corso...'
              : modalitaAggiornamento
                ? 'Invia per Sostituzione'
                : 'Invia in Inbox per Approvazione'}
          </button>
        </div>

        {/* Pannello laterale */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Statistiche completamento */}
          {status === 'completed' && (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 700 }}>
                <CheckCircle size={20} /> Completato
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', textAlign: 'center' }}>
                <div style={{ background: '#0f172a', padding: '0.8rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{stats.nuovi}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Inviati</div>
                </div>
                <div style={{ background: '#0f172a', padding: '0.8rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>{stats.duplicati}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Duplicati</div>
                </div>
                <div style={{ background: '#0f172a', padding: '0.8rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>{stats.errori}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Errori</div>
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', padding: '1.5rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#f87171' }}>
              <AlertCircle size={20} />
              <span style={{ fontWeight: 600 }}>Errore durante il caricamento</span>
            </div>
          )}

          {/* Schema di riferimento */}
          <div style={{ background: '#1e293b', border: '1px solid #334155', padding: '1.5rem', borderRadius: '16px' }}>
            <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              <FileJson size={16} color="#3b82f6" /> Formato Atteso
            </h4>
            <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748b', lineHeight: 1.6, background: '#0f172a', padding: '1rem', borderRadius: '8px' }}>
              <span style={{ color: '#94a3b8' }}>{'{'}</span><br/>
              &nbsp;&nbsp;<span style={{ color: '#60a5fa' }}>"id"</span>: <span style={{ color: '#86efac' }}>"0001"</span>,<br/>
              &nbsp;&nbsp;<span style={{ color: '#60a5fa' }}>"categoria"</span>: <span style={{ color: '#86efac' }}>"penale"</span>,<br/>
              &nbsp;&nbsp;<span style={{ color: '#60a5fa' }}>"domanda"</span>: <span style={{ color: '#86efac' }}>"Testo..."</span>,<br/>
              &nbsp;&nbsp;<span style={{ color: '#60a5fa' }}>"opzioni"</span>: [<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#86efac' }}>"A. Prima"</span>,<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#86efac' }}>"B. Seconda"</span>,<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#86efac' }}>"C. Terza"</span>,<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#86efac' }}>"D. Quarta"</span><br/>
              &nbsp;&nbsp;],<br/>
              &nbsp;&nbsp;<span style={{ color: '#60a5fa' }}>"corretta"</span>: <span style={{ color: '#86efac' }}>"D"</span>,<br/>
              &nbsp;&nbsp;<span style={{ color: '#60a5fa' }}>"spiegazione"</span>: <span style={{ color: '#86efac' }}>"..."</span>,<br/>
              &nbsp;&nbsp;<span style={{ color: '#60a5fa' }}>"source"</span>: <span style={{ color: '#86efac' }}>"Art. X L. Y"</span><br/>
              <span style={{ color: '#94a3b8' }}>{'}'}</span>
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
              <strong style={{ color: '#64748b' }}>Categorie valide:</strong><br/>
              penale · cds · enti_locali · amministrativo · costituzionale · reg_generale · com_generale
            </div>
          </div>

          {/* Log */}
          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '1rem', flex: 1, minHeight: '150px', maxHeight: '250px', overflowY: 'auto' }}>
            <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, marginBottom: '0.8rem', letterSpacing: '1px' }}>LOG</div>
            {log.length === 0 ? (
              <div style={{ color: '#334155', fontSize: '0.8rem', fontStyle: 'italic' }}>In attesa di input...</div>
            ) : log.map((l, i) => (
              <div key={i} style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: l.startsWith('❌') ? '#f87171' : l.startsWith('⚠️') ? '#fbbf24' : '#94a3b8', marginBottom: '0.3rem' }}>
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
