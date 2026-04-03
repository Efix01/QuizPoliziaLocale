import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { 
  GlobalProgressSchema, 
  SRSItemSchema,
  ErroreLogSchema,
  LocalStorageProgressSchema,
  type GlobalProgress, 
  type SRSItem, 
  type ErroreLog, 
  type RisultatoRisposta 
} from '../types/progressi';
import { db } from '../firebase';
import { 
  doc, 
  getDoc, 
  collection, 
  getDocs, 
  deleteField, 
  arrayUnion, 
  increment, 
  updateDoc, 
  type WriteBatch 
} from 'firebase/firestore';
import { commitInChunks } from '../lib/firestoreHelpers';
import { migrateProgressV1toV2 } from '../lib/migrateProgressV1toV2';

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

const STORAGE_KEY = 'pl_progress_v2';




export const ProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [progressiGlobali, setProgressiGlobali] = useState<GlobalProgress | null>(null);
  const [srsData, setSrsData] = useState<Record<string, SRSItem>>({});
  const [erroriLog, setErroriLog] = useState<Record<string, ErroreLog>>({});
  const [isLoading, setIsLoading] = useState(true);

  const [srsModificati, setSrsModificati] = useState<Set<string>>(new Set());
  const [erroriModificati, setErroriModificati] = useState<Set<string>>(new Set());

  // Helper per tracciamento modifiche
  const tracciaSrs = (id: string, item: SRSItem) => {
    setSrsData(prev => ({ ...prev, [id]: item }));
    setSrsModificati(prev => new Set(prev).add(id));
  };

  const tracciaErrore = (id: string, item: ErroreLog | null) => {
    setErroriLog(prev => {
      const next = { ...prev };
      if (!item) delete next[id];
      else next[id] = item;
      return next;
    });
    setErroriModificati(prev => new Set(prev).add(id));
  };

  // Derivazione del conteggio errori
  const erroriCount = useMemo(() => Object.keys(erroriLog).length, [erroriLog]);

  /**
   * Helper: Carica progressi da Firestore (subcollection) con fallback localStorage.
   * Include logica di migrazione atomica v1 -> v2.
   */
  const loadProgressData = async (): Promise<{
    progress: GlobalProgress;
    srs: Record<string, SRSItem>;
    errori: Record<string, ErroreLog>;
  }> => {
    const uid = user?.uid;
    if (!uid) return { progress: DEFAULT_PROGRESS, srs: {}, errori: {} };

    try {
      // 1. Progressi scalari (main doc)
      const mainRef = doc(db, 'users', uid, 'progressi', 'main');
      const mainSnap = await getDoc(mainRef);

      let progress = DEFAULT_PROGRESS;
      if (mainSnap.exists()) {
        const parsed = GlobalProgressSchema.safeParse(mainSnap.data());
        if (parsed.success) progress = parsed.data;
      }

      // 2. Caricamento Sub-collections (SRS + Errori)
      const [srsSnap, erroriSnap] = await Promise.all([
        getDocs(collection(db, 'users', uid, 'srsData')),
        getDocs(collection(db, 'users', uid, 'errori'))
      ]);

      const srs: Record<string, SRSItem> = {};
      srsSnap.forEach(snap => {
        const parsed = SRSItemSchema.safeParse(snap.data());
        if (parsed.success) srs[snap.id] = parsed.data;
      });

      const errori: Record<string, ErroreLog> = {};
      erroriSnap.forEach(snap => {
        const parsed = ErroreLogSchema.safeParse(snap.data());
        if (parsed.success) errori[snap.id] = parsed.data;
      });

      return { progress, srs, errori };
    } catch (e) {
      console.warn('Errore Firestore, uso localStorage:', e);
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const raw = JSON.parse(stored);
        const res = LocalStorageProgressSchema.safeParse(raw.progressi ? { ...raw, srs: raw.srs || {}, errori: raw.errori || {} } : raw);
        if (res.success) return { progress: res.data.progressi, srs: res.data.srs, errori: res.data.errori };
      }
      return { progress: DEFAULT_PROGRESS, srs: {}, errori: {} };
    }
  };

  // 1. Idratazione da Firebase o Cache
  useEffect(() => {
    let active = true;

    async function boot() {
      setIsLoading(true);
      try {
        // 1. Migrazione atomica (one-time check)
        if (isAuthenticated && user) {
          await migrateProgressV1toV2(db, user.uid);
        }

        // 2. Caricamento dati puliti
        const { progress, srs, errori } = await loadProgressData();
        if (!active) return;

        setProgressiGlobali(progress);
        setSrsData(srs);
        setErroriLog(errori);
      } catch (e) {
        console.error('Errore boot progressi:', e);
        if (active) setProgressiGlobali(DEFAULT_PROGRESS);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    boot();
    return () => { active = false; };
  }, [user, isAuthenticated]);

  /**
   * Salva progressi su localStorage + Firestore (subcollection).
   * 
   * - /users/{uid}/progressi/main       → solo dati scalari
   * - /users/{uid}/srsData/{domandaId}   → un doc per domanda
   * - /users/{uid}/errori/{domandaId}    → un doc per domanda
   */
  const persistProgressData = async (
    progress: GlobalProgress,
    srs: Record<string, SRSItem>,
    errori: Record<string, ErroreLog>,
    srsModificatiOverride?: Set<string>,
    erroriModificatiOverride?: Set<string>
  ): Promise<void> => {

    // === 1. localStorage (sempre, anche offline) ===
    try {
      const toStore = {
        progressi: progress,
        srs,
        errori,
        _savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (e) {
      console.warn('Errore salvataggio localStorage:', e);
    }

    // === 2. Firestore (solo se autenticato) ===
    if (!isAuthenticated || !user) return;

    try {
      const uid = user.uid;
      const operations: Array<(batch: WriteBatch) => void> = [];

      // 2a. Documento progressi — SOLO dati scalari, NO srs/errori
      const progressRef = doc(db, 'users', uid, 'progressi', 'main');
      operations.push((batch) => {
        batch.set(progressRef, {
          ...progress,
          lastUpdated: new Date().toISOString(),
          // Forza la rimozione di eventuali dati legacy nel documento main
          srs: deleteField(),
          errori: deleteField()
        }, { merge: true });
      });

      // 2b. SRS — Solo modificati
      const srsTargetIds = srsModificatiOverride || srsModificati;
      srsTargetIds.forEach((domandaId) => {
        const srsItem = srs[domandaId];
        if (!srsItem) return;
        const ref = doc(db, 'users', uid, 'srsData', domandaId);
        operations.push((batch) => batch.set(ref, srsItem, { merge: true }));
      });

      // 2c. Errori — Solo modificati
      const erroriTargetIds = erroriModificatiOverride || erroriModificati;
      erroriTargetIds.forEach((domandaId) => {
        const errore = errori[domandaId];
        const ref = doc(db, 'users', uid, 'errori', domandaId);
        if (!errore) {
          operations.push((batch) => batch.delete(ref));
        } else {
          operations.push((batch) => batch.set(ref, errore, { merge: true }));
        }
      });

      // 2d. Commit e Reset tracking
      await commitInChunks(db, operations);
      setSrsModificati(new Set());
      setErroriModificati(new Set());

    } catch (e) {
      console.error('Errore salvataggio Firestore:', e);
      // localStorage è già salvato — l'utente non perde dati
    }
  };

  const salvaRisultatoQuiz = async (risultatiList: RisultatoRisposta[]): Promise<void> => {
    if (risultatiList.length === 0 || !progressiGlobali) return;

    // === 1. Deep copy sicura (NO mutation dello stato) ===
    const updatedProgress: GlobalProgress = {
      ...progressiGlobali,
      perCategoria: Object.fromEntries(
        Object.entries(progressiGlobali.perCategoria).map(
          ([key, val]) => [key, { ...val }] // copia ogni CategoriaStats
        )
      ),
    };

    // === 2. Aggiorna quiz completati ===
    updatedProgress.quizCompletati += 1;

    // === 3. Aggiorna perCategoria (senza mutation) ===
    let totCorretteInTurn = 0;

    risultatiList.forEach((ris) => {
      const catId = ris.categoriaId;

      // Se la categoria non esiste ancora, creala
      if (!updatedProgress.perCategoria[catId]) {
        updatedProgress.perCategoria[catId] = { fatte: 0, corrette: 0 };
      }

      updatedProgress.perCategoria[catId] = {
        fatte: updatedProgress.perCategoria[catId].fatte + 1,
        corrette: updatedProgress.perCategoria[catId].corrette + (ris.corretta ? 1 : 0),
      };

      if (ris.corretta) totCorretteInTurn++;
    });

    // === 4. Aggiorna risposteCorrette globali ===
    updatedProgress.risposteCorrette += totCorretteInTurn;

    // === 5. Ricalcola mediaPercentuale ===
    const totFatte = Object.values(updatedProgress.perCategoria)
      .reduce((sum, cat) => sum + cat.fatte, 0);
    const totCorrette = Object.values(updatedProgress.perCategoria)
      .reduce((sum, cat) => sum + cat.corrette, 0);

    updatedProgress.mediaPercentuale = totFatte > 0
      ? Math.round((totCorrette / totFatte) * 100)
      : 0;

    // === 6. Aggiorna streak ===
    const oggi = new Date().toDateString();
    const ultimoAccesso = new Date(progressiGlobali.ultimoAccesso).toDateString();
    const ieri = new Date(Date.now() - 86_400_000).toDateString();

    if (ultimoAccesso === oggi) {
      // Già studiato oggi — streak invariato
    } else if (ultimoAccesso === ieri) {
      // Studiato ieri — streak continua
      updatedProgress.streak += 1;
    } else {
      // Streak interrotto — ricomincia da 1
      updatedProgress.streak = 1;
    }

    // === 7. Aggiorna XP e livello ===
    const XP_PER_CORRETTA = 10;
    const XP_PER_QUIZ = 5;
    const XP_PER_LIVELLO = 500;

    updatedProgress.xp += (totCorretteInTurn * XP_PER_CORRETTA) + XP_PER_QUIZ;
    updatedProgress.livello = Math.floor(updatedProgress.xp / XP_PER_LIVELLO) + 1;

    // === 8. Aggiorna timestamp ===
    updatedProgress.ultimoAccesso = new Date().toISOString();

    // === 9. Aggiorna SRS ed Errori ===
    const updatedSrs = { ...srsData };
    const updatedErrori = { ...erroriLog };
    const srsModificatiIds = new Set<string>();
    const erroriModificatiIds = new Set<string>();

    risultatiList.forEach((ris) => {
      const domandaId = ris.domandaId;

      if (ris.corretta) {
        // SRS: incrementa consecutiveCorrect, aumenta intervallo
        const existing = updatedSrs[domandaId];
        const consecutiveCorrect = (existing?.consecutiveCorrect ?? 0) + 1;
        const easeFactor = Math.max(1.3, (existing?.easeFactor ?? 2.5) + 0.1);
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
        srsModificatiIds.add(domandaId);

        // Errori: se era in errore e ora è corretta, decrementa
        if (updatedErrori[domandaId]) {
          const newCount = updatedErrori[domandaId].count - 1;
          if (newCount <= 0) {
            delete updatedErrori[domandaId];
          } else {
            updatedErrori[domandaId] = {
              ...updatedErrori[domandaId],
              count: newCount,
            };
          }
          erroriModificatiIds.add(domandaId);
        }

      } else {
        // SRS: reset consecutiveCorrect, riduci easeFactor
        const existing = updatedSrs[domandaId];
        const easeFactor = Math.max(1.3, (existing?.easeFactor ?? 2.5) - 0.2);

        updatedSrs[domandaId] = {
          domandaId,
          easeFactor,
          interval: 1,
          nextReview: new Date().toISOString(),
          consecutiveCorrect: 0,
        };
        srsModificatiIds.add(domandaId);

        // Errori: aggiungi o incrementa
        const existingErr = updatedErrori[domandaId];
        updatedErrori[domandaId] = {
          domandaId,
          count: (existingErr?.count ?? 0) + 1,
          lastError: new Date().toISOString(),
          indiceRispostaScelta: ris.indiceRispostaScelta,
        };
        erroriModificatiIds.add(domandaId);
      }
    });

    // === 10. Aggiorna stato React ===
    setProgressiGlobali(updatedProgress);
    setSrsData(updatedSrs);
    setErroriLog(updatedErrori);

    // === 11. Persisti (localStorage + Firestore) ===
    await persistProgressData(
      updatedProgress,
      updatedSrs,
      updatedErrori,
      srsModificatiIds,
      erroriModificatiIds
    );
  };

  const segnaComeLetto = async (capitoloId: string) => {
    if (!progressiGlobali || !isAuthenticated || !user) return;
    if (progressiGlobali.capitoliLetti?.includes(capitoloId)) return;
    const XP_PER_CAPITOLO = 15;
    const XP_PER_LIVELLO = 500;
    
    const isoNow = new Date().toISOString();
    const oggi = new Date().toDateString();
    const ieri = new Date(Date.now() - 86400000).toDateString();
    const ultimoAccessoDate = progressiGlobali.ultimoAccesso ? new Date(progressiGlobali.ultimoAccesso).toDateString() : '';

    const updatedProgress: GlobalProgress = { 
        ...progressiGlobali,
        capitoliLetti: [...(progressiGlobali.capitoliLetti || []), capitoloId],
        xp: progressiGlobali.xp + XP_PER_CAPITOLO,
        ultimoAccesso: isoNow
    };

    if (ultimoAccessoDate === oggi) {
        // Già studiato oggi
    } else if (ultimoAccessoDate === ieri) {
        updatedProgress.streak = (updatedProgress.streak || 0) + 1;
    } else {
        updatedProgress.streak = 1;
    }

    updatedProgress.livello = Math.floor(updatedProgress.xp / XP_PER_LIVELLO) + 1;

    setProgressiGlobali(updatedProgress);
    try {
        const mainRef = doc(db, 'users', user.uid, 'progressi', 'main');
        await updateDoc(mainRef, {
            capitoliLetti: arrayUnion(capitoloId),
            xp: increment(XP_PER_CAPITOLO),
            ultimoAccesso: isoNow,
            streak: updatedProgress.streak,
            livello: updatedProgress.livello
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ progressi: updatedProgress, srs: srsData, errori: erroriLog }));
    } catch (e) { console.error("Errore atomico segnaComeLetto:", e); }
  };

  const rimuoviErrore = async (domandaId: string) => {
    if (!isAuthenticated || !user) return;
    
    const newErrori = { ...erroriLog };
    delete newErrori[domandaId];
    setErroriLog(newErrori);
    setErroriModificati(prev => new Set(prev).add(domandaId));

    // Persistiamo subito il cambiamento
    await persistProgressData(progressiGlobali!, srsData, newErrori, new Set(), new Set([domandaId]));
  };

  const aggiungiErrore = async (domandaId: string, rispostaErrata: number) => {
      if (!isAuthenticated || !user || !progressiGlobali) return;
      
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
      setErroriModificati(prev => new Set(prev).add(domandaId));

      await persistProgressData(progressiGlobali, srsData, newErrori, new Set(), new Set([domandaId]));
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
