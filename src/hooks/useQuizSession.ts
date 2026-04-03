import { useState, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { z } from 'zod';
import type { DomandaPL } from '../types/pl';
import type { RisultatoRisposta } from '../types/progressi';
import { useProgress } from '../context/ProgressContext';

// Schema validazione state (fuori dall'hook — stabile)
const QuizSessionStateSchema = z.object({
  domande: z.array(z.object({
    id: z.string(),
    strato: z.enum(['core', 'regionale', 'comunale']),
    categoriaId: z.string(),
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

export const useQuizSession = () => {
  const location = useLocation();
  const { salvaRisultatoQuiz } = useProgress();

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
  };
};
