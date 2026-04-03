import { useCallback, useMemo } from 'react';
import { usePL } from '../context/PLContext';
import type { DomandaPL, ComposizioneQuizPL } from '../types/pl';
import { ComposizioneQuizSchemaPL } from '../types/pl';

// ✅ Funzione pura a livello di modulo — stabile, mai ricreata
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

  // ✅ Pool completo memoizzato — ricreato solo se cambiano i dati sorgente
  const poolCompleto = useMemo(
    () => [...domandeCore, ...domandeRegionali, ...domandeComunali],
    [domandeCore, domandeRegionali, domandeComunali]
  );

  // Quiz veloce: N domande casuali dal pool completo
  const generaQuizVeloce = useCallback(
    (n = 20) => shuffle(poolCompleto).slice(0, n),
    [poolCompleto]
  );

  // Quiz per categoria — strato opzionale per filtrare su un sotto-pool
  const generaQuizCategoria = useCallback((
    categoriaId: string,
    n = 20,
    strato?: 'core' | 'regionale' | 'comunale'
  ): DomandaPL[] => {
    const base = strato === 'core'      ? domandeCore
               : strato === 'regionale' ? domandeRegionali
               : strato === 'comunale'  ? domandeComunali
               : poolCompleto;
    return shuffle(base.filter(d => d.categoriaId === categoriaId)).slice(0, n);
  }, [domandeCore, domandeRegionali, domandeComunali, poolCompleto]);

  // Quiz per strato specifico
  const generaQuizStrato = useCallback((
    strato: 'core' | 'regionale' | 'comunale',
    n = 20
  ): DomandaPL[] => {
    const stratoMap = { core: domandeCore, regionale: domandeRegionali, comunale: domandeComunali };
    return shuffle(stratoMap[strato]).slice(0, n);
  }, [domandeCore, domandeRegionali, domandeComunali]);

  // Simulazione d'esame: rispetta le proporzioni reali per strato
  const generaSimulazione = useCallback((config?: ComposizioneQuizPL): DomandaPL[] => {
    const params = profilo?.parametriEsame ?? {
      numeroDomande: 100,
      durataMinuti: 90,
      punteggioCorretta: 1,
      punteggioErrata: -0.25,
      punteggioNonData: 0,
    };

    // Validazione configurazione strati (SSOT)
    // Priorità: 1. config esplicito, 2. config nel profilo, 3. default (tramite parse({}))
    const validConfig = ComposizioneQuizSchemaPL.parse(config || profilo?.composizioneQuiz || {});
    const totale = params.numeroDomande;

    const nRegionale = Math.min(Math.round(totale * (validConfig.percentualeRegionale / 100)), domandeRegionali.length);
    const nComunale  = Math.min(Math.round(totale * (validConfig.percentualeComunale / 100)), domandeComunali.length);
    // Clamp: nCore non può superare le domande core disponibili (residuo del totale)
    const nCore = Math.min(totale - nRegionale - nComunale, domandeCore.length);

    if (nCore + nRegionale + nComunale < totale) {
      console.warn(`⚠️ Simulazione ridotta: ${nCore + nRegionale + nComunale}/${totale} domande disponibili nel pool attuale.`);
    }

    return shuffle([
      ...shuffle(domandeCore).slice(0, nCore),
      ...shuffle(domandeRegionali).slice(0, nRegionale),
      ...shuffle(domandeComunali).slice(0, nComunale),
    ]);
  }, [domandeCore, domandeRegionali, domandeComunali, profilo?.parametriEsame]);

  // Quiz per ID — Map lookup O(n) + preserva l'ordine degli ID passati
  const generaQuizId = useCallback((ids: string[]): DomandaPL[] => {
    const map = new Map(poolCompleto.map(d => [d.id, d]));
    return ids.map(id => map.get(id)).filter(Boolean) as DomandaPL[];
  }, [poolCompleto]);

  // Quiz per livello di difficoltà (1 = facile, 2 = medio, 3 = avanzato)
  const generaQuizDifficolta = useCallback((livello: 1 | 2 | 3, n = 20): DomandaPL[] =>
    shuffle(poolCompleto.filter(d => d.livelloDifficolta === livello)).slice(0, n),
  [poolCompleto]);

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
