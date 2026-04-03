import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { 
  GlobalProgressSchema, 
  LocalStorageProgressSchema,
  type GlobalProgress, 
  type SRSItem, 
  type ErroreLog, 
  type RisultatoRisposta 
} from '../types/progressi';
import { db } from '../firebase';
import { doc, getDoc, writeBatch, collection, getDocs, deleteField, arrayUnion, increment, updateDoc, deleteDoc, type Firestore, type WriteBatch } from 'firebase/firestore';

interface ProgressContextProps {
  progressiGlobali: GlobalProgress | null;
  srsData: Record<string, SRSItem>;
  erroriLog: Record<string, ErroreLog>;
  erroriCount: number;
  isLoading: boolean;
  salvaRisultatoQuiz: (risultati: RisultatoRisposta[]) => Promise<void>;
  segnaComeLetto: (capitoloId: string) => Promise<void>;
  rimuoviErrore: (domandaId: string) => Promise<void>;
  aggiungiErrore: (domandaId: string, rispostaErrata: number) => Promise<void>;
}

const ProgressContext = createContext<ProgressContextProps | undefined>(undefined);

const STORAGE_KEY = 'pl_progress_offline_cache';

const DEFAULT_PROGRESS: GlobalProgress = {
  quizCompletati: 0,
  risposteCorrette: 0,
  mediaPercentuale: 0,
  streak: 0,
  livello: 1,
  xp: 0,
  capitoliLetti: [],
  perCategoria: {},
  ultimoAccesso: new Date().toISOString()
};

/**
 * ✅ Helper universale per eseguire batch di scrittura Firestore in blocchi (chunking).
 * Risolve il limite di 500 operazioni per batch.
 */
async function commitInChunks(
  db: Firestore,
  operations: Array<(batch: WriteBatch) => void>,
  chunkSize = 490
) {
  for (let i = 0; i < operations.length; i += chunkSize) {
    const batch = writeBatch(db);
    operations.slice(i, i + chunkSize).forEach(op => op(batch));
    await batch.commit();
  }
}

