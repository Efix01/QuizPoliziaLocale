import { useCallback } from 'react';
import { usePL } from '../context/PLContext';
import type { DomandaPL } from '../types/pl';

export function useQuizPL() {
  const { domandeCore, domandeRegionali, domandeComunali, profilo } = usePL();

  // Helper puro non agganciato al lifecycle React
  const shuffle = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Quiz veloce: N domande dal pool completo (Usa useCallback per performance anti-rerender)
  const generaQuizVeloce = useCallback((numeroDomande: number = 20): DomandaPL[] => {
    const pool = [...domandeCore, ...domandeRegionali, ...domandeComunali];
    return shuffle(pool).slice(0, numeroDomande);
  }, [domandeCore, domandeRegionali, domandeComunali]);

  // Quiz per categoria specifica
  const generaQuizCategoria = useCallback((categoriaId: string, n: number = 20): DomandaPL[] => {
    const pool = [...domandeCore, ...domandeRegionali, ...domandeComunali]
      .filter(d => d.categoriaId === categoriaId);
    return shuffle(pool).slice(0, n);
  }, [domandeCore, domandeRegionali, domandeComunali]);

  // Quiz per strato specifico
  const generaQuizStrato = useCallback((strato: 'core' | 'regionale' | 'comunale', n: number = 20): DomandaPL[] => {
    let pool: DomandaPL[];
    switch (strato) {
      case 'core': pool = domandeCore; break;
      case 'regionale': pool = domandeRegionali; break;
      case 'comunale': pool = domandeComunali; break;
    }
    return shuffle(pool).slice(0, n);
  }, [domandeCore, domandeRegionali, domandeComunali]);

  // Simulazione d'esame: rispetta le proporzioni reali
  const generaSimulazione = useCallback((): DomandaPL[] => {
    const params = profilo?.parametriEsame ?? {
      numeroDomande: 100,
      durataMinuti: 90,
      punteggioCorretta: 1,
      punteggioErrata: -0.25,
      punteggioNonData: 0
    };

    const totale = params.numeroDomande;

    // Calcola quante per strato, limitato dalla disponibilità effettiva
    const nComunale = domandeComunali.length > 0 
      ? Math.min(Math.round(totale * 0.05), domandeComunali.length) 
      : 0;
    
    const nRegionale = domandeRegionali.length > 0 
      ? Math.min(Math.round(totale * 0.25), domandeRegionali.length) 
      : 0;
    
    // Il Core funge da "riempitivo" matematico se le domande locali scarseggiano
    const nCore = totale - nRegionale - nComunale;

    const simulazione: DomandaPL[] = [
      ...shuffle(domandeCore).slice(0, nCore),
      ...shuffle(domandeRegionali).slice(0, nRegionale),
      ...shuffle(domandeComunali).slice(0, nComunale),
    ];

    return shuffle(simulazione);
  }, [domandeCore, domandeRegionali, domandeComunali, profilo?.parametriEsame]);

  // Quiz basato su un elenco di ID (es. per ripasso errori)
  const generaQuizId = useCallback((ids: string[]): DomandaPL[] => {
    const pool = [...domandeCore, ...domandeRegionali, ...domandeComunali];
    return pool.filter(d => ids.includes(d.id));
  }, [domandeCore, domandeRegionali, domandeComunali]);

  return {
    generaQuizVeloce,
    generaQuizCategoria,
    generaQuizStrato,
    generaSimulazione,
    generaQuizId,
    parametriEsame: profilo?.parametriEsame,
  };
}
