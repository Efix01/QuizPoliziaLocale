import { useState, useMemo } from 'react';
import { usePL } from '../../context/PLContext';
import { Search, Edit2, Save, X } from 'lucide-react';
import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function AdminQuizEditor() {
  const { domandeCore } = usePL();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  // Stato Modale di Modifica
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Filtro
  const filteredQuizzes = useMemo(() => {
    if (!searchTerm) return domandeCore;
    const lowerTerm = searchTerm.toLowerCase();
    return domandeCore.filter(q => 
      q.id.toLowerCase().includes(lowerTerm) || 
      q.testo.toLowerCase().includes(lowerTerm) ||
      (q.spiegazione && q.spiegazione.toLowerCase().includes(lowerTerm))
    );
  }, [domandeCore, searchTerm]);

  // Paginazione
  const totalPages = Math.ceil(filteredQuizzes.length / itemsPerPage);
  const paginatedQuizzes = filteredQuizzes.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const startEdit = (quiz: any) => {
    setEditingQuizId(quiz.id);
    const data = JSON.parse(JSON.stringify(quiz));
    // Garantiamo che rispostaCorretta sia presente (fallback per legacy)
    if (data.rispostaCorretta === undefined && data.rispostaEsatta !== undefined) {
      data.rispostaCorretta = data.rispostaEsatta;
    }
    setEditForm(data);
  };

  const cancelEdit = () => {
    setEditingQuizId(null);
    setEditForm(null);
  };

  const handleSave = async () => {
    if (!editForm || !editingQuizId) return;
    setIsSaving(true);
    try {
      const quizRef = doc(db, 'domande_core', editingQuizId);
      // Validazione base
      if (!editForm.testo || editForm.opzioni.length < 2) throw new Error("Dati non validi");
      
      await updateDoc(quizRef, {
        testo: editForm.testo,
        opzioni: editForm.opzioni,
        rispostaCorretta: editForm.rispostaCorretta,
        spiegazione: editForm.spiegazione || null,
        fonte: editForm.fonte || null
      });

      // L'aggiornamento avverrà tramite il listener in tempo reale di QuizDataContext
      setEditingQuizId(null);
      setEditForm(null);
    } catch (e) {
      console.error("Errore salvataggio:", e);
      alert("Errore durante il salvataggio. Riprova.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>Editor Quiz (CMS)</h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0 }}>Modifica live delle banche dati nazionali ({domandeCore.length} elementi).</p>
        </div>
        
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input 
             type="text" 
             placeholder="Cerca per testo o ID..." 
             value={searchTerm}
             onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
             style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', borderRadius: '10px', background: '#1e293b', border: '1px solid #334155', color: '#fff', outline: 'none' }}
          />
        </div>
      </div>
      
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#0f172a', color: '#94a3b8' }}>
              <th style={{ padding: '1rem', borderBottom: '1px solid #334155' }}>ID Domanda</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid #334155' }}>Testo</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid #334155' }}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {paginatedQuizzes.map(q => (
              <tr key={q.id} style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '1.2rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'monospace' }}>
                  <span style={{ background: '#334155', padding: '0.2rem 0.6rem', borderRadius: '5px', fontSize: '0.8rem' }}>{q.id}</span>
                </td>
                <td style={{ padding: '1.2rem 1rem', maxWidth: '500px' }}>
                   <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}>{q.testo}</div>
                   {q.spiegazione && <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.spiegazione}</div>}
                </td>
                <td style={{ padding: '1.2rem 1rem' }}>
                  <button onClick={() => startEdit(q)} style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>
                    <Edit2 size={14} /> Edita
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Paginazione */}
        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a' }}>
          <button 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
            style={{ background: '#1e293b', border: '1px solid #334155', color: page === 1 ? '#64748b' : '#fff', padding: '0.5rem 1rem', borderRadius: '8px', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
          >Precedente</button>
          
          <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Pagina {page} di {totalPages > 0 ? totalPages : 1}</span>
          
          <button 
            disabled={page >= totalPages} 
            onClick={() => setPage(p => p + 1)}
            style={{ background: '#1e293b', border: '1px solid #334155', color: page >= totalPages ? '#64748b' : '#fff', padding: '0.5rem 1rem', borderRadius: '8px', cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
          >Successiva</button>
        </div>
      </div>

      {/* Editor Modale Sovraimposto */}
      {editingQuizId && editForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div style={{ background: '#1e293b', width: '100%', maxWidth: '800px', borderRadius: '20px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit2 size={20} color="#3b82f6" /> Modifica Quiz: <span style={{ fontFamily: 'monospace', color: '#94a3b8', fontSize: '1rem' }}>{editForm.id}</span>
              </h3>
              <button onClick={cancelEdit} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <div style={{ padding: '2rem', overflowY: 'auto' }}>
              <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>Testo Domanda</label>
              <textarea 
                value={editForm.testo}
                onChange={e => setEditForm({...editForm, testo: e.target.value})}
                style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '1rem', borderRadius: '10px', minHeight: '100px', resize: 'vertical', marginBottom: '1.5rem', outline: 'none' }}
              />

              <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>Opzioni e Risposta Esatta</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
                {editForm.opzioni.map((opz: string, index: number) => (
                  <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input 
                      type="radio" 
                      name="rispostaCorretta" 
                      checked={editForm.rispostaCorretta === index}
                      onChange={() => setEditForm({...editForm, rispostaCorretta: index})}
                      style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                    />
                    <input 
                      type="text" 
                      value={opz}
                      onChange={e => {
                        const nuoveOpzioni = [...editForm.opzioni];
                        nuoveOpzioni[index] = e.target.value;
                        setEditForm({...editForm, opzioni: nuoveOpzioni});
                      }}
                      style={{ flex: 1, background: '#0f172a', border: editForm.rispostaCorretta === index ? '1px solid #10b981' : '1px solid #334155', color: '#fff', padding: '0.8rem', borderRadius: '10px', outline: 'none' }}
                    />
                  </div>
                ))}
              </div>

              <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>Spiegazione (Opzionale - Aiuto)</label>
              <textarea 
                value={editForm.spiegazione || ""}
                onChange={e => setEditForm({...editForm, spiegazione: e.target.value})}
                placeholder="Riferimento normativo o hint logico..."
                style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '1rem', borderRadius: '10px', minHeight: '80px', resize: 'vertical', outline: 'none', marginBottom: '1.5rem' }}
              />

              <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>Fonte Ufficiale (Opzionale)</label>
              <input 
                type="text"
                value={editForm.fonte || ""}
                onChange={e => setEditForm({...editForm, fonte: e.target.value})}
                placeholder="Es. Roma Capitale"
                style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '1rem', borderRadius: '10px', outline: 'none' }}
              />
            </div>

            <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: '#0f172a', borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px' }}>
              <button 
                onClick={cancelEdit}
                style={{ background: 'transparent', border: '1px solid #334155', color: '#fff', padding: '0.8rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}
              >Annulla</button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                style={{ background: '#10b981', border: 'none', color: '#020617', padding: '0.8rem 1.5rem', borderRadius: '10px', cursor: isSaving ? 'wait' : 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Save size={18} /> {isSaving ? "Salvando su Cloud..." : "Salva nel Database"}
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
