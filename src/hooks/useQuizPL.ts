import { useCallback } from 'react';
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
  const { domandeCore, domandeRegionali, domandeComunali, tutteLeDomande, profilo } = usePL();

  // Quiz veloce: N domande dal pool completo
  const generaQuizVeloce = useCallback((numeroDomande: number = 20): DomandaPL[] => {
    return shuffle(tutteLeDomande).slice(0, numeroDomande);
  }, [tutteLeDomande]);

  // Quiz per categoria specifica
  const generaQuizCategoria = useCallback((
    categoriaId: string, 
    n: number = 20,
    strato?: 'core' | 'regionale' | 'comunale'
  ): DomandaPL[] => {
    const base = strato === 'core' ? domandeCore
      : strato === 'regionale' ? domandeRegionali
      : strato === 'comunale' ? domandeComunali
      : tutteLeDomande;

    const filtered = base.filter((d: DomandaPL) => d.categoriaId === categoriaId);
    
    if (filtered.length === 0) {
      console.warn(`Nessuna domanda trovata per categoria ${categoriaId} in strato ${strato ?? 'tutti'}`);
    }

    return shuffle(filtered).slice(0, n);
  }, [domandeCore, domandeRegionali, domandeComunali, tutteLeDomande]);

  // Quiz per strato specifico
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

  // Simulazione d'esame: rispetta le proporzioni dal profilo
  const generaSimulazione = useCallback((): DomandaPL[] => {
    const params = profilo?.parametriEsame ?? {
      numeroDomande: 100,
      durataMinuti: 90,
      punteggioCorretta: 1,
      punteggioErrata: -0.25,
      punteggioNonData: 0
    };

    const totale = params.numeroDomande;

    // ✅ Leggi le proporzioni dal profilo, con fallback standard 70/25/5
    const composizione = profilo?.composizioneQuiz ?? {
      percentualeCore: 70,
      percentualeRegionale: 25,
      percentualeComunale: 5,
    };

    // Calcola il numero di domande target per layer
    const nCoreTarget = Math.round(totale * (composizione.percentualeCore / 100));
    const nRegionaleTarget = Math.round(totale * (composizione.percentualeRegionale / 100));
    const nComunaleTarget = Math.round(totale * (composizione.percentualeComunale / 100));

    // Limita ai disponibili
    let nCore = Math.min(nCoreTarget, domandeCore.length);
    let nRegionale = Math.min(nRegionaleTarget, domandeRegionali.length);
    let nComunale = Math.min(nComunaleTarget, domandeComunali.length);

    let totaleEffettivo = nCore + nRegionale + nComunale;

    // Se mancano domande, compensa dagli altri layer (priorità: core > regionale > comunale)
    if (totaleEffettivo < totale) {
      const deficit = totale - totaleEffettivo;
      
      const coreExtra = Math.min(deficit, domandeCore.length - nCore);
      nCore += coreExtra;

      const regionaleExtra = Math.min(deficit - coreExtra, domandeRegionali.length - nRegionale);
      nRegionale += regionaleExtra;

      const comunaleExtra = Math.min(deficit - coreExtra - regionaleExtra, domandeComunali.length - nComunale);
      nComunale += comunaleExtra;

      totaleEffettivo = nCore + nRegionale + nComunale;

      if (totaleEffettivo < totale) {
        console.warn(
          `Simulazione ridotta: ${totaleEffettivo}/${totale} domande disponibili.\n` +
          `Richieste (${composizione.percentualeCore}/${composizione.percentualeRegionale}/${composizione.percentualeComunale}%): ` +
          `core=${nCoreTarget}, reg=${nRegionaleTarget}, com=${nComunaleTarget}\n` +
          `Disponibili: core=${domandeCore.length}, reg=${domandeRegionali.length}, com=${domandeComunali.length}`
        );
      }
    }

    const simulazione: DomandaPL[] = [
      ...shuffle(domandeCore).slice(0, nCore),
      ...shuffle(domandeRegionali).slice(0, nRegionale),
      ...shuffle(domandeComunali).slice(0, nComunale),
    ];

    return shuffle(simulazione);
  }, [domandeCore, domandeRegionali, domandeComunali, profilo?.parametriEsame, profilo?.composizioneQuiz]);

  // Quiz basato su un elenco di ID (es. per ripasso errori)
  const generaQuizId = useCallback((ids: string[]): DomandaPL[] => {
    const map = new Map(tutteLeDomande.map((d: DomandaPL) => [d.id, d]));
    const domande = ids.map(id => map.get(id)).filter((d): d is DomandaPL => d !== undefined);
    
    const mancanti = ids.length - domande.length;
    if (mancanti > 0) {
      console.warn(`${mancanti} domande non trovate nel pool disponibile (forse rimosse o non caricate)`);
    }

    return domande;
  }, [tutteLeDomande]);

  // Quiz per difficoltà
  const generaQuizDifficolta = useCallback((
    livello: 1 | 2 | 3,
    n: number = 20
  ): DomandaPL[] => {
    return shuffle(tutteLeDomande.filter((d: DomandaPL) => d.livelloDifficolta === livello)).slice(0, n);
  }, [tutteLeDomande]);

  return {
    generaQuizVeloce,
    generaQuizCategoria,
    generaQuizStrato,
    generaSimulazione,
    generaQuizId,
    generaQuizDifficolta,
    parametriEsame: profilo?.parametriEsame,
    composizioneQuiz: profilo?.composizioneQuiz, // ✅ Esponi anche questo
  };
}
