import { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import type { DomandaPL } from '../types/pl';
import type { RisultatoRisposta } from '../types/progressi';
import { useProgress } from '../context/ProgressContext';

export const useQuizSession = () => {
    const location = useLocation();
    const { salvaRisultatoQuiz } = useProgress();

    // Estraiamo i dati di configurazione inviati dal QuickQuizMenu
    const state = location.state as { 
        domande?: DomandaPL[]; 
        mode?: string; 
        categoriaId?: string; 
        strato?: string 
    };
    
    // Le domande arrivano già pre-filtrate e mescolate (shuffle) dal chiamante
    const [sessionQuestions] = useState<DomandaPL[]>(() => state?.domande || []);
    
    // Tracking di navigazione e UI Flashcard
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [excludedOptions, setExcludedOptions] = useState<number[]>([]);
    const [isFinished, setIsFinished] = useState(false);
    
    // Registro risposte momentaneo (da inviare al completamento)
    const [risposteDate, setRisposteDate] = useState<RisultatoRisposta[]>([]);

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
        const currentQuestion = sessionQuestions[currentIndex];
        if (!currentQuestion) return;

        // Se ha selezionato l'opzione corretta E dichiara "Sapevo" = vera risposta corretta
        const isActuallyCorrect = (selectedOption === currentQuestion.rispostaCorretta) && isSelfDeclaredCorrect;

        const nuovoRisultato: RisultatoRisposta = {
            domandaId: currentQuestion.id,
            categoriaId: currentQuestion.categoriaId,
            corretta: isActuallyCorrect,
            rispostaData: selectedOption !== null ? selectedOption : 0
        };

        const nuovoRegistro = [...risposteDate, nuovoRisultato];
        setRisposteDate(nuovoRegistro);

        if (currentIndex < sessionQuestions.length - 1) {
             // Passa alla prossima card
            setCurrentIndex(prev => prev + 1);
            setShowAnswer(false);
            setSelectedOption(null);
            setExcludedOptions([]);
            window.scrollTo(0, 0);
        } else {
             // Sessione Finita, salva su Firebase!
            setIsFinished(true);
            await salvaRisultatoQuiz(nuovoRegistro);
        }
    }, [currentIndex, sessionQuestions, selectedOption, risposteDate, salvaRisultatoQuiz]);

    // Calcolo Strategia / Probabilità di successo
    const calculateStrategy = (totalOptions: number) => {
        const excludedCount = excludedOptions.length;
        const remaining = totalOptions - excludedCount;
        if (remaining <= 0) return null;
        if (remaining === 1) return { type: 'positive', ev: 0.50, text: "Risposta Certa (+1.00)" };

        const prob = 1 / remaining;
        // Ponderazione standard
        const ev = (prob * 1.0) + ((1 - prob) * -0.25);

        if (ev > 0.1) return { type: 'positive', ev, text: `EV Positivo (+${ev.toFixed(2)}). Conviene Tentare!` };
        if (ev > -0.01) return { type: 'neutral', ev, text: `EV Marginale (${ev.toFixed(2)}). Rischio Medio.` };
        return { type: 'negative', ev, text: `EV Negativo (${ev.toFixed(2)}). Meglio fermarsi.` };
    };

    const progressDisplay = `${currentIndex + 1}/${sessionQuestions.length}`;
    const progressPercentage = sessionQuestions.length > 0 ? (currentIndex / sessionQuestions.length) * 100 : 0;

    return {
        sessionQuestions,
        currentQuestion: sessionQuestions[currentIndex],
        currentIndex,
        showAnswer,
        selectedOption,
        excludedOptions,
        isFinished,
        handleOptionSelect,
        toggleExclusion,
        handleCheck,
        handleFeedback,
        calculateStrategy,
        progressDisplay,
        progressPercentage,
        categoryFilter: state?.mode === 'categoria' ? state.categoriaId : (state?.mode || ''),
    };
};
