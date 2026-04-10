import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, getDocs, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { AlertTriangle, CheckCircle, ArrowRight, Trash2, Cpu, PlusCircle } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyValue = any;

interface AiDraft {
  id: string;
  tipo?: string;
  nuovaDomanda?: Record<string, AnyValue>;
  vecchiaDomanda?: Record<string, AnyValue>;
  domandaOriginaleId?: string;
  fonte?: string;
  differenze?: string[];
  [key: string]: AnyValue;
}

export default function AiInbox() {
  const [drafts, setDrafts] = useState<AiDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const q = query(collection(db, 'bozze_aggiornamenti'));
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setDrafts(data);
      } catch (e) {
        console.error("Errore caricamento bozze:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchDrafts();
  }, []);

  const approvaDraft = async (draft: AiDraft) => {
    setProcessingId(draft.id);
    try {
      const isNewImport = draft.tipo === 'NEW_IMPORT';
      const nuova = draft.nuovaDomanda! || {};
      
      if (isNewImport) {
        const newId = draft.domandaOriginaleId || `IMPORT-${Date.now()}`;
        const quizRef = doc(db, 'domande_core', newId);
        await setDoc(quizRef, {
          ...nuova,
          id: newId,
          createdAt: new Date().toISOString(),
          fonte: draft.fonte || nuova.fonte || null
        });
      } else {
        // SOVRASCRITTURA di un quiz esistente: setDoc garantisce create-or-replace
        if (!draft.domandaOriginaleId) throw new Error("ID originale mancante per sovrascrittura");
        const quizRef = doc(db, 'domande_core', draft.domandaOriginaleId);
        await setDoc(quizRef, {
          ...nuova,
          id: draft.domandaOriginaleId,
          updatedAt: new Date().toISOString(),
          fonte: draft.fonte || nuova.fonte || null
        });
      }
      
      // Rimuovi la bozza dopo l'approvazione (se non è il mock locale)
      if (draft.id !== 'mock-draft-1') {
        await deleteDoc(doc(db, 'bozze_aggiornamenti', draft.id));
      }
      
      setDrafts(prev => prev.filter(d => d.id !== draft.id));
    } catch (e) {
      console.error("Errore approvazione bozza:", e);
      alert("Errore durante l'aggiornamento. Verifica che il quiz originale esista ancora nel database.");
    } finally {
      setProcessingId(null);
    }
  };


  const rifiutaDraft = async (draftId: string) => {
    setProcessingId(draftId);
    try {
      if (draftId !== 'mock-draft-1') {
        await deleteDoc(doc(db, 'bozze_aggiornamenti', draftId));
      }
      setDrafts(prev => prev.filter(d => d.id !== draftId));
    } catch(e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <Cpu color="#10b981" /> Cyborg Inbox: Radar Normativo
      </h2>
      <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '2rem' }}>
        Le intelligenze artificiali agganciano le modifiche di legge e ti propongono qui un "Diff" prima di pubblicare.
      </p>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Scansione radar in corso...</p>
      ) : drafts.length === 0 ? (
        <div style={{ background: '#1e293b', border: '1px solid #334155', padding: '3rem', borderRadius: '20px', textAlign: 'center' }}>
          <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>Tutto Sicuro e Segnalato</h3>
          <p style={{ color: '#94a3b8', margin: 0 }}>Nessuna anomalia normativa rilevata oggi. L'app è 100% allineata all'ordinamento vigente.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {drafts.map(draft => {
            const isNewImport = draft.tipo === 'NEW_IMPORT';
            return (
              <div key={draft.id} style={{ background: '#1e293b', border: `1px solid ${isNewImport ? '#3b82f6' : '#eab308'}`, borderRadius: '20px', overflow: 'hidden' }}>
                <div style={{ background: isNewImport ? 'rgba(59, 130, 246, 0.1)' : 'rgba(234, 179, 8, 0.1)', borderBottom: '1px solid #334155', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  {isNewImport ? <PlusCircle size={24} color="#3b82f6" /> : <AlertTriangle size={24} color="#eab308" />}
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: isNewImport ? '#3b82f6' : '#eab308', fontSize: '1.2rem' }}>
                      {isNewImport ? `Nuovo Inserimento: [${draft.domandaOriginaleId}]` : `Allerta Aggiornamento: Quiz [${draft.domandaOriginaleId}]`}
                    </h3>
                    <p style={{ margin: 0, color: '#f8fafc', fontSize: '0.9rem', lineHeight: 1.5 }}>
                      <strong>{isNewImport ? 'Origine:' : 'Motivo AI:'}</strong> {draft.motivoVariazione}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isNewImport ? '1fr' : '1fr 1fr', gap: '1px', background: '#334155' }}>
                  {!isNewImport && (
                    <div style={{ background: '#0f172a', padding: '1.5rem' }}>
                      <div style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 700, marginBottom: '1rem', letterSpacing: '1px' }}>VECCHIA VERSIONE (ATTUALE)</div>
                      <p style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '1.5rem' }}>{draft.vecchiaDomanda?.testo}</p>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {draft.vecchiaDomanda?.opzioni.map((opz: string, i: number) => (
                          <li key={i} style={{ padding: '0.8rem', background: '#1e293b', borderLeft: (draft.vecchiaDomanda!.rispostaCorretta ?? draft.vecchiaDomanda!.rispostaEsatta) === i ? '4px solid #10b981' : '4px solid #334155', borderRadius: '4px', fontSize: '0.9rem' }}>
                            {opz}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div style={{ background: isNewImport ? '#0f172a' : 'rgba(16, 185, 129, 0.05)', padding: '1.5rem' }}>
                    <div style={{ fontSize: '0.8rem', color: isNewImport ? '#3b82f6' : '#10b981', fontWeight: 700, marginBottom: '1rem', letterSpacing: '1px' }}>
                      {isNewImport ? 'CONTENUTO ESTRATTO' : 'NUOVA PROPOSTA AI'}
                    </div>
                    <p style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '1.5rem', color: isNewImport ? '#fff' : '#10b981' }}>{draft.nuovaDomanda!.testo}</p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      {draft.nuovaDomanda!.opzioni.map((opz: string, i: number) => (
                        <li key={i} style={{ padding: '0.8rem', background: '#1e293b', borderLeft: (draft.nuovaDomanda!.rispostaCorretta ?? draft.nuovaDomanda!.rispostaEsatta) === i ? '4px solid #10b981' : '4px solid #334155', borderRadius: '4px', fontSize: '0.9rem' }}>
                          {opz}
                        </li>
                      ))}
                    </ul>
                    {(draft.nuovaDomanda!.spiegazione || draft.fonte) && (
                      <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px dashed #10b981', fontSize: '0.85rem' }}>
                        {draft.nuovaDomanda!.spiegazione && <div><strong>Spiegazione:</strong> {draft.nuovaDomanda!.spiegazione}</div>}
                        {draft.fonte && <div style={{ marginTop: '0.5rem' }}><strong>Fonte Tag:</strong> {draft.fonte}</div>}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ padding: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end', background: '#1e293b' }}>
                  <button 
                    disabled={processingId === draft.id}
                    onClick={() => rifiutaDraft(draft.id)}
                    style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '0.8rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Trash2 size={18} /> {isNewImport ? 'Ignora' : 'Scarta Bozza'}
                  </button>
                  <button 
                    disabled={processingId === draft.id}
                    onClick={() => approvaDraft(draft)}
                    style={{ background: '#10b981', border: 'none', color: '#020617', padding: '0.8rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    {isNewImport ? <PlusCircle size={18} /> : <ArrowRight size={18} />}
                    {isNewImport ? 'Aggiungi al Database' : 'Sovrascrivi Live in App'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
