import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProfiloPLSchema, DomandaPLSchema, type ProfiloPL, type DomandaPL } from '../types/pl';
import { z } from 'zod';

interface PLContextType {
  // Profilo
  profilo: ProfiloPL | null;
  setProfilo: (p: ProfiloPL) => void;
  profiloConfigurato: boolean;

  // Domande caricate
  domandeCore: DomandaPL[];
  domandeRegionali: DomandaPL[];
  domandeComunali: DomandaPL[];
  tutteLeDomande: DomandaPL[];        // core + regionali + comunali
  
  // Stato caricamento ed Errori
  isLoading: boolean;
  error: string | null;
  
  // Cambio regione/comune
  cambiaRegione: (regioneId: string) => Promise<void>;
  cambiaComune: (comuneId: string | null) => Promise<void>;
  
  // Helper
  totaleDomandeDisponibili: number;
}

export const PLContext = createContext<PLContextType | null>(null);

// Definiamo uno schema per array di domande per la validazione a triplo strato
const ArrayDomandeSchema = z.array(DomandaPLSchema);

const PROFILO_KEY = 'pl_user_profile';

export function PLProvider({ children }: { children: React.ReactNode }) {
  const [profilo, setProfiloState] = useState<ProfiloPL | null>(null);
  const [domandeCore, setDomandeCore] = useState<DomandaPL[]>([]);
  const [domandeRegionali, setDomandeRegionali] = useState<DomandaPL[]>([]);
  const [domandeComunali, setDomandeComunali] = useState<DomandaPL[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Wrapper per salvare anche in localStorage con supporto functional update
  const setProfilo = (update: ProfiloPL | ((prev: ProfiloPL | null) => ProfiloPL | null)) => {
    setProfiloState(prev => {
        const next = typeof update === 'function' ? update(prev) : update;
        if (next) {
            try {
                localStorage.setItem(PROFILO_KEY, JSON.stringify(next));
            } catch (e) {
                console.error("Errore salvataggio profilo", e);
            }
        }
        return next;
    });
  };

  // 1. Carica profilo da localStorage al boot con validazione Zod
  useEffect(() => {
    try {
        const stored = localStorage.getItem(PROFILO_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            
            // VALIDAZIONE SICURA (FIX #1 contro pagina bianca)
            const result = ProfiloPLSchema.safeParse(parsed);
            if (result.success) {
                setProfiloState(result.data);
                
                // Carica anche le domande specifiche se presenti (senza scatenare un loop)
                if (result.data.regioneId) {
                    import(`../data/regioni/${result.data.regioneId}/domande_regionali.json`)
                        .then(data => {
                            const res = ArrayDomandeSchema.safeParse(data.domande);
                            setDomandeRegionali(res.success ? res.data : []);
                        }).catch(() => {});
                }
                if (result.data.comuneId) {
                    import(`../data/comuni/${result.data.comuneId}/domande_comunali.json`)
                        .then(data => {
                            const res = ArrayDomandeSchema.safeParse(data.domande);
                            setDomandeComunali(res.success ? res.data : []);
                        }).catch(() => {});
                }
            } else {
                console.warn("Profilo locale non compatibile o corrotto. Resetting...", result.error.format());
                localStorage.removeItem(PROFILO_KEY);
            }
        }
    } catch (e) {
        console.error("Errore critico idratazione profilo", e);
    }
  }, []);

  // 2. Carica core sempre all'avvio
  useEffect(() => {
    let isMounted = true;
    async function loadCore() {
      try {
        // NOTA VITE: L'import dinamico con path fisso funziona sempre
        const data = await import('../data/domande_core.json');
        
        // Validazione Zod ATTIVA (FIX #3 — mai fare type cast fiduciario)
        const result = ArrayDomandeSchema.safeParse(data.domande);
        if (!result.success) {
          console.error('JSON Core non valido:', result.error.issues.slice(0, 5));
          if (isMounted) setError('Il file domande nazionali contiene dati non validi.');
          setIsLoading(false);
          return;
        }
        const domande = result.data;
        
        if (isMounted) {
            setDomandeCore(domande);
            setIsLoading(false);
        }
      } catch (err) {
        console.error("Errore caricamento CORE JSON:", err);
        if (isMounted) setError("Impossibile caricare il blocco di domande nazionali.");
        setIsLoading(false); // Sblocca la UI anche se fallisce
      }
    }
    loadCore();
    return () => { isMounted = false; };
  }, []);

  // Carica regionali quando cambia la regione
  async function cambiaRegione(regioneId: string) {
    setIsLoading(true);
    setError(null);
    try {
        // NOTA VITE: I path dinamici con template literal potrebbero richiedere che
        // le cartelle './data/regioni/' esistano nel filesystem durante il build.
      const data = await import(`../data/regioni/${regioneId}/domande_regionali.json`);
      const result = ArrayDomandeSchema.safeParse(data.domande);
      setDomandeRegionali(result.success ? result.data : []);
      if (!result.success) console.warn(`Validazione regionale fallita per ${regioneId}:`, result.error.issues.slice(0, 3));
      
      // Aggiorna profilo in locale (successivamente andrà sincronizzato con Auth/Firestore)
      setProfilo(prev => prev ? { 
        ...prev, 
        regioneId, 
        comuneId: undefined  // reset comune quando cambi regione
      } : null);
    } catch (e) {
        console.warn(`File domande assente per regione ${regioneId}`, e);
        // Regione senza domande specifiche, ripartiamo da zero
      setDomandeRegionali([]);
    }
    setIsLoading(false);
  }

  // Carica comunali quando cambia il comune
  async function cambiaComune(comuneId: string | null) {
    if (!comuneId) {
      setDomandeComunali([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await import(`../data/comuni/${comuneId}/domande_comunali.json`);
      const result = ArrayDomandeSchema.safeParse(data.domande);
      setDomandeComunali(result.success ? result.data : []);
      if (!result.success) console.warn(`Validazione comunale fallita per ${comuneId}:`, result.error.issues.slice(0, 3));
      
      setProfilo(prev => prev ? { ...prev, comuneId } : null);
    } catch (e) {
        console.warn(`File domande assente per comune ${comuneId}`, e);
      // Comune senza domande specifiche
      setDomandeComunali([]);
    }
    setIsLoading(false);
  }

  // Tutte le domande assemblate on demand
  const tutteLeDomande = [...domandeCore, ...domandeRegionali, ...domandeComunali];

  const value: PLContextType = {
    profilo,
    setProfilo,
    profiloConfigurato: profilo !== null,
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

  return <PLContext.Provider value={value}>{children}</PLContext.Provider>;
}

export function usePL() {
  const context = useContext(PLContext);
  if (!context) throw new Error('usePL deve essere dentro PLProvider');
  return context;
}
