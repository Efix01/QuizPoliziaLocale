import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { GlobalProgressSchema, type GlobalProgress, type SRSItem, type ErroreLog, type RisultatoRisposta } from '../types/progressi';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface ProgressContextProps {
  progressiGlobali: GlobalProgress | null;
  srsData: Record<string, SRSItem>;
  erroriLog: Record<string, ErroreLog>;
  isLoading: boolean;
  salvaRisultatoQuiz: (risultati: RisultatoRisposta[]) => Promise<void>;
  segnaComeLetto: (capitoloId: string) => Promise<void>;
}

const ProgressContext = createContext<ProgressContextProps | undefined>(undefined);

const STORAGE_KEY = 'pl_progress_offline_cache'; // Manteniamo una cache in caso di disconnessioni

export const ProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [progressiGlobali, setProgressiGlobali] = useState<GlobalProgress | null>(null);
  const [srsData, setSrsData] = useState<Record<string, SRSItem>>({});
  const [erroriLog, setErroriLog] = useState<Record<string, ErroreLog>>({});
  const [isLoading, setIsLoading] = useState(true);

  const defaultProgress: GlobalProgress = {
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

  // 1. Idratazione da Firebase o Cache
  useEffect(() => {
    let active = true;

    const caricaDati = async () => {
      setIsLoading(true);

      if (!isAuthenticated || !user) {
        // Se non è loggato (es. schermata login), puliamo lo stato o carichiamo una cache ospite
        setProgressiGlobali(defaultProgress); // Fallback temporaneo per visualizzazione UI
        setIsLoading(false);
        return;
      }

      try {
        // Tentativo Firestore fetch
        const docRef = doc(db, 'users', user.uid, 'pl_progress');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && active) {
          const data = docSnap.data();
          const result = GlobalProgressSchema.safeParse(data.progressi);
          
          if (result.success) {
              setProgressiGlobali(result.data);
              setSrsData(data.srs || {});
              setErroriLog(data.errori || {});
              
              // Caching offline backup
              localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          } else {
              console.warn("Dati Firestore malformati:", result.error.format());
              setProgressiGlobali(defaultProgress);
          }
        } else if (active) {
          // Nuovo utente su Firestore, controlliamo se ha una cache locale legacy da migrare
          const localStored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('pl_progress');
          if (localStored) {
              const parsed = JSON.parse(localStored);
              const result = GlobalProgressSchema.safeParse(parsed.progressi);
              if (result.success) {
                  setProgressiGlobali(result.data);
                  setSrsData(parsed.srs || {});
                  setErroriLog(parsed.errori || {});
                  // Effettua subito la sincronizzazione per salvarli
                  await setDoc(docRef, { progressi: result.data, srs: parsed.srs || {}, errori: parsed.errori || {} }, { merge: true });
              } else {
                  setProgressiGlobali(defaultProgress);
              }
          } else {
             // Utente completamente nuovo
             setProgressiGlobali(defaultProgress);
             await setDoc(docRef, { progressi: defaultProgress, srs: {}, errori: {} }, { merge: true });
          }
        }
      } catch (e) {
        console.error("Errore fetch Firebase Progress. Discesa su backup offline:", e);
        // Fallback a LocalStorage Offline Cache
        if (active) {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.progressi) setProgressiGlobali(parsed.progressi);
                if (parsed.srs) setSrsData(parsed.srs);
                if (parsed.errori) setErroriLog(parsed.errori);
            } else {
                setProgressiGlobali(defaultProgress);
            }
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    caricaDati();

    return () => { active = false; };
  }, [user, isAuthenticated]);

  // Salva su Firestore + Fallback localStorage
  const persistProgressData = async (progress: GlobalProgress, srs: Record<string, SRSItem>, errori: Record<string, ErroreLog>) => {
    // 1. Sempre cache locale sincrona
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        progressi: progress,
        srs,
        errori
      }));
    } catch (e) {
      console.warn('Errore localStorage backup:', e);
    }

    // 2. Database Cloud Asincrono
    if (isAuthenticated && user) {
        try {
            const docRef = doc(db, 'users', user.uid, 'pl_progress');
            await setDoc(docRef, {
                progressi: progress,
                srs,
                errori,
                lastUpdated: new Date().toISOString()
            }, { merge: true });
        } catch (e) {
            console.error("Errore salvataggio Firebase. I dati sono stati salvati offline.", e);
        }
    }
  };

  const salvaRisultatoQuiz = async (risultatiList: RisultatoRisposta[]) => {
    if (!progressiGlobali) return;

    const updatedProgress = { ...progressiGlobali };
    updatedProgress.quizCompletati += 1;
    
    let totCorretteInTurn = 0;

    risultatiList.forEach((ris) => {
      const rootCat = ris.categoriaId;
      
      if (!updatedProgress.perCategoria[rootCat]) {
        updatedProgress.perCategoria[rootCat] = { fatte: 0, corrette: 0 };
      }
      updatedProgress.perCategoria[rootCat].fatte += 1;
      
      if (ris.corretta) {
        updatedProgress.perCategoria[rootCat].corrette += 1;
        totCorretteInTurn += 1;
      }
    });

    updatedProgress.risposteCorrette += totCorretteInTurn;
    updatedProgress.ultimoAccesso = new Date().toISOString();

    setProgressiGlobali(updatedProgress);
    await persistProgressData(updatedProgress, srsData, erroriLog);
  };

  const segnaComeLetto = async (capitoloId: string) => {
    if (!progressiGlobali) return;
    
    // Evita duplicati
    if (progressiGlobali.capitoliLetti?.includes(capitoloId)) return;

    const updatedProgress = { ...progressiGlobali };
    if (!updatedProgress.capitoliLetti) updatedProgress.capitoliLetti = [];
    
    updatedProgress.capitoliLetti.push(capitoloId);
    updatedProgress.xp += 15; // Premio per la lettura
    updatedProgress.ultimoAccesso = new Date().toISOString();

    setProgressiGlobali(updatedProgress);
    await persistProgressData(updatedProgress, srsData, erroriLog);
  };

  return (
    <ProgressContext.Provider value={{ progressiGlobali, srsData, erroriLog, isLoading, salvaRisultatoQuiz, segnaComeLetto }}>
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
