import { useCallback, useMemo } from 'react';
import { usePL } from '../context/PLContext';
import type { DomandaPL } from '../types/pl';

/**
 * Fisher-Yates shuffle — mischia un array in modo uniforme
 */
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function useQuizPL() {
  const { domandeCore, domandeRegionali, domandeComunali, profilo } = usePL();

  // ✅ AGGIUNGI QUESTO — pool memoizzato
  const poolCompleto = useMemo(
    () => [...domandeCore, ...domandeRegionali, ...domandeComunali],
    [domandeCore, domandeRegionali, domandeComunali]
  );

  // ✅ generaQuizVeloce
  const generaQuizVeloce = useCallback((numeroDomande: number = 20): DomandaPL[] => {
    return shuffle(poolCompleto).slice(0, numeroDomande);
  }, [poolCompleto]);

  // ✅ generaQuizCategoria
  const generaQuizCategoria = useCallback((
    categoriaId: string, 
    n: number = 20,
    strato?: 'core' | 'regionale' | 'comunale'
  ): DomandaPL[] => {
    const base = strato === 'core' ? domandeCore
      : strato === 'regionale' ? domandeRegionali
      : strato === 'comunale' ? domandeComunali
      : poolCompleto;

    return shuffle(base.filter(d => d.categoriaId === categoriaId)).slice(0, n);
  }, [domandeCore, domandeRegionali, domandeComunali, poolCompleto]);

  // ✅ generaQuizStrato
  const generaQuizStrato = useCallback((
    strato: 'core' | 'regionale' | 'comunale',
    n: number = 20
  ): DomandaPL[] => {
    const map = {
      core: domandeCore,
      regionale: domandeRegionali,
      comunale: domandeComunali,
    };
    return shuffle(map[strato]).slice(0, n);
  }, [domandeCore, domandeRegionali, domandeComunali]);

  // ✅ generaSimulazione — con percentuali 5/25/70
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
    
    // Il Core funge da "riempitivo" se le domande locali scarseggiano
    const nCore = Math.min(totale - nRegionale - nComunale, domandeCore.length);

    const totaleEffettivo = nCore + nRegionale + nComunale;
    if (totaleEffettivo < totale) {
      console.warn(`Simulazione ridotta: ${totaleEffettivo}/${totale} domande disponibili`);
    }

    const simulazione: DomandaPL[] = [
      ...shuffle(domandeCore).slice(0, nCore),
      ...shuffle(domandeRegionali).slice(0, nRegionale),
      ...shuffle(domandeComunali).slice(0, nComunale),
    ];

    return shuffle(simulazione);
  }, [domandeCore, domandeRegionali, domandeComunali, profilo?.parametriEsame]);

  // ✅ generaQuizId — con Map per performance O(n) invece di O(n²)
  const generaQuizId = useCallback((ids: string[]): DomandaPL[] => {
    const map = new Map(poolCompleto.map(d => [d.id, d]));
    return ids.map(id => map.get(id)).filter((d): d is DomandaPL => d !== undefined);
  }, [poolCompleto]);

  // ✅ Quiz per livello di difficoltà (1 = facile, 2 = medio, 3 = avanzato)
  const generaQuizDifficolta = useCallback((
    livello: 1 | 2 | 3,
    n: number = 20
  ): DomandaPL[] => {
    return shuffle(poolCompleto.filter(d => d.livelloDifficolta === livello)).slice(0, n);
  }, [poolCompleto]);

  return {
    generaQuizVeloce,
    generaQuizCategoria,
    generaQuizStrato,
    generaSimulazione,
    generaQuizId,
    generaQuizDifficolta,
    parametriEsame: profilo?.parametriEsame,
  };
}
