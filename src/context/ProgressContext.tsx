import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  GlobalProgressSchema,
  LocalStorageProgressSchema,
  type GlobalProgress,
  type SRSItem,
  type ErroreLog,
  type RisultatoRisposta,
} from '../types/progressi';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { commitInChunks } from '../lib/firestoreHelpers';
import type { WriteBatch } from 'firebase/firestore';
// ===================================================
// Costanti
// ===================================================
const STORAGE_KEY = 'pl_progress_v2';
const XP_PER_RISPOSTA_CORRETTA = 10;
const XP_PER_QUIZ_COMPLETATO = 5;
const XP_PER_CAPITOLO = 15;
const XP_PER_LIVELLO = 500;
// Fuori dal componente — stabile, non ricreato ad ogni render
const DEFAULT_PROGRESS: GlobalProgress = {
  _schemaVersion: 1,
  quizCompletati: 0,
  risposteCorrette: 0,
  mediaPercentuale: 0,
  streak: 0,
  livello: 1,
  xp: 0,
  capitoliLetti: [],
  perCategoria: {},
  ultimoAccesso: new Date().toISOString(),
};
// ===================================================
// Interfaccia Context
// ===================================================
interface ProgressContextProps {
  progressiGlobali: GlobalProgress;
  srsData: Record<string, SRSItem>;
  erroriLog: Record<string, ErroreLog>;
  erroriCount: number;
  isLoading: boolean;
  salvaRisultatoQuiz: (risultati: RisultatoRisposta[]) => Promise<void>;
  segnaComeLetto: (capitoloId: string) => Promise<void>;
  resetErrori: () => Promise<void>;
}
const ProgressContext = createContext<ProgressContextProps | undefined>(undefined);
// ===================================================
// Provider
// ===================================================
export const ProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [progressiGlobali, setProgressiGlobali] = useState<GlobalProgress>(DEFAULT_PROGRESS);
  const [srsData, setSrsData] = useState<Record<string, SRSItem>>({});
  const [erroriLog, setErroriLog] = useState<Record<string, ErroreLog>>({});
  const [isLoading, setIsLoading] = useState(true);
  // ===================================================
  // 1. Persistenza — localStorage + Firestore
  // ===================================================
  const persistProgressData = useCallback(async (
    progress: GlobalProgress,
    srs: Record<string, SRSItem>,
    errori: Record<string, ErroreLog>,
    srsModificati: Set<string>,
    erroriModificati: Set<string>,
  ): Promise<void> => {
    // 1a. localStorage — sempre, anche offline
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        progressi: progress,
        srs,
        errori,
        _savedAt: new Date().toISOString(),
      }));
    } catch (e) {
      console.warn('Errore salvataggio localStorage:', e);
    }
    // 1b. Firestore — solo se autenticato
    if (!isAuthenticated || !user) return;
    try {
      const uid = user.uid;
      const operations: Array<(batch: WriteBatch) => void> = [];
      // Progressi scalari — sempre
      const progressRef = doc(db, 'users', uid, 'progressi', 'main');
      operations.push((batch) => {
        batch.set(progressRef, {
          ...progress,
          lastUpdated: new Date().toISOString(),
        }, { merge: true });
      });
      // SRS — solo le entry modificate
      srsModificati.forEach((domandaId) => {
        const item = srs[domandaId];
        if (item) {
          const ref = doc(db, 'users', uid, 'srsData', domandaId);
          operations.push((batch) => batch.set(ref, item, { merge: true }));
        }
      });
      // Errori — solo le entry modificate (o cancellate)
      erroriModificati.forEach((domandaId) => {
        const item = errori[domandaId];
        const ref = doc(db, 'users', uid, 'errori', domandaId);
        if (item) {
          operations.push((batch) => batch.set(ref, item, { merge: true }));
        } else {
          // count arrivato a 0 — cancella il documento
          operations.push((batch) => batch.delete(ref));
        }
      });
      await commitInChunks(operations);
    } catch (e) {
      console.error('Errore salvataggio Firestore:', e);
      // localStorage è già salvato — nessuna perdita dati
    }
  }, [isAuthenticated, user]);
  // ===================================================
  // 2. Boot — carica da Firestore o localStorage
  // ===================================================
  useEffect(() => {
    let active = true;
    const caricaDati = async () => {
      setIsLoading(true);
      // Utente non loggato — usa default
      if (!isAuthenticated || !user) {
        if (active) {
          setProgressiGlobali(DEFAULT_PROGRESS);
          setSrsData({});
          setErroriLog({});
          setIsLoading(false);
        }
        return;
      }
      try {
        const uid = user.uid;
        // 2a. Progressi scalari
        const progressDoc = await getDoc(doc(db, 'users', uid, 'progressi', 'main'));
        let progress = DEFAULT_PROGRESS;
        if (progressDoc.exists()) {
          const parsed = GlobalProgressSchema.safeParse(progressDoc.data());
          if (parsed.success) {
            progress = parsed.data;
          } else {
            console.warn('Progressi Firestore non validi:', parsed.error.issues);
          }
        }
        // 2b. SRS — subcollection
        const srs: Record<string, SRSItem> = {};
        const srsSnap = await getDocs(collection(db, 'users', uid, 'srsData'));
        srsSnap.forEach((docSnap) => {
          const data = docSnap.data() as SRSItem;
          if (data?.domandaId) srs[docSnap.id] = data;
        });
        // 2c. Errori — subcollection
        const errori: Record<string, ErroreLog> = {};
        const erroriSnap = await getDocs(collection(db, 'users', uid, 'errori'));
        erroriSnap.forEach((docSnap) => {
          const data = docSnap.data() as ErroreLog;
          if (data?.domandaId) errori[docSnap.id] = data;
        });
        if (!active) return;
        setProgressiGlobali(progress);
        setSrsData(srs);
        setErroriLog(errori);
        // Aggiorna cache locale
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          progressi: progress, srs, errori,
          _savedAt: new Date().toISOString(),
        }));
      } catch (e) {
        console.warn('Errore caricamento Firestore, fallback a localStorage:', e);
        // Fallback localStorage — validato con Zod
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored && active) {
            const raw = JSON.parse(stored);
            const result = LocalStorageProgressSchema.safeParse(raw);
            if (result.success) {
              setProgressiGlobali(result.data.progressi);
              setSrsData(result.data.srs);
              setErroriLog(result.data.errori);
            } else {
              console.warn('Cache localStorage corrotta, reset a default');
              localStorage.removeItem(STORAGE_KEY);
              setProgressiGlobali(DEFAULT_PROGRESS);
            }
          }
        } catch {
          localStorage.removeItem(STORAGE_KEY);
          if (active) setProgressiGlobali(DEFAULT_PROGRESS);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    caricaDati();
    return () => { active = false; };
  }, [user, isAuthenticated]);
  // ===================================================
  // 3. salvaRisultatoQuiz
  // ===================================================
  const salvaRisultatoQuiz = useCallback(async (risultatiList: RisultatoRisposta[]): Promise<void> => {
    if (risultatiList.length === 0) return;
    // 3a. Deep copy sicura — NO mutation dello stato
    const updatedProgress: GlobalProgress = {
      ...progressiGlobali,
      perCategoria: Object.fromEntries(
        Object.entries(progressiGlobali.perCategoria).map(
          ([key, val]) => [key, { ...val }]
        )
      ),
    };
    // 3b. Contatori quiz
    updatedProgress.quizCompletati += 1;
    let totCorretteInTurn = 0;
    // 3c. Aggiorna perCategoria e SRS/Errori
    const updatedSrs = { ...srsData };
    const updatedErrori = { ...erroriLog };
    const srsModificati = new Set<string>();
    const erroriModificati = new Set<string>();
    risultatiList.forEach((ris) => {
      const catId = ris.categoriaId;
      // perCategoria — deep copy per categoria
      const cat = updatedProgress.perCategoria[catId] ?? { fatte: 0, corrette: 0 };
      updatedProgress.perCategoria[catId] = {
        fatte: cat.fatte + 1,
        corrette: cat.corrette + (ris.corretta ? 1 : 0),
      };
      if (ris.corretta) totCorretteInTurn++;
      const domandaId = ris.domandaId;
      
      // 🆕 Se la risposta è omessa (-1), non aggiornare SRS né il registro errori
      if (ris.indiceRispostaScelta === -1) return;

      if (ris.corretta) {
        // SRS — risposta corretta: incrementa interval e easeFactor
        const existing = updatedSrs[domandaId];
        const consecutiveCorrect = (existing?.consecutiveCorrect ?? 0) + 1;
        const easeFactor = Math.min(5.0, (existing?.easeFactor ?? 2.5) + 0.1);
        const interval = Math.round((existing?.interval ?? 1) * easeFactor);
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + interval);
        updatedSrs[domandaId] = {
          domandaId,
          easeFactor,
          interval,
          nextReview: nextReview.toISOString(),
          consecutiveCorrect,
        };
        srsModificati.add(domandaId);
        // Errori — se era in errore, decrementa
        if (updatedErrori[domandaId]) {
          const newCount = updatedErrori[domandaId].count - 1;
          if (newCount <= 0) {
            delete updatedErrori[domandaId];
          } else {
            updatedErrori[domandaId] = { ...updatedErrori[domandaId], count: newCount };
          }
          erroriModificati.add(domandaId);
        }
      } else {
        // SRS — risposta errata: reset consecutiveCorrect, riduci easeFactor
        const existing = updatedSrs[domandaId];
        const easeFactor = Math.max(1.3, (existing?.easeFactor ?? 2.5) - 0.2);
        updatedSrs[domandaId] = {
          domandaId,
          easeFactor,
          interval: 1,
          nextReview: new Date().toISOString(),
          consecutiveCorrect: 0,
        };
        srsModificati.add(domandaId);
        // Errori — aggiungi o incrementa
        const existingErr = updatedErrori[domandaId];
        updatedErrori[domandaId] = {
          domandaId,
          count: (existingErr?.count ?? 0) + 1,
          lastError: new Date().toISOString(),
          indiceRispostaScelta: ris.indiceRispostaScelta,
        };
        erroriModificati.add(domandaId);
      }
    });
    // 3d. Aggiorna contatori globali
    updatedProgress.risposteCorrette += totCorretteInTurn;
    // 3e. Ricalcola mediaPercentuale
    const totFatte = Object.values(updatedProgress.perCategoria).reduce((s, c) => s + c.fatte, 0);
    const totCorrette = Object.values(updatedProgress.perCategoria).reduce((s, c) => s + c.corrette, 0);
    updatedProgress.mediaPercentuale = totFatte > 0 ? Math.round((totCorrette / totFatte) * 100) : 0;
    // 3f. Aggiorna streak
    const oggi = new Date().toDateString();
    const ultimoAccesso = new Date(progressiGlobali.ultimoAccesso).toDateString();
    const ieri = new Date(Date.now() - 86_400_000).toDateString();
    if (ultimoAccesso === oggi) {
      // già studiato oggi — streak invariato
    } else if (ultimoAccesso === ieri) {
      updatedProgress.streak += 1;
    } else {
      updatedProgress.streak = 1;
    }
    // 3g. Aggiorna XP e livello
    updatedProgress.xp += (totCorretteInTurn * XP_PER_RISPOSTA_CORRETTA) + XP_PER_QUIZ_COMPLETATO;
    updatedProgress.livello = Math.floor(updatedProgress.xp / XP_PER_LIVELLO) + 1;
    // 3h. Timestamp
    updatedProgress.ultimoAccesso = new Date().toISOString();
    // 3i. Aggiorna stato React
    setProgressiGlobali(updatedProgress);
    setSrsData(updatedSrs);
    setErroriLog(updatedErrori);
    // 3j. Persisti
    await persistProgressData(updatedProgress, updatedSrs, updatedErrori, srsModificati, erroriModificati);
  }, [progressiGlobali, srsData, erroriLog, persistProgressData]);

  // ===================================================
  // 5. resetErrori
  // ===================================================
  const resetErrori = useCallback(async (): Promise<void> => {
    setErroriLog({});
    await persistProgressData(
      progressiGlobali,
      srsData,
      {},
      new Set(),
      new Set(Object.keys(erroriLog))
    );
  }, [progressiGlobali, srsData, erroriLog, persistProgressData]);
  // ===================================================
  // 4. segnaComeLetto
  // ===================================================
  const segnaComeLetto = useCallback(async (capitoloId: string): Promise<void> => {
    // Idempotente — se già letto, non fare nulla
    if (progressiGlobali.capitoliLetti?.includes(capitoloId)) return;
    const updatedProgress: GlobalProgress = {
      ...progressiGlobali,
      capitoliLetti: [...(progressiGlobali.capitoliLetti ?? []), capitoloId],
      xp: progressiGlobali.xp + XP_PER_CAPITOLO,
      ultimoAccesso: new Date().toISOString(),
    };
    updatedProgress.livello = Math.floor(updatedProgress.xp / XP_PER_LIVELLO) + 1;
    setProgressiGlobali(updatedProgress);
    await persistProgressData(
      updatedProgress,
      srsData,
      erroriLog,
      new Set(),
      new Set(),
    );
  }, [progressiGlobali, srsData, erroriLog, persistProgressData]);
  // ===================================================
  // 5. Context value
  // ===================================================
  const erroriCount = Object.keys(erroriLog).length;
  return (
    <ProgressContext.Provider value={{
      progressiGlobali,
      srsData,
      erroriLog,
      erroriCount,
      isLoading,
      salvaRisultatoQuiz,
      segnaComeLetto,
      resetErrori,
    }}>
      {children}
    </ProgressContext.Provider>
  );
};
export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
