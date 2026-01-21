import React, { createContext, useContext, useEffect, useState } from 'react';
import { type QuizQuestion, type QuizState, type UserProgressData, type UserStats } from '../types';

// Initial Stats
const INITIAL_STATS: UserStats = {
    totalAnswered: 0,
    correctCount: 0,
    currentStreak: 0,
    bestStreak: 0,
    level: 1,
    xp: 0,
    badges: []
};

interface QuizContextType extends QuizState {
    answerQuestion: (questionId: number, isCorrect: boolean) => void;
    resetProgress: () => void;
    getQuestionsForStudy: (count?: number, categoryFilter?: string[]) => QuizQuestion[];
    addCustomQuestion: (question: QuizQuestion) => void;
    editQuestion: (question: QuizQuestion) => void;
    hideQuestion: (questionId: number) => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const useQuiz = () => {
    const context = useContext(QuizContext);
    if (!context) {
        throw new Error('useQuiz must be used within a QuizProvider');
    }
    return context;
};

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<QuizState>({
        questions: [],
        userProgress: {},
        stats: INITIAL_STATS,
        loading: true,
        error: null
    });

    // Load Data on Mount
    useEffect(() => {
        const loadData = async () => {
            try {
                // Lazy load quiz data
                const quizModule = await import('../data/domande_quiz.json');
                const quizDataRaw = quizModule.default as QuizQuestion[];

                // Load Questions
                const savedCustom = localStorage.getItem('forestali_custom_questions');
                const savedHidden = localStorage.getItem('forestali_hidden_questions');
                const savedModified = localStorage.getItem('forestali_modified_questions');

                const customQuestions: QuizQuestion[] = savedCustom ? JSON.parse(savedCustom) : [];
                const hiddenIds: number[] = savedHidden ? JSON.parse(savedHidden) : [];
                const modifiedQuestionsMap: Record<number, QuizQuestion> = savedModified ? JSON.parse(savedModified) : {};

                // Merge and Filter
                // 1. Combine Raw + Custom
                let allQuestions = [...quizDataRaw, ...customQuestions];

                // 2. Apply Modifications
                allQuestions = allQuestions.map(q => modifiedQuestionsMap[q.id] ? modifiedQuestionsMap[q.id] : q);

                // 3. Filter Hidden
                const activeQuestions = allQuestions.filter(q => !hiddenIds.includes(q.id));

                // Load Progress
                const savedProgress = localStorage.getItem('forestali_progress');
                const savedStats = localStorage.getItem('forestali_stats');

                setState(prev => ({
                    ...prev,
                    questions: activeQuestions,
                    userProgress: savedProgress ? JSON.parse(savedProgress) : {},
                    stats: savedStats ? JSON.parse(savedStats) : INITIAL_STATS,
                    loading: false
                }));
            } catch (err) {
                setState(prev => ({ ...prev, error: 'Failed to load quiz data', loading: false }));
            }
        };

        loadData();
    }, []);

    // Persist Data on Change
    useEffect(() => {
        if (!state.loading) {
            localStorage.setItem('forestali_progress', JSON.stringify(state.userProgress));
            localStorage.setItem('forestali_stats', JSON.stringify(state.stats));
        }
    }, [state.userProgress, state.stats, state.loading]);

    const addCustomQuestion = (question: QuizQuestion) => {
        // Save to LocalStorage
        const savedCustom = localStorage.getItem('forestali_custom_questions');
        const customQuestions: QuizQuestion[] = savedCustom ? JSON.parse(savedCustom) : [];
        const updatedCustom = [...customQuestions, question];
        localStorage.setItem('forestali_custom_questions', JSON.stringify(updatedCustom));

        // Update State
        setState(prev => ({
            ...prev,
            questions: [...prev.questions, question]
        }));
    };

    const editQuestion = (question: QuizQuestion) => {
        // Save to LocalStorage (Modified Map)
        const savedModified = localStorage.getItem('forestali_modified_questions');
        const modifiedQuestionsMap: Record<number, QuizQuestion> = savedModified ? JSON.parse(savedModified) : {};

        modifiedQuestionsMap[question.id] = question;
        localStorage.setItem('forestali_modified_questions', JSON.stringify(modifiedQuestionsMap));

        // Update State
        setState(prev => ({
            ...prev,
            questions: prev.questions.map(q => q.id === question.id ? question : q)
        }));
    };

