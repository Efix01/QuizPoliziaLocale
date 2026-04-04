import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { DomandaPLSchema, type DomandaPL, type ProfiloPL } from '../types/pl';
import { z } from 'zod';
import { useProfile } from './ProfileContext';

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
  domandeCore: DomandaPL[];
  domandeRegionali: DomandaPL[];
  domandeComunali: DomandaPL[];
  tutteLeDomande: DomandaPL[];
  isLoading: boolean;
  error: string | null;
  cambiaRegione: (regioneId: string, nomeRegione: string) => Promise<void>;
  cambiaComune: (comuneId: string, nomeComune: string) => Promise<void>;
  totaleDomandeDisponibili: number;
}

const QuizDataContext = createContext<QuizDataContextType | null>(null);

const ArrayDomandeSchema = z.array(DomandaPLSchema);

const PROFILO_DEFAULT_PARAMS = {
  parametriEsame: {
    numeroDomande: 100,
    durataMinuti: 90,
    punteggioCorretta: 1,
    punteggioErrata: -0.25,
    punteggioNonData: 0,
  },
};

/**
 * Helper per estrarre in modo sicuro l'array di domande dai moduli JSON importati.
 */
function estraiDomande(data: { default?: { domande?: unknown[] }; domande?: unknown[] }): unknown[] {
  return data.domande ?? data.default?.domande ?? [];
}

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

  const regioneRequestRef = useRef(0);
  const comuneRequestRef = useRef(0);
  const bootLayersRef = useRef(false);

  const isLoading = useMemo(() => 
    loadingLayers.core || loadingLayers.regionale || loadingLayers.comunale,
    [loadingLayers]
  );

  // --- LOGICA DI CARICAMENTO PURA (Senza side-effects sul profilo) ---

  const caricaDomandeRegionali = useCallback(async (regioneId: string, requestId: number) => {
    setLoadingLayers(prev => ({ ...prev, regionale: true }));
    try {
      const modulePath = `/src/data/regioni/${regioneId}/domanderegionali.json`;
      
      // ✅ Validazione esplicita del modulo
      if (!(modulePath in regioniModules)) {
        console.warn(`Dati regionali non disponibili per: ${regioneId}`);
        setDomandeRegionali([]);
        return;
      }

      const loader = regioniModules[modulePath];
      const data = await loader();
      if (requestId !== regioneRequestRef.current) return;

      const raw = estraiDomande(data);
      const withMeta = raw.map((d) => ({
        ...(d as object),
        strato: 'regionale' as const,
        regioneId,
      }));

      const result = ArrayDomandeSchema.safeParse(withMeta);
      setDomandeRegionali(result.success ? result.data : []);
    } catch (e) {
      if (requestId !== regioneRequestRef.current) return;
      console.error(`Errore caricamento regionale (${regioneId}):`, e);
      setDomandeRegionali([]);
    } finally {
      if (requestId === regioneRequestRef.current) {
        setLoadingLayers(prev => ({ ...prev, regionale: false }));
      }
    }
  }, []);

  const caricaDomandeComunali = useCallback(async (comuneId: string, regioneId: string, requestId: number) => {
    setLoadingLayers(prev => ({ ...prev, comunale: true }));
    try {
      const modulePath = `/src/data/comuni/${comuneId}/domandecomunali.json`;

      // ✅ Validazione esplicita del modulo
      if (!(modulePath in comuniModules)) {
        console.warn(`Dati comunali non disponibili per: ${comuneId}`);
        setDomandeComunali([]);
        return;
      }

      const loader = comuniModules[modulePath];
      const data = await loader();
      if (requestId !== comuneRequestRef.current) return;

      const raw = estraiDomande(data);
      const withMeta = raw.map((d) => ({
        ...(d as object),
        strato: 'comunale' as const,
        regioneId,
        comuneId,
      }));

      const result = ArrayDomandeSchema.safeParse(withMeta);
      setDomandeComunali(result.success ? result.data : []);
    } catch (e) {
      if (requestId !== comuneRequestRef.current) return;
      console.error(`Errore caricamento comunale (${comuneId}):`, e);
      setDomandeComunali([]);
    } finally {
      if (requestId === comuneRequestRef.current) {
        setLoadingLayers(prev => ({ ...prev, comunale: false }));
      }
    }
  }, []);

  // --- EFFETTI ---

  // 1. Boot Core (Sempre al mount)
  useEffect(() => {
    let active = true;
    async function bootCore() {
      setLoadingLayers(prev => ({ ...prev, core: true }));
      try {
        const data = await import('@data/domandecore.json');
        const raw = estraiDomande(data);
        const result = ArrayDomandeSchema.safeParse(raw);
        if (active) setDomandeCore(result.success ? result.data : []);
      } catch (err) {
        console.error("Errore Core JSON:", err);
      } finally {
        if (active) setLoadingLayers(prev => ({ ...prev, core: false }));
      }
    }
    bootCore();
    return () => { active = false; };
  }, []);

  // 2. Boot Reattivo (Si attiva quando il profilo diventa disponibile)
  useEffect(() => {
    if (!profilo?.regioneId || bootLayersRef.current) return;
    
    bootLayersRef.current = true;
    const regReq = ++regioneRequestRef.current;
    
    caricaDomandeRegionali(profilo.regioneId, regReq);
    
    if (profilo.comuneId) {
      const comReq = ++comuneRequestRef.current;
      caricaDomandeComunali(profilo.comuneId, profilo.regioneId, comReq);
    }
  }, [profilo, caricaDomandeRegionali, caricaDomandeComunali]);

  // --- AZIONI UTENTE ---

  const cambiaRegione = useCallback(async (regioneId: string, nomeRegione: string) => {
    const requestId = ++regioneRequestRef.current;
    setDomandeComunali([]); // Pulisci i comuni vecchi

    // 1. Aggiorna Profilo istantaneamente
    setProfilo(prev => ({
      ...(prev ?? PROFILO_DEFAULT_PARAMS),
      regioneId,
      nomeRegione,
      comuneId: undefined,
      nomeComune: undefined,
    } as ProfiloPL));

    // 2. Carica dati
    await caricaDomandeRegionali(regioneId, requestId);
  }, [setProfilo, caricaDomandeRegionali]);

  const cambiaComune = useCallback(async (comuneId: string, nomeComune: string) => {
    const requestId = ++comuneRequestRef.current;
    
    if (comuneId === 'nessuno' || !comuneId) {
      setDomandeComunali([]);
      setProfilo(prev => prev ? { ...prev, comuneId: undefined, nomeComune: undefined } : null);
      return;
    }

    // 1. Aggiorna Profilo
    setProfilo(prev => prev ? { ...prev, comuneId, nomeComune } : null);

    // 2. Carica dati
    const regId = profilo?.regioneId || '';
    await caricaDomandeComunali(comuneId, regId, requestId);
  }, [profilo?.regioneId, setProfilo, caricaDomandeComunali]);

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
    error,
    cambiaRegione,
    cambiaComune,
    totaleDomandeDisponibili: tutteLeDomande.length,
  }), [domandeCore, domandeRegionali, domandeComunali, tutteLeDomande, isLoading, error, cambiaRegione, cambiaComune]);

  return <QuizDataContext.Provider value={value}>{children}</QuizDataContext.Provider>;
}

export function useQuizData() {
  const context = useContext(QuizDataContext);
  if (!context) throw new Error('useQuizData deve essere usato dentro QuizDataProvider');
  return context;
}
