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
import { collection, getDocs, query, where } from 'firebase/firestore';
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
  // 1. Boot Core: Firestore → fallback JSON locale
  // ===================================================
  useEffect(() => {
    let active = true;
    async function caricaCore() {
      setLoadingLayers(prev => ({ ...prev, core: true }));
      try {
        const q = query(collection(db, 'domande_core'), where("strato", "==", "core"));
        const snapshot = await getDocs(q);
        
        if (!active) return;

        if (!snapshot.empty) {
          // ✅ Firestore ha dati: li usa
          const raw = snapshot.docs.map(doc => doc.data());
          const result = ArrayDomandeSchema.safeParse(raw);
          if (result.success) {
            setDomandeCore(result.data);
            return;
          }
          console.warn('Firestore dati non validi, fallback a JSON locale');
        }

        // 📦 Fallback: carica dal JSON locale
        const localResult = ArrayDomandeSchema.safeParse(localData.domande);
        if (localResult.success) {
          setDomandeCore(localResult.data);
        } else {
          console.error('JSON locale non valido:', localResult.error.issues.slice(0, 3));
          setError('Impossibile caricare le domande.');
        }
      } catch (err) {
        console.error('Errore Firestore Core:', err);
        // Anche in caso di errore di rete → JSON locale
        if (active) {
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
  // 2. Boot Layer Locali da Firestore
  // ===================================================
  useEffect(() => {
    if (!profilo?.regioneId) return;
    if (layersBootRef.current) return;
    layersBootRef.current = true;

    async function fetchLayers() {
      if (!profilo?.regioneId) return;

      // Regionali
      setLoadingLayers(prev => ({ ...prev, regionale: true }));
      try {
        const qReg = query(
          collection(db, 'domande_core'), 
          where("strato", "==", "regionale"),
          where("regioneId", "==", profilo.regioneId)
        );
        const snapshot = await getDocs(qReg);
        const raw = snapshot.docs.map(doc => doc.data());
        const res = ArrayDomandeSchema.safeParse(raw);
        setDomandeRegionali(res.success ? res.data : []);
      } catch (e) {
        console.warn('Errore rete regionale', e);
      } finally {
        setLoadingLayers(prev => ({ ...prev, regionale: false }));
      }

      // Comunali
      if (profilo.comuneId) {
        setLoadingLayers(prev => ({ ...prev, comunale: true }));
        try {
          const qCom = query(
            collection(db, 'domande_core'), 
            where("strato", "==", "comunale"),
            where("comuneId", "==", profilo.comuneId)
          );
          const snapshot = await getDocs(qCom);
          const raw = snapshot.docs.map(doc => doc.data());
          const res = ArrayDomandeSchema.safeParse(raw);
          setDomandeComunali(res.success ? res.data : []);
        } catch (e) {
          console.warn('Errore rete comunale', e);
        } finally {
          setLoadingLayers(prev => ({ ...prev, comunale: false }));
        }
      }
    }

    fetchLayers();
  }, [profilo?.regioneId, profilo?.comuneId]);

  // ===================================================
  // 3. cambiaRegione
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
      const qReg = query(
        collection(db, 'domande_core'), 
        where("strato", "==", "regionale"),
        where("regioneId", "==", regioneId)
      );
      const snapshot = await getDocs(qReg);
      const raw = snapshot.docs.map(doc => doc.data());
      const res = ArrayDomandeSchema.safeParse(raw);
      setDomandeRegionali(res.success ? res.data : []);
    } catch (e) {
      console.warn(`Errore caricamento regione:`, e);
      setDomandeRegionali([]);
    } finally {
      setLoadingLayers(prev => ({ ...prev, regionale: false }));
    }
  }, [setProfilo]);

  // ===================================================
  // 4. cambiaComune
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
      const qCom = query(
        collection(db, 'domande_core'), 
        where("strato", "==", "comunale"),
        where("comuneId", "==", comuneId)
      );
      const snapshot = await getDocs(qCom);
      const raw = snapshot.docs.map(doc => doc.data());
      const res = ArrayDomandeSchema.safeParse(raw);
      setDomandeComunali(res.success ? res.data : []);
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

export function useQuizData(): QuizDataContextType {
  const context = useContext(QuizDataContext);
  if (!context) throw new Error('useQuizData deve essere usato dentro QuizDataProvider');
  return context;
}

