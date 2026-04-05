import { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { db } from '../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { FileText, Play, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

// Percorso relativo in public/
const PDF_PATH = '/Banca-Dati-Concorso-800-Istruttori-Polizia-Locale-Roma-Capitale-2023.pdf';

export default function PdfIngestor() {
  const [status, setStatus] = useState<'idle' | 'parsing' | 'uploading' | 'completed' | 'error'>('idle');
  const [log, setLog] = useState<string[]>([]);
  const [resultsCount, setResultsCount] = useState(0);

  // Inizializzazione Worker in useEffect per stabilità in Vite
  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }, []);

  const addLog = (msg: string) => setLog(prev => [...prev, msg].slice(-10));

  const startIngestion = async () => {
    setStatus('parsing');
    setLog(['Avvio caricamento PDF...', `Percorso: ${PDF_PATH}`]);
    
    try {
      const loadingTask = pdfjsLib.getDocument(PDF_PATH);
      const pdf = await loadingTask.promise;
      addLog(`PDF Caricato. Pagine: ${pdf.numPages}`);

      let fullText = "";
      const maxPages = Math.min(5, pdf.numPages);
      
      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + "\n";
        addLog(`Letta pagina ${i}...`);
      }

      // Regex migliorata per catturare domande e opzioni
      const quizRegex = /(\d+)\.\s+(.+?)\s+A\)\s+(.+?)\s+B\)\s+(.+?)\s+C\)\s+(.+?)\s+Risposta\s+esatta:\s+([ABC])/gi;
      
      const matches = [...fullText.matchAll(quizRegex)];
      addLog(`Trovati ${matches.length} quiz potenziali.`);

      if (matches.length === 0) {
        throw new Error("Nessun quiz trovato con il pattern Regex. Verifica la struttura del PDF.");
      }

      setStatus('uploading');
      let count = 0;
      const testLimit = matches.slice(0, 10);

      for (const match of testLimit) {
        const [_, idNum, testo, opzA, opzB, opzC, corretta] = match;
        const correttaIndex = corretta.toUpperCase() === 'A' ? 0 : corretta.toUpperCase() === 'B' ? 1 : 2;

        await addDoc(collection(db, 'bozze_aggiornamenti'), {
          tipo: 'NEW_IMPORT',
          domandaOriginaleId: `ROMA-2023-${idNum}`,
          motivoVariazione: 'Importazione massiva Banca Dati Roma Capitale 2023 (PDF)',
          fonte: 'Roma Capitale',
          nuovaDomanda: {
            testo: testo.trim(),
            opzioni: [opzA.trim(), opzB.trim(), opzC.trim(), "Nessuna delle precedenti"],
            rispostaEsatta: correttaIndex,
            spiegazione: `Quiz estratto dalla banca dati ufficiale del concorso Roma Capitale 2023.`,
            categoriaId: 'com_generale',
            livelloDifficolta: 2
          }
        });
        count++;
        setResultsCount(count);
      }

      setStatus('completed');
      addLog("Importazione test completata con successo!");
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      addLog(`ERRORE: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <FileText color="#3b82f6" /> Ingestore PDF Cyborg
        </h2>
        <p style={{ color: '#94a3b8' }}>Modulo per il parsing rapido delle banche dati ufficiali direttamente in Inbox.</p>
      </header>

      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', textAlign: 'center' }}>
        {status === 'idle' && (
          <>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '2rem', borderRadius: '50%', color: '#3b82f6' }}>
              <FileText size={64} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>File Rilevato</h3>
              <code>Roma-Capitale-2023.pdf</code>
            </div>
            <button 
              onClick={startIngestion}
              style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '1rem 2.5rem', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.8rem' }}
            >
              <Play size={20} /> Avvia Parsing (Primi 10 Quiz)
            </button>
          </>
        )}

        {(status === 'parsing' || status === 'uploading') && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Loader2 size={48} color="#3b82f6" style={{ animation: 'spin 2s linear infinite' }} />
            <h3>{status === 'parsing' ? 'Leggendo il PDF...' : `Invio a Inbox... (${resultsCount})`}</h3>
          </div>
        )}

        {status === 'completed' && (
          <>
            <CheckCircle size={48} color="#10b981" />
            <h3>Importazione Iniziale Terminata!</h3>
            <p>Ho inviato {resultsCount} quiz alla tua <strong>Cyborg Inbox</strong>. Vai lì per verificarli e pubblicarli.</p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle size={48} color="#ef4444" />
            <h3>Si è verificato un errore</h3>
            <p style={{ color: '#ef4444' }}>Controlla la console o i log sottostanti.</p>
          </>
        )}

        <div style={{ width: '100%', background: '#0f172a', padding: '1rem', borderRadius: '12px', textAlign: 'left', fontFamily: 'monospace', fontSize: '0.85rem', color: '#64748b', border: '1px solid #334155' }}>
          {log.map((l, i) => <div key={i}> {'>'} {l}</div>)}
        </div>
      </div>
    </div>
  );
}
