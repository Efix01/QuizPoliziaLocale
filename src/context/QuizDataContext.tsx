import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { DomandaPLSchema, type DomandaPL } from '../types/pl';
import { useProfile } from './ProfileContext';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { z } from 'zod';
import localData from '../data/domandecore.json';

const ArrayDomandeSchema = z.array(DomandaPLSchema);

type LoadingLayers = {
  core: boolean;
  regionale: boolean;
  comunale: boolean;
};

interface QuizDataContextType {
  domandeCore: DomandaPL[];
  domandeRegionali: DomandaPL[];
  domandeComunali: DomandaPL[];
  tutteLeDomande: DomandaPL[];
  isLoading: boolean;
  loadingLayers: LoadingLayers;
  error: string | null;
  cambiaRegione: (regioneId: string, nomeRegione: string) => Promise<void>;
  cambiaComune: (comuneId: string, nomeComune: string) => Promise<void>;
  totaleDomandeDisponibili: number;
}

const QuizDataContext = createContext<QuizDataContextType | null>(null);

const PARAMETRI_ESAME_DEFAULT = {
  numeroDomande: 100,
  durataMinuti: 90,
  punteggioCorretta: 1,
  punteggioErrata: -0.25,
  punteggioNonData: 0,
};

export function QuizDataProvider({ children }: { children: React.ReactNode }) {
  const { profilo, setProfilo } = useProfile();
  
  const [domandeCore, setDomandeCore] = useState<DomandaPL[]>([]);
  const [domandeRegionali, setDomandeRegionali] = useState<DomandaPL[]>([]);
  const [domandeComunali, setDomandeComunali] = useState<DomandaPL[]>([]);
  
  const [loadingLayers, setLoadingLayers] = useState<LoadingLayers>({
    core: true,
    regionale: false,
    comunale: false,
  });
  
  const [error, setError] = useState<string | null>(null);
  
  const layersBootRef = useRef(false);

  const isLoading = useMemo(
    () => loadingLayers.core || loadingLayers.regionale || loadingLayers.comunale,
    [loadingLayers]
  );

  // ===================================================
  // 1. Boot Core: Firestore (con Cache Versionata) → fallback JSON locale
  // ===================================================
  useEffect(() => {
    let active = true;
    async function caricaCore() {
      setLoadingLayers(prev => ({ ...prev, core: true }));
      try {
        // 🛡️ Leggi versione remota del core (fallback a 1 in caso di errore)
        let remoteVersion = 1;
        try {
          const versionSnap = await getDoc(doc(db, 'metadata', 'domande_version'));
          if (versionSnap.exists()) {
            remoteVersion = versionSnap.data().core || 1;
          }
        } catch (e) {
          console.warn("Impossibile leggere la versione core da Firestore:", e);
        }

        // 🛡️ Controlla se abbiamo già i dati validi in cache locale
        const cachedVersion = localStorage.getItem('pl_cached_version_core');
        const cachedData = localStorage.getItem('pl_cached_domande_core');

        if (cachedVersion && cachedData && parseInt(cachedVersion, 10) === remoteVersion) {
          try {
            const parsed = JSON.parse(cachedData);
            const validated = ArrayDomandeSchema.safeParse(parsed);
            if (validated.success && validated.data.length > 0) {
              if (active) {
                setDomandeCore(validated.data);
                console.info(`⚡ Loaded ${validated.data.length} core questions from Local Cache (v${remoteVersion})`);
                setLoadingLayers(prev => ({ ...prev, core: false }));
                return;
              }
            }
          } catch (e) {
            console.warn("Errore parsing cache core:", e);
          }
        }

        // Se la cache è scaduta o assente, scarica da Firestore
        console.info("🔄 Cache core non valida o obsoleta, scarico da Firestore...");
        const q = query(collection(db, 'domande_core'), where("strato", "==", "core"));
        const snapshot = await getDocs(q);
        
        if (!active) return;

        if (!snapshot.empty) {
          const raw = snapshot.docs.map(doc => doc.data());
          const validDomande: DomandaPL[] = [];
          const brokenDomande: any[] = [];
          
          for (const doc of raw) {
            const result = DomandaPLSchema.safeParse(doc);
            if (result.success) {
              validDomande.push(result.data);
            } else {
              brokenDomande.push({ id: doc.id, error: result.error.issues });
            }
          }

          if (brokenDomande.length > 0) {
            console.error(`⚠️ Trovati ${brokenDomande.length} quiz malformati su Firebase:`, brokenDomande.slice(0, 3));
          }

          if (validDomande.length > 0) {
            setDomandeCore(validDomande);
            // Salva in cache per i prossimi accessi
            try {
              localStorage.setItem('pl_cached_domande_core', JSON.stringify(validDomande));
              localStorage.setItem('pl_cached_version_core', String(remoteVersion));
            } catch (cacheErr) {
              console.warn("Impossibile salvare in cache core:", cacheErr);
            }
            return;
          }
        }

        // 📦 Fallback: carica dal JSON locale
        const localResult = ArrayDomandeSchema.safeParse(localData.domande);
        if (localResult.success) {
          setDomandeCore(localResult.data);
        } else {
          setError('Impossibile caricare le domande.');
        }
      } catch (err) {
        console.error('Errore Firestore Core:', err);
        if (active) {
          // Fallback a cache esistente anche se vecchia se c'è errore di rete
          const cachedData = localStorage.getItem('pl_cached_domande_core');
          if (cachedData) {
            try {
              const validated = ArrayDomandeSchema.safeParse(JSON.parse(cachedData));
              if (validated.success) {
                setDomandeCore(validated.data);
                return;
              }
            } catch {}
          }
          const localResult = ArrayDomandeSchema.safeParse(localData.domande);
          if (localResult.success) setDomandeCore(localResult.data);
          else setError('Impossibile caricare le domande dal Cloud.');
        }
      } finally {
        if (active) setLoadingLayers(prev => ({ ...prev, core: false }));
      }
    }
    caricaCore();
    return () => { active = false; };
  }, []);


  // ===================================================
  // 2. Boot Layer Locali da Firestore (con Cache Versionata)
  // ===================================================
  useEffect(() => {
    if (!profilo?.regioneId) return;
    if (layersBootRef.current) return;
    layersBootRef.current = true;

    async function fetchLayers() {
      if (!profilo?.regioneId) return;

      // --- 2a. REGIONALI ---
      setLoadingLayers(prev => ({ ...prev, regionale: true }));
      try {
        let remoteVersion = 1;
        try {
          const versionSnap = await getDoc(doc(db, 'metadata', 'domande_version'));
          if (versionSnap.exists()) {
            remoteVersion = versionSnap.data().regionale?.[profilo.regioneId] ?? 1;
          }
        } catch (e) {
          console.warn("Impossibile leggere versione regionale da Firestore:", e);
        }

        const cachedVersion = localStorage.getItem(`pl_cached_version_regionale_${profilo.regioneId}`);
        const cachedData = localStorage.getItem(`pl_cached_domande_regionale_${profilo.regioneId}`);

        if (cachedVersion && cachedData && parseInt(cachedVersion, 10) === remoteVersion) {
          const parsed = JSON.parse(cachedData);
          const res = ArrayDomandeSchema.safeParse(parsed);
          if (res.success) {
            setDomandeRegionali(res.data);
            console.info(`⚡ Loaded ${res.data.length} regional questions from Local Cache (v${remoteVersion})`);
            setLoadingLayers(prev => ({ ...prev, regionale: false }));
          } else {
            throw new Error("Cache regionale corrotta");
          }
        } else {
          // Scarica da Firestore
          const qReg = query(
            collection(db, 'domande_core'), 
            where("strato", "==", "regionale"),
            where("regioneId", "==", profilo.regioneId)
          );
          const snapshot = await getDocs(qReg);
          const raw = snapshot.docs.map(doc => doc.data());
          const res = ArrayDomandeSchema.safeParse(raw);
          if (res.success) {
            setDomandeRegionali(res.data);
            try {
              localStorage.setItem(`pl_cached_domande_regionale_${profilo.regioneId}`, JSON.stringify(res.data));
              localStorage.setItem(`pl_cached_version_regionale_${profilo.regioneId}`, String(remoteVersion));
            } catch (err) {
              console.warn("Impossibile salvare in cache regionale:", err);
            }
          } else {
            setDomandeRegionali([]);
          }
        }
      } catch (e) {
        console.warn('Errore caricamento regionale', e);
        // Fallback a cache esistente se c'è errore di rete
        const cachedData = localStorage.getItem(`pl_cached_domande_regionale_${profilo.regioneId}`);
        if (cachedData) {
          try {
            const res = ArrayDomandeSchema.safeParse(JSON.parse(cachedData));
            if (res.success) setDomandeRegionali(res.data);
          } catch {}
        }
      } finally {
        setLoadingLayers(prev => ({ ...prev, regionale: false }));
      }

      // --- 2b. COMUNALI ---
      if (profilo.comuneId) {
        setLoadingLayers(prev => ({ ...prev, comunale: true }));
        try {
          let remoteVersion = 1;
          try {
            const versionSnap = await getDoc(doc(db, 'metadata', 'domande_version'));
            if (versionSnap.exists()) {
              remoteVersion = versionSnap.data().comunale?.[profilo.comuneId] ?? 1;
            }
          } catch (e) {
            console.warn("Impossibile leggere versione comunale da Firestore:", e);
          }

          const cachedVersion = localStorage.getItem(`pl_cached_version_comunale_${profilo.comuneId}`);
          const cachedData = localStorage.getItem(`pl_cached_domande_comunale_${profilo.comuneId}`);

          if (cachedVersion && cachedData && parseInt(cachedVersion, 10) === remoteVersion) {
            const parsed = JSON.parse(cachedData);
            const res = ArrayDomandeSchema.safeParse(parsed);
            if (res.success) {
              setDomandeComunali(res.data);
              console.info(`⚡ Loaded ${res.data.length} municipal questions from Local Cache (v${remoteVersion})`);
              setLoadingLayers(prev => ({ ...prev, comunale: false }));
            } else {
              throw new Error("Cache comunale corrotta");
            }
          } else {
            // Scarica da Firestore
            const qCom = query(
              collection(db, 'domande_core'), 
              where("strato", "==", "comunale"),
              where("comuneId", "==", profilo.comuneId)
            );
            const snapshot = await getDocs(qCom);
            const raw = snapshot.docs.map(doc => doc.data());
            const res = ArrayDomandeSchema.safeParse(raw);
            if (res.success) {
              setDomandeComunali(res.data);
              try {
                localStorage.setItem(`pl_cached_domande_comunale_${profilo.comuneId}`, JSON.stringify(res.data));
                localStorage.setItem(`pl_cached_version_comunale_${profilo.comuneId}`, String(remoteVersion));
              } catch (err) {
                console.warn("Impossibile salvare in cache comunale:", err);
              }
            } else {
              setDomandeComunali([]);
            }
          }
        } catch (e) {
          console.warn('Errore caricamento comunale', e);
          const cachedData = localStorage.getItem(`pl_cached_domande_comunale_${profilo.comuneId}`);
          if (cachedData) {
            try {
              const res = ArrayDomandeSchema.safeParse(JSON.parse(cachedData));
              if (res.success) setDomandeComunali(res.data);
            } catch {}
          }
        } finally {
          setLoadingLayers(prev => ({ ...prev, comunale: false }));
        }
      }
    }

    fetchLayers();
  }, [profilo?.regioneId, profilo?.comuneId]);

  // ===================================================
  // 3. cambiaRegione (con Cache)
  // ===================================================
  const cambiaRegione = useCallback(async (regioneId: string, nomeRegione: string): Promise<void> => {
    setLoadingLayers(prev => ({ ...prev, regionale: true }));
    setError(null);
    setDomandeComunali([]);
    
    setProfilo(prev => ({
      ...(prev ?? { parametriEsame: PARAMETRI_ESAME_DEFAULT }),
      regioneId,
      nomeRegione,
      comuneId: undefined,
      nomeComune: undefined,
    }));

    try {
      let remoteVersion = 1;
      try {
        const versionSnap = await getDoc(doc(db, 'metadata', 'domande_version'));
        if (versionSnap.exists()) {
          remoteVersion = versionSnap.data().regionale?.[regioneId] ?? 1;
        }
      } catch (e) {
        console.warn("Impossibile leggere versione regionale in cambiaRegione:", e);
      }

      const cachedVersion = localStorage.getItem(`pl_cached_version_regionale_${regioneId}`);
      const cachedData = localStorage.getItem(`pl_cached_domande_regionale_${regioneId}`);

      if (cachedVersion && cachedData && parseInt(cachedVersion, 10) === remoteVersion) {
        const parsed = JSON.parse(cachedData);
        const res = ArrayDomandeSchema.safeParse(parsed);
        if (res.success) {
          setDomandeRegionali(res.data);
          return;
        }
      }

      const qReg = query(
        collection(db, 'domande_core'), 
        where("strato", "==", "regionale"),
        where("regioneId", "==", regioneId)
      );
      const snapshot = await getDocs(qReg);
      const raw = snapshot.docs.map(doc => doc.data());
      const res = ArrayDomandeSchema.safeParse(raw);
      setDomandeRegionali(res.success ? res.data : []);
      if (res.success) {
        try {
          localStorage.setItem(`pl_cached_domande_regionale_${regioneId}`, JSON.stringify(res.data));
          localStorage.setItem(`pl_cached_version_regionale_${regioneId}`, String(remoteVersion));
        } catch {}
      }
    } catch (e) {
      console.warn(`Errore caricamento regione:`, e);
      setDomandeRegionali([]);
    } finally {
      setLoadingLayers(prev => ({ ...prev, regionale: false }));
    }
  }, [setProfilo]);

  // ===================================================
  // 4. cambiaComune (con Cache)
  // ===================================================
  const cambiaComune = useCallback(async (comuneId: string, nomeComune: string): Promise<void> => {
    if (!comuneId || comuneId === 'nessuno') {
      setDomandeComunali([]);
      setProfilo(prev => prev ? { ...prev, comuneId: undefined, nomeComune: undefined } : null);
      return;
    }

    setLoadingLayers(prev => ({ ...prev, comunale: true }));
    setError(null);
    setProfilo(prev => prev ? { ...prev, comuneId, nomeComune } : null);

    try {
      let remoteVersion = 1;
      try {
        const versionSnap = await getDoc(doc(db, 'metadata', 'domande_version'));
        if (versionSnap.exists()) {
          remoteVersion = versionSnap.data().comunale?.[comuneId] ?? 1;
        }
      } catch (e) {
        console.warn("Impossibile leggere versione comunale in cambiaComune:", e);
      }

      const cachedVersion = localStorage.getItem(`pl_cached_version_comunale_${comuneId}`);
      const cachedData = localStorage.getItem(`pl_cached_domande_comunale_${comuneId}`);

      if (cachedVersion && cachedData && parseInt(cachedVersion, 10) === remoteVersion) {
        const parsed = JSON.parse(cachedData);
        const res = ArrayDomandeSchema.safeParse(parsed);
        if (res.success) {
          setDomandeComunali(res.data);
          return;
        }
      }

      const qCom = query(
        collection(db, 'domande_core'), 
        where("strato", "==", "comunale"),
        where("comuneId", "==", comuneId)
      );
      const snapshot = await getDocs(qCom);
      const raw = snapshot.docs.map(doc => doc.data());
      const res = ArrayDomandeSchema.safeParse(raw);
      setDomandeComunali(res.success ? res.data : []);
      if (res.success) {
        try {
          localStorage.setItem(`pl_cached_domande_comunale_${comuneId}`, JSON.stringify(res.data));
          localStorage.setItem(`pl_cached_version_comunale_${comuneId}`, String(remoteVersion));
        } catch {}
      }
    } catch (e) {
      console.warn(`Errore caricamento comune:`, e);
      setDomandeComunali([]);
    } finally {
      setLoadingLayers(prev => ({ ...prev, comunale: false }));
    }
  }, [setProfilo]);

  // ===================================================
  // Valori derivati memoizzati
  // ===================================================
  const tutteLeDomande = useMemo(
    () => [...domandeCore, ...domandeRegionali, ...domandeComunali],
    [domandeCore, domandeRegionali, domandeComunali]
  );

  const value = useMemo<QuizDataContextType>(() => ({
    domandeCore,
    domandeRegionali,
    domandeComunali,
    tutteLeDomande,
    isLoading,
    loadingLayers,
    error,
    cambiaRegione,
    cambiaComune,
    totaleDomandeDisponibili: tutteLeDomande.length,
  }), [
    domandeCore, domandeRegionali, domandeComunali,
    tutteLeDomande, isLoading, loadingLayers, error,
    cambiaRegione, cambiaComune
  ]);

  return (
    <QuizDataContext.Provider value={value}>
      {children}
    </QuizDataContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useQuizData(): QuizDataContextType {
  const context = useContext(QuizDataContext);
  if (!context) throw new Error('useQuizData deve essere usato dentro QuizDataProvider');
  return context;
}