    const hideQuestion = (questionId: number) => {
        // Save to LocalStorage
        const savedHidden = localStorage.getItem('forestali_hidden_questions');
        const hiddenIds: number[] = savedHidden ? JSON.parse(savedHidden) : [];
        if (!hiddenIds.includes(questionId)) {
            const updatedHidden = [...hiddenIds, questionId];
            localStorage.setItem('forestali_hidden_questions', JSON.stringify(updatedHidden));

            // Update State
            setState(prev => ({
                ...prev,
                questions: prev.questions.filter(q => q.id !== questionId)
            }));
        }
    };

    const answerQuestion = (questionId: number, isCorrect: boolean) => {
        setState(prev => {
            const currentProgress = prev.userProgress[questionId] || {
                box: 0,
                nextReview: 0,
                lastReviewed: 0,
                history: []
            };

            // SRS Logic (Leitner System simplified)
            // Correct -> Move to next box, review later
            // Wrong -> Reset to box 1, review soon
            let newBox = isCorrect ? Math.min(currentProgress.box + 1, 5) : 1;

            // Calculate Next Review (Simple intervals: 1d, 3d, 7d, 14d, 30d)
            const intervals = [0, 1, 3, 7, 14, 30]; // Days
            const nextReviewDate = Date.now() + (intervals[newBox] * 24 * 60 * 60 * 1000);

            const newProgress: UserProgressData = {
                box: newBox,
                nextReview: nextReviewDate,
                lastReviewed: Date.now(),
                history: [...currentProgress.history, isCorrect].slice(-5) // Keep last 5
            };

            // Update Stats
            const newStats = { ...prev.stats };
            newStats.totalAnswered += 1;
            if (isCorrect) {
                newStats.correctCount += 1;
                newStats.currentStreak += 1;
                newStats.xp += 10 + (newStats.currentStreak * 2); // XP bonus for streak
                if (newStats.currentStreak > newStats.bestStreak) {
                    newStats.bestStreak = newStats.currentStreak;
                }
            } else {
                newStats.currentStreak = 0;
                newStats.xp += 1; // Participation XP
            }

            // Level Up Logic (Simple: every 500 XP)
            newStats.level = Math.floor(newStats.xp / 500) + 1;

            return {
                ...prev,
                userProgress: {
                    ...prev.userProgress,
                    [questionId]: newProgress
                },
                stats: newStats
            };
        });
    };

    const resetProgress = () => {
        if (window.confirm('Sei sicuro di voler resettare tutti i progressi?')) {
            setState(prev => ({
                ...prev,
                userProgress: {},
                stats: INITIAL_STATS
            }));
        }
    };

    const getQuestionsForStudy = (count: number = 10, categoryFilter?: string[]) => {
        if (state.questions.length === 0) return [];

        const now = Date.now();

        // Filter questions by category if filter is present
        // Use partial match (includes) instead of exact match
        let relevantQuestions = state.questions;
        if (categoryFilter && categoryFilter.length > 0) {
            relevantQuestions = relevantQuestions.filter(q =>
                categoryFilter.some(cat =>
                    q.category.toLowerCase().includes(cat.toLowerCase()) ||
                    cat.toLowerCase().includes(q.category.toLowerCase())
                )
            );
        }

        // If no questions found with filter, return empty
        if (relevantQuestions.length === 0) return [];

        // Filter questions that are due for review OR haven't been seen yet
        const dueQuestions = relevantQuestions.filter(q => {
            const prog = state.userProgress[q.id];
            if (!prog) return true; // New question
            return prog.nextReview <= now; // Due for review
        });

        // If we don't have enough due questions, include all relevant questions
        const questionsToUse = dueQuestions.length >= count ? dueQuestions : relevantQuestions;

        // Fisher-Yates shuffle for true randomization
        const shuffle = <T,>(array: T[]): T[] => {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        };

        // Return exactly 'count' questions (or all available if less)
        const shuffled = shuffle(questionsToUse);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    };

    return (
        <QuizContext.Provider value={{ ...state, answerQuestion, resetProgress, getQuestionsForStudy, addCustomQuestion, editQuestion, hideQuestion }}>
            {children}
        </QuizContext.Provider>
    );
};