export const ProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [progressiGlobali, setProgressiGlobali] = useState<GlobalProgress | null>(null);
  const [srsData, setSrsData] = useState<Record<string, SRSItem>>({});
  const [erroriLog, setErroriLog] = useState<Record<string, ErroreLog>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Derivazione del conteggio errori
  const erroriCount = useMemo(() => Object.keys(erroriLog).length, [erroriLog]);

  // 1. Idratazione da Firebase o Cache
  useEffect(() => {
    let active = true;

    const caricaDati = async () => {
      setIsLoading(true);

      if (!isAuthenticated || !user) {
        setProgressiGlobali(DEFAULT_PROGRESS);
        setIsLoading(false);
        return;
      }

      try {
        const mainRef = doc(db, 'users', user.uid, 'progressi', 'main');
        const mainSnap = await getDoc(mainRef);

        let currentProgress = DEFAULT_PROGRESS;
        let currentSrs: Record<string, SRSItem> = {};
        let currentErrori: Record<string, ErroreLog> = {};

        if (mainSnap.exists()) {
          const data = mainSnap.data();
          const result = GlobalProgressSchema.safeParse(data);
          
          if (result.success) {
              currentProgress = result.data;
              if (data.srs || data.errori) {
                  console.log("Dati embedded rilevati nel documento main. Avvio migrazione...");
                  currentSrs = data.srs || {};
                  currentErrori = data.errori || {};
                  await persistProgressData(currentProgress, currentSrs, currentErrori, true);
              }
          }
        } else {
            const legacyRef = doc(db, 'users', user.uid);
            const legacySnap = await getDoc(legacyRef);
            if (legacySnap.exists()) {
                const legacyData = legacySnap.data();
                const result = GlobalProgressSchema.safeParse(legacyData.progressi);
                if (result.success) {
                    currentProgress = result.data;
                    currentSrs = legacyData.srs || {};
                    currentErrori = legacyData.errori || {};
                    await persistProgressData(currentProgress, currentSrs, currentErrori, true);
                }
            }
        }

        const [srsSnap, erroriSnap] = await Promise.all([
            getDocs(collection(db, 'users', user.uid, 'srsData')),
            getDocs(collection(db, 'users', user.uid, 'errori'))
        ]);

        const srsMap: Record<string, SRSItem> = { ...currentSrs };
        srsSnap.forEach(doc => { 
            const data = doc.data() as any;
            srsMap[doc.id] = {
                ...data,
                consecutiveCorrect: data.consecutiveCorrect ?? data.streak ?? 0
            } as SRSItem;
        });

        const erroriMap: Record<string, ErroreLog> = { ...currentErrori };
        erroriSnap.forEach(doc => { 
            const data = doc.data() as any;
            erroriMap[doc.id] = {
                ...data,
                indiceRispostaScelta: data.indiceRispostaScelta ?? data.rispostaData ?? 0
            } as ErroreLog;
        });

        if (active) {
            setProgressiGlobali(currentProgress);
            setSrsData(srsMap);
            setErroriLog(erroriMap);
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                progressi: currentProgress,
                srs: srsMap,
                errori: erroriMap
            }));
        }

      } catch (e) {
        console.error("Errore fetch Firebase Progress:", e);
        if (active) {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                try {
                    const raw = JSON.parse(stored);
                    const result = LocalStorageProgressSchema.safeParse(raw);
                    
                    if (result.success) {
                        setProgressiGlobali(result.data.progressi);
                        setSrsData(result.data.srs);
                        setErroriLog(result.data.errori);
                    } else {
                        console.warn('Cache localStorage corrotta o obsoleta, uso default');
                        localStorage.removeItem(STORAGE_KEY);
                        setProgressiGlobali(DEFAULT_PROGRESS);
                    }
                } catch {
                    localStorage.removeItem(STORAGE_KEY);
                    setProgressiGlobali(DEFAULT_PROGRESS);
                }
            } else {
                setProgressiGlobali(DEFAULT_PROGRESS);
            }
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    caricaDati();
    return () => { active = false; };
  }, [user, isAuthenticated]);

  const persistProgressData = async (
      progress: GlobalProgress, 
      srs: Record<string, SRSItem>, 
      errori: Record<string, ErroreLog>,
      cleanMainDoc: boolean = false
  ) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ progressi: progress, srs, errori }));
    } catch (e) { console.warn('Errore localStorage backup:', e); }

    if (!isAuthenticated || !user) return;

    try {
      const operations: Array<(batch: WriteBatch) => void> = [];
      const mainRef = doc(db, 'users', user.uid, 'progressi', 'main');

      const mainData: any = { ...progress, lastUpdated: new Date().toISOString() };
      if (cleanMainDoc) {
          mainData.srs = deleteField();
          mainData.errori = deleteField();
      }
      operations.push((batch) => batch.set(mainRef, mainData, { merge: true }));

      for (const [id, val] of Object.entries(srs)) {
          const ref = doc(db, 'users', user.uid, 'srsData', id);
          operations.push((batch) => batch.set(ref, val, { merge: true }));
      }

      for (const [id, val] of Object.entries(errori)) {
          const ref = doc(db, 'users', user.uid, 'errori', id);
          operations.push((batch) => batch.set(ref, val, { merge: true }));
      }

      await commitInChunks(db, operations);

    } catch (e) {
      console.error("Errore salvataggio Firebase (Sub-collections):", e);
    }
  };

  const salvaRisultatoQuiz = async (risultatiList: RisultatoRisposta[]) => {
    if (!progressiGlobali) return;

    const updatedProgress: GlobalProgress = { 
        ...progressiGlobali,
        quizCompletati: progressiGlobali.quizCompletati + 1,
        perCategoria: { ...progressiGlobali.perCategoria }
    };

    const updatedSrs = { ...srsData };
    const updatedErrori = { ...erroriLog };
    
    const oggi = new Date().toDateString();
    const ultimoAccessoDate = new Date(progressiGlobali.ultimoAccesso).toDateString();
    const ieri = new Date(Date.now() - 86400000).toDateString();
    if (ultimoAccessoDate !== oggi) {
        updatedProgress.streak = (ultimoAccessoDate === ieri) ? updatedProgress.streak + 1 : 1;
    }
    
    let totCorretteInTurn = 0;

    risultatiList.forEach((ris) => {
      const { domandaId, categoriaId, corretta, indiceRispostaScelta } = ris;
      
      const prevCat = updatedProgress.perCategoria[categoriaId] || { fatte: 0, corrette: 0 };
      updatedProgress.perCategoria[categoriaId] = {
          fatte: prevCat.fatte + 1,
          corrette: prevCat.corrette + (corretta ? 1 : 0)
      };
      
      if (corretta) {
        totCorretteInTurn += 1;
        // Se corretta, rimuoviamo l'errore se presente (centralizzazione logica)
        delete updatedErrori[domandaId];
      } else {
          updatedErrori[domandaId] = {
              domandaId,
              count: (updatedErrori[domandaId]?.count || 0) + 1,
              lastError: new Date().toISOString(),
              indiceRispostaScelta
          };
      }

      const prevSRS = updatedSrs[domandaId] || { 
          domandaId, 
          easeFactor: 2.5, 
          interval: 1, 
          nextReview: new Date().toISOString(), 
          consecutiveCorrect: 0 
      };

      let newConsecutive = corretta ? prevSRS.consecutiveCorrect + 1 : 0;
      let newInterval = corretta ? Math.max(1, Math.round(prevSRS.interval * prevSRS.easeFactor)) : 1;
      
      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

      updatedSrs[domandaId] = {
          ...prevSRS,
          consecutiveCorrect: newConsecutive,
          interval: newInterval,
          nextReview: nextReviewDate.toISOString()
      };
    });

    updatedProgress.risposteCorrette += totCorretteInTurn;

    const XP_PER_RISPOSTA_CORRETTA = 10;
    const XP_PER_QUIZ_COMPLETATO = 5;
    const XP_PER_LIVELLO = 500;
    updatedProgress.xp += (totCorretteInTurn * XP_PER_RISPOSTA_CORRETTA) + XP_PER_QUIZ_COMPLETATO;
    updatedProgress.livello = Math.floor(updatedProgress.xp / XP_PER_LIVELLO) + 1;

    const statsArray = Object.values(updatedProgress.perCategoria);
    const totFatte = statsArray.reduce((acc, cat) => acc + cat.fatte, 0);
    const totCorrette = statsArray.reduce((acc, cat) => acc + cat.corrette, 0);
    updatedProgress.mediaPercentuale = totFatte > 0 ? Math.round((totCorrette / totFatte) * 100) : 0;
    updatedProgress.ultimoAccesso = new Date().toISOString();

    setProgressiGlobali(updatedProgress);
    setSrsData(updatedSrs);
    setErroriLog(updatedErrori);
    await persistProgressData(updatedProgress, updatedSrs, updatedErrori);
  };

  const segnaComeLetto = async (capitoloId: string) => {
    if (!progressiGlobali || !isAuthenticated || !user) return;
    if (progressiGlobali.capitoliLetti?.includes(capitoloId)) return;
    const isoNow = new Date().toISOString();
    const updatedProgress = { ...progressiGlobali };
    if (!updatedProgress.capitoliLetti) updatedProgress.capitoliLetti = [];
    updatedProgress.capitoliLetti.push(capitoloId);
    updatedProgress.xp += 15;
    updatedProgress.ultimoAccesso = isoNow;
    setProgressiGlobali(updatedProgress);
    try {
        const mainRef = doc(db, 'users', user.uid, 'progressi', 'main');
        await updateDoc(mainRef, {
            capitoliLetti: arrayUnion(capitoloId),
            xp: increment(15),
            ultimoAccesso: isoNow
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ progressi: updatedProgress, srs: srsData, errori: erroriLog }));
    } catch (e) { console.error("Errore atomico segnaComeLetto:", e); }
  };

  const rimuoviErrore = async (domandaId: string) => {
    if (!isAuthenticated || !user) return;
    const newErrori = { ...erroriLog };
    delete newErrori[domandaId];
    setErroriLog(newErrori);
    
    // Aggiornamento cache locale
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ progressi: progressiGlobali, srs: srsData, errori: newErrori }));
    
    try {
        const errorRef = doc(db, 'users', user.uid, 'errori', domandaId);
        await deleteDoc(errorRef);
    } catch (e) { console.error("Errore rimozione errore Firestore:", e); }
  };

  const aggiungiErrore = async (domandaId: string, rispostaErrata: number) => {
      if (!isAuthenticated || !user) return;
      const newErrori = { ...erroriLog };
      const current = newErrori[domandaId] || { domandaId, count: 0, lastError: '', indiceRispostaScelta: rispostaErrata };
      
      const updatedEntry: ErroreLog = {
          ...current,
          count: current.count + 1,
          lastError: new Date().toISOString(),
          indiceRispostaScelta: rispostaErrata
      };
      
      newErrori[domandaId] = updatedEntry;
      setErroriLog(newErrori);

      localStorage.setItem(STORAGE_KEY, JSON.stringify({ progressi: progressiGlobali, srs: srsData, errori: newErrori }));

      try {
          const errorRef = doc(db, 'users', user.uid, 'errori', domandaId);
          await updateDoc(errorRef, updatedEntry);
      } catch (e) {
          // Se non esiste, updateDoc fallisce, proviamo con setDoc tramite persistProgressData o diretto
          const errorRef = doc(db, 'users', user.uid, 'errori', domandaId);
          await updateDoc(errorRef, { ...updatedEntry } as any).catch(async () => {
             // Fallback setDoc se non esiste (Firestore updateDoc richiede esistenza)
             const { setDoc } = await import('firebase/firestore');
             await setDoc(errorRef, updatedEntry);
          });
      }
  };

  return (
    <ProgressContext.Provider value={{ 
        progressiGlobali, 
        srsData, 
        erroriLog, 
        erroriCount, 
        isLoading, 
        salvaRisultatoQuiz, 
        segnaComeLetto,
        rimuoviErrore,
        aggiungiErrore
    }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
    const context = useContext(ProgressContext);
    if (context === undefined) throw new Error('useProgress must be used within a ProgressProvider');
    return context;
};
