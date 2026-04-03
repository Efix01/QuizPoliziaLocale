import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { DomandaPLSchema, type DomandaPL } from '../types/pl';
import { z } from 'zod';
import { useProfile } from './ProfileContext';
import regioniData from '../data/regioni_pl.json';

// ✅ Glob import — Vite risolve a build time tutti i file disponibili
const regioniModules = import.meta.glob<{ default?: { domande: unknown[] }; domande?: unknown[] }>(
  '/src/data/regioni/*/domanderegionali.json'
);

const comuniModules = import.meta.glob<{ default?: { domande: unknown[] }; domande?: unknown[] }>(
  '/src/data/comuni/*/domandecomunali.json'
);

type LoadingLayers = {
  core: boolean;
  regionale: boolean;
  comunale: boolean;
};

interface QuizDataContextType {
  // Domande caricate
  domandeCore: DomandaPL[];
  domandeRegionali: DomandaPL[];
  domandeComunali: DomandaPL[];
  tutteLeDomande: DomandaPL[];
  
  // Stato caricamento ed Errori
  isLoading: boolean;
  error: string | null;
  
  // Cambio regione/comune
  cambiaRegione: (regioneId: string, nomeRegione: string) => Promise<void>;
  cambiaComune: (comuneId: string, nomeComune: string) => Promise<void>;
  
  // Helper
  totaleDomandeDisponibili: number;
}

const QuizDataContext = createContext<QuizDataContextType | null>(null);

