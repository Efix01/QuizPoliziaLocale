import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import { DomandaPLSchema, type DomandaPL } from '../types/pl';
import { z } from 'zod';
import { useProfile } from './ProfileContext';
// ===================================================
// Glob import — Vite risolve a build time
// ===================================================
const regioniModules = import.meta.glob<{
  default?: { domande?: unknown[] };
  domande?: unknown[];
}>('/src/data/regioni/*/domanderegionali.json');
const comuniModules = import.meta.glob<{
  default?: { domande?: unknown[] };
  domande?: unknown[];
}>('/src/data/comuni/*/domandecomunali.json');
// ===================================================
// Schema e helper
// ===================================================
const ArrayDomandeSchema = z.array(DomandaPLSchema);
type ModuleShape = {
  default?: { domande?: unknown[] };
  domande?: unknown[];
};
/** Estrae le domande grezze da un modulo JSON importato dinamicamente */
function estraiDomande(data: ModuleShape): unknown[] {
  return data.domande ?? data.default?.domande ?? [];
}
// ===================================================
// Tipi
// ===================================================
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
// ===================================================
// Context
// ===================================================
const QuizDataContext = createContext<QuizDataContextType | null>(null);
// ===================================================
// Costanti stabili
// ===================================================
const PARAMETRI_ESAME_DEFAULT = {
  numeroDomande: 100,
  durataMinuti: 90,
  punteggioCorretta: 1,
  punteggioErrata: -0.25,
  punteggioNonData: 0,
};
// ===================================================
// Provider
// ===================================================
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
  // Refs per race condition
  const regioneRequestRef = useRef(0);
  const comuneRequestRef = useRef(0);
  // Ref per evitare doppio boot dei layer locali
  const layersBootRef = useRef(false);
  // isLoading derivato dai tre layer
  const isLoading = useMemo(
    () => loadingLayers.core || loadingLayers.regionale || loadingLayers.comunale,
    [loadingLayers]
  );
  // ===================================================
  // 1. Boot core — una sola volta al mount
  // ===================================================
  useEffect(() => {
    let active = true;
    async function caricaCore() {
      setLoadingLayers(prev => ({ ...prev, core: true }));
      try {
        const data = await import('@data/domandecore.json');
        const raw = estraiDomande(data as ModuleShape);
        const result = ArrayDomandeSchema.safeParse(raw);
        if (!active) return;
        if (result.success) {
          setDomandeCore(result.data);
        } else {
          console.error('Core JSON non valido:', result.error.issues.slice(0, 5));
          setError('Dati nazionali non validi. Riprova più tardi.');
        }
      } catch (err) {
        console.error('Errore caricamento Core JSON:', err);
        if (active) setError('Impossibile caricare le domande nazionali.');
      } finally {
        if (active) setLoadingLayers(prev => ({ ...prev, core: false }));
      }
    }
    caricaCore();
    return () => { active = false; };
  }, []);
  // ===================================================
  // 2. Boot layer locali — quando il profilo è disponibile
  //    (scenario normale: Firebase Auth è asincrono,
  //     il profilo arriva dopo il mount)
  // ===================================================
  useEffect(() => {
    // Aspetta che il profilo sia disponibile
    if (!profilo?.regioneId) return;
    // Esegui una sola volta — cambiaRegione/cambiaComune
    // gestiranno i cambi successivi
    if (layersBootRef.current) return;
    layersBootRef.current = true;
    const regioneId = profilo.regioneId;
    const nomeRegione = profilo.nomeRegione ?? regioneId;
    const comuneId = profilo.comuneId;
    const nomeComune = profilo.nomeComune ?? comuneId ?? '';
    // Carica regionali
    const regionePath = `/src/data/regioni/${regioneId}/domanderegionali.json`;
    const regioneLoader = regioniModules[regionePath];
    if (regioneLoader) {
      setLoadingLayers(prev => ({ ...prev, regionale: true }));
      regioneLoader()
        .then(data => {
          const raw = estraiDomande(data);
          const withMeta = raw.map(d => ({
            ...(d as object),
            strato: 'regionale' as const,
            regioneId,
          }));
          const result = ArrayDomandeSchema.safeParse(withMeta);
          setDomandeRegionali(result.success ? result.data : []);
          if (!result.success) {
            console.warn(`Domande regionali ${nomeRegione} non valide:`, result.error.issues.slice(0, 3));
          }
        })
        .catch(e => {
          console.warn(`Errore boot regionale (${regioneId}):`, e);
          setDomandeRegionali([]);
        })
        .finally(() => {
          setLoadingLayers(prev => ({ ...prev, regionale: false }));
        });
    }
    // Carica comunali (se presenti)
    if (comuneId) {
      const comunePath = `/src/data/comuni/${comuneId}/domandecomunali.json`;
      const comuneLoader = comuniModules[comunePath];
      if (comuneLoader) {
        setLoadingLayers(prev => ({ ...prev, comunale: true }));
        comuneLoader()
          .then(data => {
            const raw = estraiDomande(data);
            const withMeta = raw.map(d => ({
              ...(d as object),
              strato: 'comunale' as const,
              regioneId,
              comuneId,
            }));
            const result = ArrayDomandeSchema.safeParse(withMeta);
            setDomandeComunali(result.success ? result.data : []);
            if (!result.success) {
              console.warn(`Domande comunali ${nomeComune} non valide:`, result.error.issues.slice(0, 3));
            }
          })
          .catch(e => {
            console.warn(`Errore boot comunale (${comuneId}):`, e);
            setDomandeComunali([]);
          })
          .finally(() => {
            setLoadingLayers(prev => ({ ...prev, comunale: false }));
          });
      }
    }
  }, [profilo?.regioneId, profilo?.comuneId]);
  // ===================================================
  // 3. cambiaRegione
  // ===================================================
  const cambiaRegione = useCallback(async (regioneId: string, nomeRegione: string): Promise<void> => {
    const requestId = ++regioneRequestRef.current;
    // Validazione contro le chiavi disponibili nel glob
    const modulePath = `/src/data/regioni/${regioneId}/domanderegionali.json`;
    if (!(modulePath in regioniModules)) {
      console.warn(`Regione non disponibile: ${regioneId}`);
      setDomandeRegionali([]);
      setDomandeComunali([]);
      setProfilo(prev => ({
        ...(prev ?? { parametriEsame: PARAMETRI_ESAME_DEFAULT }),
        regioneId,
        nomeRegione,
        comuneId: undefined,
        nomeComune: undefined,
      }));
      return;
    }
    setLoadingLayers(prev => ({ ...prev, regionale: true }));
    setError(null);
    // Reset comunale — una nuova regione invalida il comune precedente
    setDomandeComunali([]);
    comuneRequestRef.current++; // invalida eventuali richieste comunali in volo
    // Aggiorna profilo subito — la UI risponde immediatamente
    setProfilo(prev => ({
      ...(prev ?? { parametriEsame: PARAMETRI_ESAME_DEFAULT }),
      regioneId,
      nomeRegione,
      comuneId: undefined,
      nomeComune: undefined,
    }));
    try {
      const loader = regioniModules[modulePath];
      const data = await loader();
      if (requestId !== regioneRequestRef.current) return;
      const raw = estraiDomande(data);
      const withMeta = raw.map(d => ({
        ...(d as object),
        strato: 'regionale' as const,
        regioneId,
      }));
      const result = ArrayDomandeSchema.safeParse(withMeta);
      if (result.success) {
        setDomandeRegionali(result.data);
      } else {
        console.warn(`Validazione regionale ${regioneId}:`, result.error.issues.slice(0, 3));
        setDomandeRegionali([]);
      }
    } catch (e) {
      if (requestId !== regioneRequestRef.current) return;
      console.warn(`Errore caricamento regione ${nomeRegione}:`, e);
      setDomandeRegionali([]);
    } finally {
      if (requestId === regioneRequestRef.current) {
        setLoadingLayers(prev => ({ ...prev, regionale: false }));
      }
    }
  }, [setProfilo]);
  // ===================================================
  // 4. cambiaComune
  // ===================================================
  const cambiaComune = useCallback(async (comuneId: string, nomeComune: string): Promise<void> => {
    // Nessun comune selezionato — reset
    if (!comuneId || comuneId === 'nessuno') {
      setDomandeComunali([]);
      setProfilo(prev => prev ? {
        ...prev,
        comuneId: undefined,
        nomeComune: undefined,
      } : null);
      setError(null);
      return;
    }
    const requestId = ++comuneRequestRef.current;
    // Validazione contro le chiavi disponibili nel glob
    const modulePath = `/src/data/comuni/${comuneId}/domandecomunali.json`;
    if (!(modulePath in comuniModules)) {
      console.warn(`Comune non disponibile: ${comuneId}`);
      setDomandeComunali([]);
      setProfilo(prev => prev ? { ...prev, comuneId, nomeComune } : null);
      return;
    }
    setLoadingLayers(prev => ({ ...prev, comunale: true }));
    setError(null);
    // Aggiorna profilo subito
    setProfilo(prev => prev ? { ...prev, comuneId, nomeComune } : null);
    try {
      const loader = comuniModules[modulePath];
      const data = await loader();
      if (requestId !== comuneRequestRef.current) return;
      const regioneId = profilo?.regioneId ?? '';
      const raw = estraiDomande(data);
      const withMeta = raw.map(d => ({
        ...(d as object),
        strato: 'comunale' as const,
        regioneId,
        comuneId,
      }));
      const result = ArrayDomandeSchema.safeParse(withMeta);
      if (result.success) {
        setDomandeComunali(result.data);
      } else {
        console.warn(`Validazione comunale ${comuneId}:`, result.error.issues.slice(0, 3));
        setDomandeComunali([]);
      }
    } catch (e) {
      if (requestId !== comuneRequestRef.current) return;
      console.warn(`Errore caricamento comune ${nomeComune}:`, e);
      setDomandeComunali([]);
    } finally {
      if (requestId === comuneRequestRef.current) {
        setLoadingLayers(prev => ({ ...prev, comunale: false }));
      }
    }
  }, [profilo?.regioneId, setProfilo]);
  // ===================================================
  // 5. Valori derivati memoizzati
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
    domandeCore,
    domandeRegionali,
    domandeComunali,
    tutteLeDomande,
    isLoading,
    loadingLayers,
    error,
    cambiaRegione,
    cambiaComune,
  ]);
  return (
    <QuizDataContext.Provider value={value}>
      {children}
    </QuizDataContext.Provider>
  );
}
// ===================================================
// Hook
// ===================================================
export function useQuizData(): QuizDataContextType {
  const context = useContext(QuizDataContext);
  if (!context) throw new Error('useQuizData deve essere usato dentro QuizDataProvider');
  return context;
}
