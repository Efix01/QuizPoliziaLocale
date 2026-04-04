import { useState, useCallback, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { z } from 'zod';
import type { DomandaPL } from '../types/pl';
import type { RisultatoRisposta } from '../types/progressi';
import { useProgress } from '../context/ProgressContext';
import { usePL } from '../context/PLContext';

// ===================================================
// Schema validazione state (fuori dall'hook — stabile)
// ===================================================

const QuizSessionStateSchema = z.object({
  domande: z.array(z.object({
    id: z.string(),
    strato: z.enum(['core', 'regionale', 'comunale']),
    categoriaId: z.string(),
    categoria: z.string().optional(), // nome leggibile
    testo: z.string(),
    opzioni: z.array(z.string()).length(4),
    rispostaCorretta: z.number().int().min(0).max(3),
    spiegazione: z.string(),
  }).passthrough()).min(1),
  mode: z.string().optional(),
  categoriaId: z.string().optional(),
  strato: z.enum(['core', 'regionale', 'comunale']).optional(),
});

type StrategyResult = {
  type: 'positive' | 'neutral' | 'negative';
  ev: number;
  text: string;
} | null;

// ===================================================
// Tipo risultati calcolati
// ===================================================

export type QuizRisultati = {
  punteggioTotale: number;
  percentuale: number;
  corrette: number;
  errate: number;
  nonDate: number;
  tempo: number; // secondi
  statsByLayer: {
    core: { corrette: number; totali: number; percentuale: number };
    regionale: { corrette: number; totali: number; percentuale: number };
    comunale: { corrette: number; totali: number; percentuale: number };
  };
  categorieDeboli: Array<{
    nome: string;
    layer: 'core' | 'regionale' | 'comunale';
    percentuale: number;
    corrette: number;
    totali: number;
  }>;
};

// ===================================================
// Hook
// ===================================================

export const useQuizSession = () => {
  const location = useLocation();
  const { salvaRisultatoQuiz } = useProgress();
  const { profilo } = usePL();

  // Validazione state con Zod
  const parsedState = QuizSessionStateSchema.safeParse(location.state);
  const validState = parsedState.success ? parsedState.data : null;

  const [sessionQuestions] = useState<DomandaPL[]>(() => {
    if (!validState?.domande || validState.domande.length === 0) return [];
    return validState.domande as DomandaPL[];
  });

  const hasValidSession = sessionQuestions.length > 0;

  // Tracking navigazione e UI
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [excludedOptions, setExcludedOptions] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  // Registro risposte
  const [risposteDate, setRisposteDate] = useState<RisultatoRisposta[]>([]);
  const isSavingRef = useRef(false);

  // Tracking tempo
  const startTimeRef = useRef<number>(Date.now());

  const handleOptionSelect = (index: number) => {
    if (showAnswer) return;
    if (excludedOptions.includes(index)) return;
    setSelectedOption(index);
  };

  const toggleExclusion = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (showAnswer) return;

    if (excludedOptions.includes(index)) {
      setExcludedOptions(prev => prev.filter(k => k !== index));
    } else {
      setExcludedOptions(prev => [...prev, index]);
      if (selectedOption === index) setSelectedOption(null);
    }
  };

  const handleCheck = () => {
    if (selectedOption === null) return;
    setShowAnswer(true);
  };

  const handleFeedback = useCallback(async (isSelfDeclaredCorrect: boolean) => {
    if (isSavingRef.current) return;

    const currentQuestion = sessionQuestions[currentIndex];
    if (!currentQuestion) return;

    const isActuallyCorrect = (selectedOption === currentQuestion.rispostaCorretta) && isSelfDeclaredCorrect;

    const nuovoRisultato: RisultatoRisposta = {
      domandaId: currentQuestion.id,
      categoriaId: currentQuestion.categoriaId,
      corretta: isActuallyCorrect,
      indiceRispostaScelta: selectedOption !== null ? selectedOption : 0,
      timestamp: new Date().toISOString(),
    };

    if (currentIndex < sessionQuestions.length - 1) {
      setRisposteDate(prev => [...prev, nuovoRisultato]);
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
      setSelectedOption(null);
      setExcludedOptions([]);
      window.scrollTo(0, 0);
    } else {
      isSavingRef.current = true;

      let registroFinale: RisultatoRisposta[] = [];
      setRisposteDate(prev => {
        registroFinale = [...prev, nuovoRisultato];
        return registroFinale;
      });

      setIsFinished(true);

      try {
        await salvaRisultatoQuiz(registroFinale);
      } catch (e) {
        console.error('Errore salvataggio sessione:', e);
        isSavingRef.current = false;
        setIsFinished(false);
      }
    }
  }, [currentIndex, sessionQuestions, selectedOption, salvaRisultatoQuiz]);

  const calculateStrategy = useCallback((totalOptions: number): StrategyResult => {
    const remaining = totalOptions - excludedOptions.length;

    if (remaining <= 0) return null;
    if (remaining === 1) return { type: 'positive', ev: 1.00, text: 'Risposta Certa (+1.00)' };

    const prob = 1 / remaining;
    const ev = (prob * 1.0) + ((1 - prob) * -0.25);

    if (ev > 0.1) return { type: 'positive', ev, text: `EV Positivo (+${ev.toFixed(2)}). Conviene tentare!` };
    if (ev > -0.01) return { type: 'neutral', ev, text: `EV Marginale (${ev.toFixed(2)}). Rischio medio.` };
    return { type: 'negative', ev, text: `EV Negativo (${ev.toFixed(2)}). Meglio fermarsi.` };
  }, [excludedOptions]);

  // ===================================================
  // 🆕 CALCOLO RISULTATI — memoizzato
  // ===================================================

  const risultati = useMemo((): QuizRisultati | null => {
    if (!isFinished || risposteDate.length === 0) return null;

    const params = profilo?.parametriEsame ?? {
      punteggioCorretta: 1,
      punteggioErrata: -0.25,
      punteggioNonData: 0,
    };

    let corrette = 0;
    let errate = 0;
    let nonDate = 0;
    let punteggioTotale = 0;

    const statsByLayer = {
      core: { corrette: 0, totali: 0, percentuale: 0 },
      regionale: { corrette: 0, totali: 0, percentuale: 0 },
      comunale: { corrette: 0, totali: 0, percentuale: 0 },
    };

    const statsByCategoria = new Map<string, { 
      corrette: number; 
      totali: number; 
      nome: string; 
      layer: 'core' | 'regionale' | 'comunale' 
    }>();

    sessionQuestions.forEach((domanda, idx) => {
      const risposta = risposteDate[idx];
      const layer = domanda.strato;

      // Incrementa totali per layer
      statsByLayer[layer].totali++;

      // Stats per categoria
      const catKey = domanda.categoriaId;
      if (!statsByCategoria.has(catKey)) {
        statsByCategoria.set(catKey, {
          corrette: 0,
          totali: 0,
          nome: catKey, // usa l'ID come nome (non c'è attualmente un catalogo nomi nell'hook)
          layer,
        });
      }
      const catStats = statsByCategoria.get(catKey)!;
      catStats.totali++;

      if (!risposta) {
        // Non data
        nonDate++;
        punteggioTotale += params.punteggioNonData;
      } else if (risposta.corretta) {
        // Corretta
        corrette++;
        punteggioTotale += params.punteggioCorretta;
        statsByLayer[layer].corrette++;
        catStats.corrette++;
      } else {
        // Errata
        errate++;
        punteggioTotale += params.punteggioErrata;
      }
    });

    // Calcola percentuali per layer
    (Object.keys(statsByLayer) as Array<keyof typeof statsByLayer>).forEach(layer => {
      const stats = statsByLayer[layer];
      stats.percentuale = stats.totali > 0 ? Math.round((stats.corrette / stats.totali) * 100) : 0;
    });

    // Identifica categorie deboli (< 60% e almeno 3 domande)
    const categorieDeboli = Array.from(statsByCategoria.values())
      .map(cat => ({
        nome: cat.nome,
        layer: cat.layer,
        corrette: cat.corrette,
        totali: cat.totali,
        percentuale: cat.totali > 0 ? Math.round((cat.corrette / cat.totali) * 100) : 0,
      }))
      .filter(cat => cat.percentuale < 60 && cat.totali >= 3)
      .sort((a, b) => a.percentuale - b.percentuale); // peggiori prima

    const percentuale = sessionQuestions.length > 0 
      ? Math.round((corrette / sessionQuestions.length) * 100) 
      : 0;

    const tempoTrascorso = Math.floor((Date.now() - startTimeRef.current) / 1000);

    return {
      punteggioTotale: Math.round(punteggioTotale * 100) / 100, // arrotonda a 2 decimali
      percentuale,
      corrette,
      errate,
      nonDate,
      tempo: tempoTrascorso,
      statsByLayer,
      categorieDeboli,
    };
  }, [isFinished, risposteDate, sessionQuestions, profilo?.parametriEsame]);

  // ===================================================
  // Progress display
  // ===================================================

  const progressDisplay = `${currentIndex + 1}/${sessionQuestions.length}`;
  const progressPercentage = sessionQuestions.length > 0
    ? (risposteDate.length / sessionQuestions.length) * 100
    : 0;

  return {
    sessionQuestions,
    currentQuestion: sessionQuestions[currentIndex],
    currentIndex,
    hasValidSession,
    isFinished,

    showAnswer,
    selectedOption,
    excludedOptions,

    handleOptionSelect,
    toggleExclusion,
    handleCheck,
    handleFeedback,

    calculateStrategy,

    progressDisplay,
    progressPercentage,

    sessionMode: validState?.mode ?? 'free',
    sessionCategoriaId: validState?.categoriaId ?? null,
    sessionStrato: validState?.strato ?? null,

    // 🆕 Risultati calcolati
    risultati,
  };
};