const ArrayDomandeSchema = z.array(DomandaPLSchema);

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

  // Refs per Race Condition
  const regioneRequestRef = useRef(0);
  const comuneRequestRef = useRef(0);

  // isLoading derivato
  const isLoading = useMemo(() => 
    loadingLayers.core || loadingLayers.regionale || loadingLayers.comunale,
    [loadingLayers]
  );

  // 1. Caricamento Iniziale (Boot — Core, Regionali, Comunali)
  useEffect(() => {
    let active = true;

    async function bootDomande() {
      setLoadingLayers(prev => ({ ...prev, core: true }));
      try {
        const data = await import('@data/domandecore.json');
        const result = ArrayDomandeSchema.safeParse(data.domande || data.default?.domande);
        
        if (active) {
          if (result.success) {
            setDomandeCore(result.data);
          } else {
            console.error('Core JSON non valido:', result.error.issues.slice(0, 5));
            setError('Dati nazionali non validi.');
          }
        }
      } catch (err) {
        console.error("Errore Core JSON:", err);
        if (active) setError("Impossibile caricare domande nazionali.");
      } finally {
        if (active) setLoadingLayers(prev => ({ ...prev, core: false }));
      }

      // Caricamento Regionali (se presenti nel profilo) — Esecuzione Parallela
      if (active && profilo?.regioneId) {
        setLoadingLayers(prev => ({ ...prev, regionale: true }));
        const modulePath = `/src/data/regioni/${profilo.regioneId}/domanderegionali.json`;
        const loader = regioniModules[modulePath];
        if (loader) {
          loader().then(data => {
            if (!active) return;
            const raw = (data as any).domande || (data as any).default?.domande || [];
            const withMeta = raw.map((d: any) => ({ ...d, strato: 'regionale', regioneId: profilo.regioneId }));
            const res = ArrayDomandeSchema.safeParse(withMeta);
            setDomandeRegionali(res.success ? res.data : []);
          }).catch(e => {
            console.warn(`Errore regionale boot (${profilo.regioneId}):`, e);
            setDomandeRegionali([]);
          }).finally(() => {
            if (active) setLoadingLayers(prev => ({ ...prev, regionale: false }));
          });
        } else {
          setLoadingLayers(prev => ({ ...prev, regionale: false }));
        }
      }

      // Caricamento Comunali (se presenti nel profilo)
      if (active && profilo?.comuneId) {
        setLoadingLayers(prev => ({ ...prev, comunale: true }));
        const modulePath = `/src/data/comuni/${profilo.comuneId}/domandecomunali.json`;
        const loader = comuniModules[modulePath];
        if (loader) {
          loader().then(data => {
            if (!active) return;
            const raw = (data as any).domande || (data as any).default?.domande || [];
            const withMeta = raw.map((d: any) => ({ 
              ...d, strato: 'comunale', regioneId: profilo?.regioneId, comuneId: profilo.comuneId 
            }));
            const res = ArrayDomandeSchema.safeParse(withMeta);
            setDomandeComunali(res.success ? res.data : []);
          }).catch(e => {
            console.warn(`Errore comunale boot (${profilo.comuneId}):`, e);
            setDomandeComunali([]);
          }).finally(() => {
            if (active) setLoadingLayers(prev => ({ ...prev, comunale: false }));
          });
        } else {
          setLoadingLayers(prev => ({ ...prev, comunale: false }));
        }
      }
    }

    bootDomande();
    return () => { active = false; };
  }, []); // Esegue solo al mount

  // 3. Logica di cambio dati (Imperativa)
  // NOTA: Vite esegue automaticamente il caching modulare degli import dinamici.
  // Non è quindi necessario implementare un layer di cache manuale per i file JSON già caricati.
   const cambiaRegione = useCallback(async (regioneId: string, nomeRegione: string) => {
    const requestId = ++regioneRequestRef.current;
    setLoadingLayers(prev => ({ ...prev, regionale: true }));
    setError(null);

    // Reset comunale quando cambi regione
    setDomandeComunali([]);

    try {
      // Valida che la regione esista nel config
      const regioneValida = regioniData.regioni.find(r => r.id === regioneId);
      if (!regioneValida) {
        throw new Error(`Regione non riconosciuta: ${regioneId}`);
      }

      const modulePath = `/src/data/regioni/${regioneId}/domanderegionali.json`;
      const loader = regioniModules[modulePath];

      if (!loader) {
        throw new Error(`File non trovato per regione: ${regioneId}`);
      }

      const data = await loader();

      // Se nel frattempo è arrivata un'altra richiesta, ignora questa
      if (requestId !== regioneRequestRef.current) return;

      const rawDomande = data.domande || data.default?.domande || [];
      const withMeta = rawDomande.map((d: unknown) => ({
        ...(d as object),
        strato: 'regionale' as const,
        regioneId,
      }));

      const result = ArrayDomandeSchema.safeParse(withMeta);

      if (result.success) {
        setDomandeRegionali(result.data);
      } else {
        console.warn(`Validazione domande regionali ${regioneId} fallita:`, result.error.issues);
        setDomandeRegionali([]);
      }

      // Aggiorna profilo con nomeRegione corretto
      setProfilo(prev => prev ? {
        ...prev,
        regioneId,
        nomeRegione,
        comuneId: undefined,
        nomeComune: undefined,
      } : null);

    } catch (e) {
      if (requestId !== regioneRequestRef.current) return;
      console.warn(`Errore caricamento regione ${regioneId}:`, e);
      setDomandeRegionali([]);
      setError(`Impossibile caricare le domande per ${nomeRegione}`);
    } finally {
      if (requestId === regioneRequestRef.current) {
        setLoadingLayers(prev => ({ ...prev, regionale: false }));
      }
    }
  }, [setProfilo]);

  const cambiaComune = useCallback(async (comuneId: string, nomeComune: string) => {
    const requestId = ++comuneRequestRef.current;
    
    if (comuneId === 'nessuno' || !comuneId) {
      setDomandeComunali([]);
      setProfilo(prev => prev ? { ...prev, comuneId: undefined, nomeComune: undefined } : null);
      setError(null);
      return;
    }

    setLoadingLayers(prev => ({ ...prev, comunale: true }));
    setError(null);

    try {
      const modulePath = `/src/data/comuni/${comuneId}/domandecomunali.json`;
      const loader = comuniModules[modulePath];

      if (!loader) {
        throw new Error(`File non trovato per comune: ${comuneId}`);
      }

      const data = await loader();

      // Se nel frattempo è arrivata un'altra richiesta, ignora questa
      if (requestId !== comuneRequestRef.current) return;

      const rawDomande = data.domande || data.default?.domande || [];
      const regioneId = profilo?.regioneId || '';

      const withMeta = rawDomande.map((d: unknown) => ({
        ...(d as object),
        strato: 'comunale' as const,
        regioneId,
        comuneId,
      }));

      const result = ArrayDomandeSchema.safeParse(withMeta);

      if (result.success) {
        setDomandeComunali(result.data);
      } else {
        console.warn(`Validazione domande comunali ${comuneId} fallita:`, result.error.issues);
        setDomandeComunali([]);
      }

      // Aggiorna profilo con nomeComune corretto
      setProfilo(prev => prev ? {
        ...prev,
        comuneId,
        nomeComune,
      } : null);

    } catch (e) {
      if (requestId !== comuneRequestRef.current) return;
      console.warn(`Errore caricamento comune ${comuneId}:`, e);
      setDomandeComunali([]);
      setError(`Impossibile caricare le domande per ${nomeComune}`);
    } finally {
      if (requestId === comuneRequestRef.current) {
        setLoadingLayers(prev => ({ ...prev, comunale: false }));
      }
    }
  }, [profilo?.regioneId, setProfilo]);

  const tutteLeDomande = useMemo(
    () => [...domandeCore, ...domandeRegionali, ...domandeComunali],
    [domandeCore, domandeRegionali, domandeComunali]
  );

  const value: QuizDataContextType = {
    domandeCore,
    domandeRegionali,
    domandeComunali,
    tutteLeDomande,
    isLoading,
    error,
    cambiaRegione,
    cambiaComune,
    totaleDomandeDisponibili: tutteLeDomande.length,
  };

  return <QuizDataContext.Provider value={value}>{children}</QuizDataContext.Provider>;
}

export function useQuizData() {
  const context = useContext(QuizDataContext);
  if (!context) throw new Error('useQuizData deve essere usato dentro QuizDataProvider');
  return context;
}
