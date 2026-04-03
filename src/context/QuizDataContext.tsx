import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { DomandaPLSchema, type DomandaPL } from '../types/pl';
import { z } from 'zod';
import { useProfile } from './ProfileContext';
import regioniData from '../data/regioni_pl.json';

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
  const hasHydratedRef = useRef(false);

  // isLoading derivato
  const isLoading = useMemo(() => 
    loadingLayers.core || loadingLayers.regionale || loadingLayers.comunale,
    [loadingLayers]
  );

  // 1. Caricamento Core (Nazionale)
  useEffect(() => {
    let isMounted = true;
    async function loadCore() {
      try {
        const data = await import('../data/domande_core.json');
        const result = ArrayDomandeSchema.safeParse(data.domande);
        
        if (isMounted) {
            if (result.success) {
                setDomandeCore(result.data);
            } else {
                console.error('Core JSON non valido:', result.error.issues.slice(0, 5));
                setError('Dati nazionali non validi.');
            }
            setLoadingLayers(prev => ({ ...prev, core: false }));
        }
      } catch (err) {
        console.error("Errore CORE JSON:", err);
        if (isMounted) {
            setError("Impossibile caricare domande nazionali.");
            setLoadingLayers(prev => ({ ...prev, core: false }));
        }
      }
    }
    loadCore();
    return () => { isMounted = false; };
  }, []);

  // 2. Idratazione iniziale Regionali/Comunali (Sincronizzata con Profile boot)
  useEffect(() => {
    if (!profilo || hasHydratedRef.current) return;
    hasHydratedRef.current = true;
    let isCancelled = false;

    if (profilo.regioneId) {
        setLoadingLayers(prev => ({ ...prev, regionale: true }));
        import(`../data/regioni/${profilo.regioneId}/domande_regionali.json`)
            .then(data => {
                if (isCancelled) return;
                const withMeta = (data.domande || []).map((d: any) => ({ 
                    ...d, strato: 'regionale', regioneId: profilo.regioneId 
                }));
                const res = ArrayDomandeSchema.safeParse(withMeta);
                setDomandeRegionali(res.success ? res.data : []);
            }).catch(e => {
                if (isCancelled) return;
                console.warn(`Errore regionale boot (${profilo.regioneId}):`, e);
                setDomandeRegionali([]);
            }).finally(() => {
                if (!isCancelled) {
                    setLoadingLayers(prev => ({ ...prev, regionale: false }));
                }
            });
    }

    if (profilo.comuneId) {
        setLoadingLayers(prev => ({ ...prev, comunale: true }));
        import(`../data/comuni/${profilo.comuneId}/domande_comunali.json`)
            .then(data => {
                if (isCancelled) return;
                const withMeta = (data.domande || []).map((d: any) => ({ 
                    ...d, strato: 'comunale', regioneId: profilo.regioneId, comuneId: profilo.comuneId 
                }));
                const res = ArrayDomandeSchema.safeParse(withMeta);
                setDomandeComunali(res.success ? res.data : []);
            }).catch(e => {
                if (isCancelled) return;
                console.warn(`Errore comunale boot (${profilo.comuneId}):`, e);
                setDomandeComunali([]);
            }).finally(() => {
                if (!isCancelled) {
                    setLoadingLayers(prev => ({ ...prev, comunale: false }));
                }
            });
    }

    return () => { isCancelled = true; };
  }, [profilo]);

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

      // Nota: Uso il path senza underscore come richiesto
      const data = await import(`../data/regioni/${regioneId}/domanderegionali.json`);

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
      // Nota: Uso il path senza underscore come richiesto
      const data = await import(`../data/comuni/${comuneId}/domandecomunali.json`);

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
