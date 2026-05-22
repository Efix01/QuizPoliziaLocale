import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { z } from 'zod';
import type { DomandaPL } from '../types/pl';
import type { RisultatoRisposta } from '../types/progressi';
import { useProgress } from '../context/ProgressContext';
import { usePL } from '../context/PLContext';
import { createAdaptiveState, aggiornaStatoAdattivo, selezionaDomandaAdattiva } from '../engine/AdaptiveDifficulty';

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
  customTimeLimit: z.number().optional(),
  antiAnxietyMode: z.boolean().optional(),
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
  parametri: {
    punteggioCorretta: number;
    punteggioErrata: number;
    punteggioNonData: number;
  };
};

// ===================================================
// Hook
// ===================================================

export const useQuizSession = () => {
  const location = useLocation();
  const { salvaRisultatoQuiz, erroriLog, srsData } = useProgress();
  const { profilo, tutteLeDomande } = usePL();

  // Validazione state con Zod
  const parsedState = QuizSessionStateSchema.safeParse(location.state);
  const validState = parsedState.success ? parsedState.data : null;
  
  // 🆕 Identifica se siamo in modalità simulazione ufficiale
  const isSimulationMode = validState?.mode === 'simulation_esame';
  const isDailyChallenge = validState?.mode === 'daily_challenge' || validState?.mode === 'allenamento_giornaliero';
  const antiAnxietyMode = validState?.antiAnxietyMode || false;

  const [sessionQuestions, setSessionQuestions] = useState<DomandaPL[]>(() => {
    if (!validState?.domande || validState.domande.length === 0) return [];
    return validState.domande as DomandaPL[];
  });

  const hasValidSession = sessionQuestions.length > 0;

  // Tracking navigazione e UI
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (location.state && typeof location.state === 'object' && 'resumeIndex' in location.state) {
      const idx = (location.state as any).resumeIndex;
      return typeof idx === 'number' ? idx : 0;
    }
    return 0;
  });
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [excludedOptions, setExcludedOptions] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  // Countdown timer per modalità simulazione o allenamenti con timer personalizzato
  const totalDurationSeconds = useMemo(() => {
    if (location.state && typeof location.state === 'object' && 'customTimeLimit' in location.state) {
      const c = (location.state as any).customTimeLimit;
      if (typeof c === 'number') return c;
    }
    return (profilo?.parametriEsame?.durataMinuti || 90) * 60;
  }, [profilo?.parametriEsame?.durataMinuti, location.state]);

  const [timeLeft, setTimeLeft] = useState(() => {
    if (antiAnxietyMode) return 0;
    if (location.state && typeof location.state === 'object' && 'savedTimeLeft' in location.state) {
      const t = (location.state as any).savedTimeLeft;
      if (typeof t === 'number') return t;
    }
    return totalDurationSeconds;
  });

  // Sync timer initialization once duration is loaded
  useEffect(() => {
    if (antiAnxietyMode) return;
    const hasCustomTimer = location.state && typeof location.state === 'object' && 'customTimeLimit' in location.state;
    if ((isSimulationMode || hasCustomTimer) && totalDurationSeconds > 0) {
      if (location.state && typeof location.state === 'object' && 'savedTimeLeft' in location.state) {
        return;
      }
      setTimeLeft(totalDurationSeconds);
    }
  }, [totalDurationSeconds, isSimulationMode, location.state, antiAnxietyMode]);

  // Registro risposte
  const [risposteDate, setRisposteDate] = useState<RisultatoRisposta[]>(() => {
    if (location.state && typeof location.state === 'object' && 'savedAnswers' in location.state) {
      const answers = (location.state as any).savedAnswers;
      if (Array.isArray(answers)) return answers;
    }
    
    // Per la simulazione d'esame, pre-popoliamo l'array con risposte non date (-1) per ciascuna domanda
    const isSim = location.state && typeof location.state === 'object' && (location.state as any).mode === 'simulation_esame';
    const questions = location.state && typeof location.state === 'object' && Array.isArray((location.state as any).domande) ? (location.state as any).domande : [];
    if (isSim && questions.length > 0) {
      return questions.map((q: any) => ({
        domandaId: q.id,
        categoriaId: q.categoriaId,
        corretta: false,
        indiceRispostaScelta: -1, // non data
        timestamp: new Date().toISOString(),
        tempoSpeso: 0,
      }));
    }
    return [];
  });
  const risposteRef = useRef<RisultatoRisposta[]>([]); // Ref parallelo per accesso sincrono
  const isSavingRef = useRef(false);

  // Sincronizza risposteRef con risposteDate
  useEffect(() => {
    if (risposteDate.length > 0) {
      risposteRef.current = [...risposteDate];
    }
  }, [risposteDate]);

  // Tracking tempo
  const startTimeRef = useRef<number>(Date.now());
  const tempoInizioDomandaRef = useRef<number>(Date.now());

  // Stato adattivo per la sessione corrente
  const [adaptiveState, setAdaptiveState] = useState(() => createAdaptiveState(2));

  // 🆕 Tracciamento degli indici visitati per la griglia della simulazione
  const [visitedIndexes, setVisitedIndexes] = useState<number[]>([0]);

  useEffect(() => {
    if (!visitedIndexes.includes(currentIndex)) {
      setVisitedIndexes(prev => [...prev, currentIndex]);
    }
  }, [currentIndex, visitedIndexes]);

  // 🆕 Quando cambia currentIndex in simulazione, carichiamo la risposta data precedentemente
  useEffect(() => {
    if (isSimulationMode && risposteDate[currentIndex]) {
      const rispostaScelta = risposteDate[currentIndex].indiceRispostaScelta;
      setSelectedOption(rispostaScelta === -1 ? null : rispostaScelta);
      setExcludedOptions([]);
    }
  }, [currentIndex, isSimulationMode, risposteDate]);

  const handleOptionSelect = (index: number) => {
    if (showAnswer) return;
    if (excludedOptions.includes(index)) return;
    setSelectedOption(index);

    // In modalità simulazione, salviamo immediatamente la scelta nell'array delle risposte
    if (isSimulationMode) {
      const currentQuestion = sessionQuestions[currentIndex];
      if (currentQuestion) {
        const isCorrect = index === currentQuestion.rispostaCorretta;
        const updatedAnswers = [...risposteRef.current];
        updatedAnswers[currentIndex] = {
          domandaId: currentQuestion.id,
          categoriaId: currentQuestion.categoriaId,
          corretta: isCorrect,
          indiceRispostaScelta: index,
          timestamp: new Date().toISOString(),
          tempoSpeso: updatedAnswers[currentIndex]?.tempoSpeso || 0,
        };
        risposteRef.current = updatedAnswers;
        setRisposteDate(updatedAnswers);
      }
    }
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

  // 🆕 Consegna manuale/esplicita della simulazione
  const consegnaSimulazione = useCallback(async () => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;

    // Assicura il salvataggio della domanda corrente se c'è una selezione attiva
    const currentQuestion = sessionQuestions[currentIndex];
    const updatedAnswers = [...risposteRef.current];
    if (currentQuestion && isSimulationMode) {
      const answerIndex = selectedOption !== null ? selectedOption : -1;
      const isCorrect = answerIndex === currentQuestion.rispostaCorretta;
      const tempoSpeso = Math.max(1, Math.round((Date.now() - tempoInizioDomandaRef.current) / 1000));
      updatedAnswers[currentIndex] = {
        domandaId: currentQuestion.id,
        categoriaId: currentQuestion.categoriaId,
        corretta: isCorrect,
        indiceRispostaScelta: answerIndex,
        timestamp: new Date().toISOString(),
        tempoSpeso: (updatedAnswers[currentIndex]?.tempoSpeso || 0) + tempoSpeso,
      };
    }

    setRisposteDate(updatedAnswers);
    setIsFinished(true);

    const simCompletate = Number(localStorage.getItem('simulazioni_completate') || '0');
    localStorage.setItem('simulazioni_completate', String(simCompletate + 1));

    try {
      await salvaRisultatoQuiz(updatedAnswers, { isDailyChallenge });
    } catch (e) {
      console.error('Errore consegna simulazione:', e);
      isSavingRef.current = false;
      setIsFinished(false);
    }
  }, [currentIndex, sessionQuestions, selectedOption, isSimulationMode, salvaRisultatoQuiz, isDailyChallenge]);

  const handleFeedback = useCallback(async (isSelfDeclaredCorrect: boolean, rating?: 'difficile' | 'medio' | 'facile') => {
    if (isSavingRef.current) return;

    const currentQuestion = sessionQuestions[currentIndex];
    if (!currentQuestion) return;

    const tempoSpeso = Math.max(1, Math.round((Date.now() - tempoInizioDomandaRef.current) / 1000));

    // Accumula il tempo di studio oggi in localStorage
    try {
      const oggiStr = new Date().toISOString().split('T')[0];
      const storedTime = localStorage.getItem('pl_study_time_today');
      let todayData = { date: oggiStr, seconds: 0 };
      if (storedTime) {
        const parsed = JSON.parse(storedTime);
        if (parsed.date === oggiStr) {
          todayData = parsed;
        }
      }
      todayData.seconds += tempoSpeso;
      localStorage.setItem('pl_study_time_today', JSON.stringify(todayData));
    } catch (e) {
      console.warn("Errore nell'accumulare il tempo di studio oggi:", e);
    }

    // Modalità Simulazione d'Esame: salviamo la risposta all'indice esatto e passiamo oltre
    if (isSimulationMode) {
      const answerIndex = selectedOption !== null ? selectedOption : -1;
      const isCorrect = answerIndex === currentQuestion.rispostaCorretta;
      const updatedAnswers = [...risposteRef.current];
      
      updatedAnswers[currentIndex] = {
        domandaId: currentQuestion.id,
        categoriaId: currentQuestion.categoriaId,
        corretta: isCorrect,
        indiceRispostaScelta: answerIndex,
        timestamp: new Date().toISOString(),
        tempoSpeso: (updatedAnswers[currentIndex]?.tempoSpeso || 0) + tempoSpeso,
      };

      risposteRef.current = updatedAnswers;
      setRisposteDate(updatedAnswers);

      if (currentIndex < sessionQuestions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        window.scrollTo(0, 0);
      } else {
        // Ultima domanda: avvia il completamento
        isSavingRef.current = true;
        setIsFinished(true);
        const simCompletate = Number(localStorage.getItem('simulazioni_completate') || '0');
        localStorage.setItem('simulazioni_completate', String(simCompletate + 1));
        try {
          await salvaRisultatoQuiz(updatedAnswers, { isDailyChallenge });
        } catch (e) {
          console.error('Errore salvataggio simulazione alla fine:', e);
          isSavingRef.current = false;
          setIsFinished(false);
        }
      }
      return;
    }

    const isActuallyCorrect = (selectedOption === currentQuestion.rispostaCorretta) && isSelfDeclaredCorrect;

    const nuovoRisultato: RisultatoRisposta = {
      domandaId: currentQuestion.id,
      categoriaId: currentQuestion.categoriaId,
      corretta: isActuallyCorrect,
      indiceRispostaScelta: selectedOption !== null ? selectedOption : -1,
      timestamp: new Date().toISOString(),
      srsDifficulty: rating,
      tempoSpeso,
    };

    // Aggiorna il ref sincrono PRIMA dello state
    risposteRef.current = [...risposteRef.current, nuovoRisultato];

    // Aggiorna lo stato adattivo della sessione
    let newAdaptiveState = adaptiveState;
    setAdaptiveState(prev => {
      newAdaptiveState = aggiornaStatoAdattivo(prev, isActuallyCorrect);
      return newAdaptiveState;
    });

    if (currentIndex < sessionQuestions.length - 1) {
      setRisposteDate(risposteRef.current);
      
      const nextIndex = currentIndex + 1;
      // Adatta la prossima domanda in corsa se la difficoltà è cambiata (solo in allenamento normale, non in simulazione)
      if (!isSimulationMode && newAdaptiveState.currentDifficulty !== adaptiveState.currentDifficulty) {
        const poolCategoria = tutteLeDomande.filter(d => d.categoriaId === currentQuestion.categoriaId);
        const poolCandidati = poolCategoria.length >= 5 ? poolCategoria : tutteLeDomande;

        // Domande mostrate finora in questa sessione
        const sessionShownIds = new Set(sessionQuestions.slice(0, nextIndex).map(q => q.id));
        const tempState = {
          ...newAdaptiveState,
          shownIds: sessionShownIds
        };

        const nuovaDomanda = selezionaDomandaAdattiva(poolCandidati, tempState, erroriLog, srsData);
        if (nuovaDomanda) {
          setSessionQuestions(prev => {
            const copy = [...prev];
            copy[nextIndex] = nuovaDomanda;
            return copy;
          });
        }
      }

      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
      setSelectedOption(null);
      setExcludedOptions([]);
      window.scrollTo(0, 0);
    } else {
      isSavingRef.current = true;

      // Usa il ref — garantito contenere tutti i risultati senza dipendere dallo state
      const registroFinale = risposteRef.current;
      setRisposteDate(registroFinale);
      setIsFinished(true);

      try {
        await salvaRisultatoQuiz(registroFinale, { isDailyChallenge });
      } catch (e) {
        console.error('Errore salvataggio sessione:', e);
        isSavingRef.current = false;
        setIsFinished(false);
      }
    }
  }, [currentIndex, sessionQuestions, selectedOption, salvaRisultatoQuiz, adaptiveState, tutteLeDomande, erroriLog, srsData, isSimulationMode, isDailyChallenge]);

  // Invio automatico allo scadere del tempo
  const handleAutoSubmit = useCallback(async () => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;

    // Riempi le risposte mancanti come non date (-1)
    const compilarisposte = [...risposteRef.current];
    for (let i = compilarisposte.length; i < sessionQuestions.length; i++) {
      const q = sessionQuestions[i];
      compilarisposte.push({
        domandaId: q.id,
        categoriaId: q.categoriaId,
        corretta: false,
        indiceRispostaScelta: -1,
        timestamp: new Date().toISOString(),
      });
    }

    risposteRef.current = compilarisposte;
    setRisposteDate(compilarisposte);
    setIsFinished(true);

    try {
      await salvaRisultatoQuiz(compilarisposte, { isDailyChallenge });
    } catch (e) {
      console.error('Errore salvataggio automatico sessione scaduta:', e);
      isSavingRef.current = false;
      setIsFinished(false);
    }
  }, [sessionQuestions, salvaRisultatoQuiz, isDailyChallenge]);

  // Resetta il tempo inizio domanda al cambio di domanda
  useEffect(() => {
    tempoInizioDomandaRef.current = Date.now();
  }, [currentIndex]);

  // Gestione countdown del timer
  useEffect(() => {
    if (antiAnxietyMode) return;
    const hasCustomTimer = location.state && typeof location.state === 'object' && 'customTimeLimit' in location.state;
    if ((!isSimulationMode && !hasCustomTimer) || isFinished) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulationMode, isFinished, handleAutoSubmit, location.state, antiAnxietyMode]);

  // Salva lo stato della sessione attiva in localStorage per consentire il ripristino
  useEffect(() => {
    if (hasValidSession && !isFinished) {
      localStorage.setItem('pl_active_session', JSON.stringify({
        state: {
          domande: sessionQuestions,
          mode: validState?.mode,
          categoriaId: validState?.categoriaId,
          strato: validState?.strato,
          customTimeLimit: validState?.customTimeLimit,
          antiAnxietyMode: validState?.antiAnxietyMode
        },
        currentIndex,
        risposteDate,
        timeLeft,
        timestamp: Date.now()
      }));
    }
  }, [hasValidSession, currentIndex, isFinished, sessionQuestions, validState, risposteDate, timeLeft]);

  // Rimuove la sessione quando viene completata
  useEffect(() => {
    if (isFinished) {
      localStorage.removeItem('pl_active_session');
    }
  }, [isFinished]);

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

      if (!risposta || risposta.indiceRispostaScelta === -1) {
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
      parametri: params,
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

    // 🆕 Risultati e modalità
    risultati,
    risposteDate,
    isSimulationMode,
    isDailyChallenge,
    antiAnxietyMode,
    sessionMode: validState?.mode ?? 'free',
    timeLeft,
    totalDurationSeconds,
    consecutiveWrong: adaptiveState.consecutiveWrong,
    
    // 🆕 Esporta per navigazione griglia simulazione
    setCurrentIndex,
    visitedIndexes,
    consegnaSimulazione,
  };
};
