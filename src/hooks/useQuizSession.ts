import { useState, useCallback, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import type { DomandaPL } from '../types/pl';
import type { RisultatoRisposta } from '../types/progressi';
import { useProgress } from '../context/ProgressContext';
import { useQuizTimer } from './useQuizTimer';

import { z } from 'zod';
import { DomandaPLSchema } from '../types/pl';

const QuizSessionStateSchema = z.object({
  domande: z.array(DomandaPLSchema).min(1),
  mode: z.string().optional(),
  categoriaId: z.string().optional(),
  strato: z.enum(['core', 'regionale', 'comunale']).optional(),
  durataMinuti: z.number().optional(),
}).nullable();

export const useQuizSession = () => {
    const location = useLocation();
    const { salvaRisultatoQuiz } = useProgress();

    // Validazione rigorosa del location.state tramite Zod
    const parsedState = QuizSessionStateSchema.safeParse(location.state);
    const state = parsedState.success ? parsedState.data : null;
    
    // Le domande arrivano già pre-filtrate e mescolate (shuffle) dal chiamante
    const [sessionQuestions] = useState<DomandaPL[]>(() => {
        if (!state?.domande || state.domande.length === 0) return [];
        return state.domande;
    });

    const hasValidSession = sessionQuestions.length > 0;
    
    // Tracking di navigazione e UI Flashcard
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [excludedOptions, setExcludedOptions] = useState<number[]>([]);
    const [isFinished, setIsFinished] = useState(false);
    
    // Stati di controllo asincrono
    const [isPending, setIsPending] = useState(false);
    const isSavingRef = useRef(false);
    
    // Registro risposte momentaneo (da inviare al completamento)
    const [risposteDate, setRisposteDate] = useState<RisultatoRisposta[]>([]);

    /**
     * Finalizza la sessione salvando i dati su Firebase.
     * Può essere chiamata al termine delle domande o alla scadenza del timer.
     */
    const finalizzaSessione = useCallback(async (registroAttuale: RisultatoRisposta[]) => {
        if (isSavingRef.current) return;
        
        isSavingRef.current = true;
        setIsPending(true);
        setIsFinished(true);

        try {
            await salvaRisultatoQuiz(registroAttuale);
            sessionStorage.removeItem('quiz_session_backup');
        } catch (error) {
            console.error('Errore durante il salvataggio della sessione:', error);
            isSavingRef.current = false;
            setIsFinished(false);
            alert("Errore nel salvataggio dei progressi. Riprova.");
        } finally {
            setIsPending(false);
        }
    }, [salvaRisultatoQuiz]);

    // Integrazione Timer
    const { secondiRimasti, isExpired, formattedTime, stopTimer } = useQuizTimer(
        state?.durataMinuti || 0,
        () => finalizzaSessione(risposteDate)
    );

    const handleOptionSelect = (index: number) => {
        if (showAnswer || isPending || isExpired) return;
        if (excludedOptions.includes(index)) return;
        setSelectedOption(index);
    };

    const toggleExclusion = (e: React.MouseEvent, index: number) => {
        e.stopPropagation();
        if (showAnswer || isPending || isExpired) return;

        if (excludedOptions.includes(index)) {
            setExcludedOptions(prev => prev.filter(k => k !== index));
        } else {
            setExcludedOptions(prev => [...prev, index]);
            if (selectedOption === index) setSelectedOption(null);
        }
    };

    const handleCheck = () => {
        if (selectedOption === null || isPending || isExpired) return;
        setShowAnswer(true);
    };

    const handleFeedback = useCallback(async (isSelfDeclaredCorrect: boolean) => {
        if (isPending || isSavingRef.current || isExpired) return;
        
        const currentQuestion = sessionQuestions[currentIndex];
        if (!currentQuestion) return;

        setIsPending(true);

        try {
            // Se ha selezionato l'opzione corretta E dichiara "Sapevo" = vera risposta corretta
            const isActuallyCorrect = (selectedOption === currentQuestion.rispostaCorretta) && isSelfDeclaredCorrect;

            const nuovoRisultato: RisultatoRisposta = {
                domandaId: currentQuestion.id,
                categoriaId: currentQuestion.categoriaId,
                corretta: isActuallyCorrect,
                indiceRispostaScelta: selectedOption !== null ? selectedOption : 0,
                timestamp: new Date().toISOString()
            };

            // Calcoliamo il nuovo registro in modo deterministico
            const nuovoRegistro = [...risposteDate, nuovoRisultato];
            setRisposteDate(nuovoRegistro);

            const isLastQuestion = currentIndex >= sessionQuestions.length - 1;

            if (!isLastQuestion) {
                 // Passa alla prossima card
                setCurrentIndex(prev => prev + 1);
                setShowAnswer(false);
                setSelectedOption(null);
                setExcludedOptions([]);
                window.scrollTo(0, 0);
            } else {
                 // Fine delle domande: stop al timer e finalizza
                 stopTimer();
                 await finalizzaSessione(nuovoRegistro);
            }
        } finally {
            setIsPending(false);
        }
    }, [currentIndex, sessionQuestions, selectedOption, risposteDate, isPending, isExpired, finalizzaSessione, stopTimer]);

    // Calcolo Strategia / Probabilità di successo
    const calculateStrategy = useCallback((totalOptions: number) => {
        const excludedCount = excludedOptions.length;
        const remaining = totalOptions - excludedCount;
        if (remaining <= 0) return null;
        if (remaining === 1) return { type: 'positive' as const, ev: 0.50, text: "Risposta Certa (+1.00)" };

        const prob = 1 / remaining;
        // Ponderazione standard
        const ev = (prob * 1.0) + ((1 - prob) * -0.25);

        if (ev > 0.1) return { type: 'positive' as const, ev, text: `EV Positivo (+${ev.toFixed(2)}). Conviene Tentare!` };
        if (ev > -0.01) return { type: 'neutral' as const, ev, text: `EV Marginale (${ev.toFixed(2)}). Rischio Medio.` };
        return { type: 'negative' as const, ev, text: `EV Negativo (${ev.toFixed(2)}). Meglio fermarsi.` };
    }, [excludedOptions]);

    const progressDisplay = `${currentIndex + 1}/${sessionQuestions.length}`;
    const progressPercentage = sessionQuestions.length > 0 ? ((currentIndex + 1) / sessionQuestions.length) * 100 : 0;

    // Persistenza intermedia per evitare perdite di dati (ogni 5 risposte)
    // Utile per sessioni lunghe in caso di crash o refresh
    useEffect(() => {
        if (risposteDate.length > 0 && risposteDate.length % 5 === 0) {
            const backup = {
                questionIds: sessionQuestions.map(q => q.id),
                risposteDate,
                currentIndex,
                timestamp: Date.now()
            };
            sessionStorage.setItem('quiz_session_backup', JSON.stringify(backup));
        }
    }, [risposteDate, currentIndex, sessionQuestions]);

    return {
        hasValidSession,
        sessionQuestions,
        currentQuestion: sessionQuestions[currentIndex],
        currentIndex,
        showAnswer,
        selectedOption,
        excludedOptions,
        isFinished,
        isPending,
        handleOptionSelect,
        toggleExclusion,
        handleCheck,
        handleFeedback,
        calculateStrategy,
        progressDisplay,
        progressPercentage,
        sessionMode: state?.mode ?? 'free',
        sessionCategoriaId: state?.categoriaId ?? null,
        sessionStrato: state?.strato ?? null,
        // Timer Props
        formattedTime,
        secondiRimasti,
        isExpired
    };
};
