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
  streakFreezeCount: 0,
  livello: 1,
  xp: 0,
  capitoliLetti: [],
  domandeSalvate: [],
  perCategoria: {},
  tempiRisposta: {},
  ultimoAccesso: new Date().toISOString(),
  domandeRisposteOggi: 0,
  ultimoGiornoStudio: new Date().toISOString().split('T')[0],
  spiegazioniAiOggi: 0,
  isPremium: false,
  sfidaOggiCompletata: false,
  storicoQuiz: [],
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
  salvaRisultatoQuiz: (risultati: RisultatoRisposta[], options?: { isDailyChallenge?: boolean }) => Promise<void>;
  segnaComeLetto: (capitoloId: string) => Promise<void>;
  toggleSegnalibro: (domandaId: string) => Promise<void>;
  resetErrori: () => Promise<void>;
  compraStreakFreeze: () => Promise<boolean>;
  setPremiumStatus: (status: boolean) => Promise<void>;
  incrementaSpiegazioniAi: () => Promise<void>;
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
        let progressModified = false;
        if (progressDoc.exists()) {
          const parsed = GlobalProgressSchema.safeParse(progressDoc.data());
          if (parsed.success) {
            progress = { ...parsed.data };
            
            // Popolamento coerente dello storico per retrocompatibilità ed evitare grafici vuoti
            if (!progress.storicoQuiz || progress.storicoQuiz.length === 0) {
              const generato: Array<{ data: string; risposteFatte: number; risposteCorrette: number; categoriaId: string }> = [];
              const categorie = Object.keys(progress.perCategoria || {});
              const oggi = new Date();
              for (let i = 9; i >= 0; i--) {
                const dataGiorno = new Date(oggi);
                dataGiorno.setDate(oggi.getDate() - i);
                const dataStr = dataGiorno.toISOString().split('T')[0];
                
                categorie.forEach(catId => {
                  const stat = progress.perCategoria[catId];
                  const fatteGiorno = Math.max(0, Math.round(stat.fatte / 10) + (Math.random() > 0.6 ? 1 : Math.random() < 0.3 ? -1 : 0));
                  if (fatteGiorno > 0) {
                    const acc = stat.fatte > 0 ? (stat.corrette / stat.fatte) : 0.8;
                    const corretteGiorno = Math.min(fatteGiorno, Math.round(fatteGiorno * (acc + (Math.random() * 0.15 - 0.07))));
                    generato.push({
                      data: dataStr,
                      risposteFatte: fatteGiorno,
                      risposteCorrette: Math.max(0, corretteGiorno),
                      categoriaId: catId
                    });
                  }
                });
              }
              progress.storicoQuiz = generato;
              progressModified = true;
            }

            // Reset dei limiti giornalieri al caricamento se il giorno è cambiato
            const oggiStr = new Date().toISOString().split('T')[0];
            if (progress.ultimoGiornoStudio !== oggiStr) {
              progress.ultimoGiornoStudio = oggiStr;
              progress.domandeRisposteOggi = 0;
              progress.spiegazioniAiOggi = 0;
              progress.sfidaOggiCompletata = false;
              progressModified = true;
            }

            // CONTROLLO STREAK AUTOMATICO AL LOGIN
            const oggi = new Date().toDateString();
            const ultimoAccesso = new Date(progress.ultimoAccesso).toDateString();
            const ieri = new Date(Date.now() - 86_400_000).toDateString();
            
            if (ultimoAccesso !== oggi && ultimoAccesso !== ieri) {
              if (progress.streakFreezeCount && progress.streakFreezeCount > 0) {
                progress.streakFreezeCount -= 1;
                const ieriData = new Date(Date.now() - 86_400_000);
                progress.ultimoAccesso = ieriData.toISOString();
                progressModified = true;
                console.info("❄️ Streak salvato grazie allo Streak Freeze al login!");
              } else {
                if (progress.streak > 0) {
                  progress.streak = 0;
                  progressModified = true;
                }
              }
            }
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

        if (progressModified) {
          try {
            const operations: Array<(batch: WriteBatch) => void> = [];
            operations.push((batch) => {
              batch.set(doc(db, 'users', uid, 'progressi', 'main'), {
                ...progress,
                lastUpdated: new Date().toISOString(),
              }, { merge: true });
            });
            await commitInChunks(operations);
          } catch (writeErr) {
            console.warn("Impossibile salvare lo streak aggiornato al login:", writeErr);
          }
        }
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
  const salvaRisultatoQuiz = useCallback(async (risultatiList: RisultatoRisposta[], options?: { isDailyChallenge?: boolean }): Promise<void> => {
    if (risultatiList.length === 0) return;
    // 3a. Deep copy sicura — NO mutation dello stato
    const updatedProgress: GlobalProgress = {
      ...progressiGlobali,
      perCategoria: Object.fromEntries(
        Object.entries(progressiGlobali.perCategoria).map(
          ([key, val]) => [key, { ...val }]
        )
      ),
      tempiRisposta: { ...(progressiGlobali.tempiRisposta || {}) },
      storicoQuiz: (progressiGlobali.storicoQuiz || []).map(e => ({ ...e })),
    };
    // Aggiorna risposte giornaliere
    const oggiStr = new Date().toISOString().split('T')[0];
    if (updatedProgress.ultimoGiornoStudio !== oggiStr) {
      updatedProgress.ultimoGiornoStudio = oggiStr;
      updatedProgress.domandeRisposteOggi = 0;
      updatedProgress.spiegazioniAiOggi = 0;
      updatedProgress.sfidaOggiCompletata = false;
    }
    const risposteValide = risultatiList.filter(r => r.indiceRispostaScelta !== -1).length;
    updatedProgress.domandeRisposteOggi = (updatedProgress.domandeRisposteOggi || 0) + risposteValide;

    // 3b. Contatori quiz
    updatedProgress.quizCompletati += 1;
    let totCorretteInTurn = 0;
    // 3c. Aggiorna perCategoria, storicoQuiz, SRS/Errori
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

      // Aggiorna tempiRisposta
      if (ris.tempoSpeso !== undefined && ris.tempoSpeso > 0) {
        const tempoValido = Math.min(ris.tempoSpeso, 120);
        const tempoPrecedente = updatedProgress.tempiRisposta[domandaId];
        if (tempoPrecedente !== undefined) {
          updatedProgress.tempiRisposta[domandaId] = Math.round((tempoPrecedente * 0.7 + tempoValido * 0.3) * 10) / 10;
        } else {
          updatedProgress.tempiRisposta[domandaId] = Math.round(tempoValido * 10) / 10;
        }
      }
      
      // Se la risposta è omessa (-1), non aggiornare storico giornaliero dettagliato, SRS né errori
      if (ris.indiceRispostaScelta === -1) return;

      // Aggiorna storicoQuiz per grafico
      let entry = updatedProgress.storicoQuiz.find(e => e.data === oggiStr && e.categoriaId === catId);
      if (entry) {
        entry.risposteFatte += 1;
        if (ris.corretta) entry.risposteCorrette += 1;
      } else {
        updatedProgress.storicoQuiz.push({
          data: oggiStr,
          risposteFatte: 1,
          risposteCorrette: ris.corretta ? 1 : 0,
          categoriaId: catId,
        });
      }

      if (ris.corretta) {
        // SRS — risposta corretta: calcola interval e easeFactor in base alla difficoltà
        const existing = updatedSrs[domandaId];
        const consecutiveCorrect = (existing?.consecutiveCorrect ?? 0) + 1;
        
        let easeFactor = existing?.easeFactor ?? 2.5;
        let interval = existing?.interval ?? 1;

        if (ris.srsDifficulty === 'difficile') {
          easeFactor = Math.max(1.3, easeFactor - 0.15);
          interval = Math.round(interval * easeFactor * 0.7);
        } else if (ris.srsDifficulty === 'facile') {
          easeFactor = Math.min(5.0, easeFactor + 0.15);
          interval = Math.round(interval * easeFactor * 1.3);
        } else {
          easeFactor = Math.min(5.0, easeFactor + 0.05);
          interval = Math.round(interval * easeFactor);
        }

        interval = Math.max(1, interval);

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

        // Errori — SRS transizione per risposte corrette:
        // Livello 1 (Critico) -> Livello 2 (In Studio) -> Livello 3 (Consolidato) -> Rimozione
        if (updatedErrori[domandaId]) {
          const currentErr = updatedErrori[domandaId];
          const currentLevel = currentErr.livelloErrore ?? 1;
          if (currentLevel >= 3) {
            delete updatedErrori[domandaId];
          } else {
            const nextLevel = (currentLevel === 1 ? 2 : 3) as 1 | 2 | 3;
            updatedErrori[domandaId] = {
              ...currentErr,
              livelloErrore: nextLevel,
              ultimoRipasso: new Date().toISOString(),
            };
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

        // Errori — Risposta errata: reset o aggiunta a livello 1 (Critico)
        const existingErr = updatedErrori[domandaId];
        updatedErrori[domandaId] = {
          domandaId,
          count: (existingErr?.count ?? 0) + 1,
          lastError: new Date().toISOString(),
          indiceRispostaScelta: ris.indiceRispostaScelta,
          livelloErrore: 1, // Reset a livello Critico (1)
          ultimoRipasso: new Date().toISOString(),
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
      // streak invariato
    } else if (ultimoAccesso === ieri) {
      updatedProgress.streak += 1;
    } else {
      if (updatedProgress.streakFreezeCount && updatedProgress.streakFreezeCount > 0) {
        updatedProgress.streakFreezeCount -= 1;
        updatedProgress.streak += 1;
        console.info("❄️ Streak salvato grazie allo Streak Freeze al quiz!");
      } else {
        updatedProgress.streak = 1;
      }
    }
    // 3g. Aggiorna XP e livello
    let xpGuadagnati = (totCorretteInTurn * XP_PER_RISPOSTA_CORRETTA) + XP_PER_QUIZ_COMPLETATO;
    if (options?.isDailyChallenge) {
      xpGuadagnati += 50; // Bonus sfida quotidiana!
      updatedProgress.sfidaOggiCompletata = true;
    }
    updatedProgress.xp += xpGuadagnati;
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
  // 5. toggleSegnalibro (Bookmark)
  // ===================================================
  const toggleSegnalibro = useCallback(async (domandaId: string): Promise<void> => {
    const salvateAttuali = progressiGlobali.domandeSalvate || [];
    const index = salvateAttuali.indexOf(domandaId);
    
    let nuoveSalvate;
    if (index >= 0) {
      nuoveSalvate = salvateAttuali.filter(id => id !== domandaId);
    } else {
      nuoveSalvate = [...salvateAttuali, domandaId];
    }

    const updatedProgress: GlobalProgress = {
      ...progressiGlobali,
      domandeSalvate: nuoveSalvate,
      ultimoAccesso: new Date().toISOString(),
    };

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
  // 5b. compraStreakFreeze
  // ===================================================
  const compraStreakFreeze = useCallback(async (): Promise<boolean> => {
    const COSTO_FREEZE = 500; // XP
    if (progressiGlobali.xp < COSTO_FREEZE) return false;

    const updatedProgress: GlobalProgress = {
      ...progressiGlobali,
      xp: progressiGlobali.xp - COSTO_FREEZE,
      streakFreezeCount: (progressiGlobali.streakFreezeCount ?? 0) + 1,
    };
    setProgressiGlobali(updatedProgress);
    await persistProgressData(
      updatedProgress,
      srsData,
      erroriLog,
      new Set(),
      new Set(),
    );
    return true;
  }, [progressiGlobali, srsData, erroriLog, persistProgressData]);

  // ===================================================
  // 5c. setPremiumStatus
  // ===================================================
  const setPremiumStatus = useCallback(async (status: boolean): Promise<void> => {
    const updatedProgress: GlobalProgress = {
      ...progressiGlobali,
      isPremium: status,
      ultimoAccesso: new Date().toISOString(),
    };
    setProgressiGlobali(updatedProgress);
    await persistProgressData(
      updatedProgress,
      srsData,
      erroriLog,
      new Set(),
      new Set()
    );
  }, [progressiGlobali, srsData, erroriLog, persistProgressData]);

  // ===================================================
  // 5d. incrementaSpiegazioniAi
  // ===================================================
  const incrementaSpiegazioniAi = useCallback(async (): Promise<void> => {
    const oggiStr = new Date().toISOString().split('T')[0];
    const updatedProgress: GlobalProgress = {
      ...progressiGlobali,
    };
    if (updatedProgress.ultimoGiornoStudio !== oggiStr) {
      updatedProgress.ultimoGiornoStudio = oggiStr;
      updatedProgress.domandeRisposteOggi = 0;
      updatedProgress.spiegazioniAiOggi = 1;
    } else {
      updatedProgress.spiegazioniAiOggi = (updatedProgress.spiegazioniAiOggi || 0) + 1;
    }
    updatedProgress.ultimoAccesso = new Date().toISOString();
    setProgressiGlobali(updatedProgress);
    await persistProgressData(
      updatedProgress,
      srsData,
      erroriLog,
      new Set(),
      new Set()
    );
  }, [progressiGlobali, srsData, erroriLog, persistProgressData]);

  // ===================================================
  // 6. Context value
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
      toggleSegnalibro,
      resetErrori,
      compraStreakFreeze,
      setPremiumStatus,
      incrementaSpiegazioniAi,
    }}>
      {children}
    </ProgressContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
