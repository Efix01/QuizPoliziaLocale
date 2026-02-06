import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { type QuizQuestion } from '../types';

export const useQuizSession = () => {
    const location = useLocation();
    // const navigate = useNavigate(); // Unused
    const { getQuestionsForStudy, answerQuestion, todayAnsweredCount } = useQuiz();

    const state = location.state as { category?: string; count?: number; forceNew?: boolean };
    const categoryFilter = state?.category;
    const requestedCount = state?.count;
    const forceNew = state?.forceNew;

    const [sessionQuestions] = useState<QuizQuestion[]>(() => {
        const todayCount = todayAnsweredCount;

        // Logic duplicated for init
        const categoryList = categoryFilter && categoryFilter !== 'Sfida del Giorno' ? [categoryFilter] : undefined;
        let questionCount = 10;
        if (requestedCount) {
            questionCount = requestedCount;
        } else if (categoryFilter) {
            questionCount = 30;
        }
        // Daily Challenge Cap enforcement
        if (categoryFilter === 'Sfida del Giorno') {
            if (todayCount > 0 && todayCount % 20 === 0 && !forceNew) {
                questionCount = 0;
            } else {
                const remaining = 20 - (todayCount % 20);
                questionCount = Math.min(questionCount, remaining);
            }
        }
        return getQuestionsForStudy(questionCount, categoryList);
    });

    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [excludedOptions, setExcludedOptions] = useState<string[]>([]);
    const [isFinished, setIsFinished] = useState(false);

    // We still need to watch for URL/Location changes if the user navigates *within* the component (unlikely for useQuizSession which suggests a page mount).
    // If we assume this hook is for a page that remounts on nav, lazy init is enough.
    // However, if we navigate from /study?cat=A to /study?cat=B without unmounting?
    // React Router usually avoids that unless using same component keys.
    // Let's keep a simplified Effect for updates IF properties change, but guard against initial run?
    // Or just use `useEffect` safely with a condition comparison? 
    // Actually, `getQuestionsForStudy` logic in effect causes double render.
    // The previous implementation was FULLY DRIVEN by effect.
    // Refactoring to `useMemo` for the questions might be risky if `getQuestionsForStudy` is not pure (it randomizes).
    // `useMemo` shouldn't have side effects.
    // The best approach for "Clean Code" here is lazy init for first render, and effect for *subsequent* changes.
    // OR: just suppress the lint if we accept one double-render on mount. 
    // But since we are auditing for performance: lazy init is best.

    // NOTE: 'todayAnsweredCount', 'getQuestionsForStudy' come from context.
    // We'll rely on lazy init. If context changes, we might want to re-fetch?
    // `getQuestionsForStudy` returns new questions every time. We don't want re-fetch on every render.
    // Only on mount or Location change.

    useEffect(() => {
        // This effect handles updates if location changes.
        // We can leave it empty if we don't expect prop changes without remount.
        // But let's support params change.
    }, [location.state]); // Placeholder or remove.

    // Implementation: Just use lazy init and remove the effect logic for fetching questions.
    // Assuming component remounts on navigation.

    const handleOptionSelect = (key: string) => {
        if (showAnswer) return;
        if (excludedOptions.includes(key)) return;
        setSelectedOption(key);
    };

    const toggleExclusion = (e: React.MouseEvent, key: string) => {
        e.stopPropagation();
        if (showAnswer) return;

        if (excludedOptions.includes(key)) {
            setExcludedOptions(prev => prev.filter(k => k !== key));
        } else {
            setExcludedOptions(prev => [...prev, key]);
            if (selectedOption === key) setSelectedOption(null);
        }
    };

    const handleCheck = () => {
        setShowAnswer(true);
    };

    const handleFeedback = (correct: boolean) => {
        const currentQuestion = sessionQuestions[currentIndex];
        if (!currentQuestion) return;

        answerQuestion(currentQuestion.id, correct);

        if (currentIndex < sessionQuestions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setShowAnswer(false);
            setSelectedOption(null);
            setExcludedOptions([]);
            window.scrollTo(0, 0);
        } else {
            setIsFinished(true);
        }
    };

    // Calculate Strategy (EV)
    const calculateStrategy = (totalOptions: number) => {
        const excludedCount = excludedOptions.length;
        const remaining = totalOptions - excludedCount;
        if (remaining <= 0) return null;
        if (remaining === 1) return { type: 'positive', ev: 0.50, text: "Risposta Certa (+0.50)" };

        const prob = 1 / remaining;
        const ev = (prob * 0.50) + ((1 - prob) * -0.17);

        if (ev > 0.1) return { type: 'positive', ev, text: `EV Positivo (+${ev.toFixed(2)}). Conviene Tentare!` };
        if (ev > -0.01) return { type: 'neutral', ev, text: `EV Marginale (${ev.toFixed(2)}). Rischio Medio.` };
        return { type: 'negative', ev, text: `EV Negativo (${ev.toFixed(2)}). Meglio lasciare in bianco.` };
    };

    // Progress Calculation
    let progressDisplay = `${currentIndex + 1}/${sessionQuestions.length}`;
    let progressPercentage = ((currentIndex) / sessionQuestions.length) * 100;

    if (categoryFilter === 'Sfida del Giorno') {
        const currentCycleIndex = ((todayAnsweredCount) % 20) + 1;
        progressDisplay = `Domanda ${currentCycleIndex}/20`;
        progressPercentage = (currentCycleIndex / 20) * 100;
    }

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
        categoryFilter,
        forceNew,
        todayAnsweredCount, // needed for 'Study Again' button Logic
    };
};
