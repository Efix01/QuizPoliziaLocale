import React, { createContext, useContext, useEffect, useState, useRef, useMemo } from 'react';
import { type QuizQuestion, type QuizState, type UserProgressData, type UserStats } from '../types';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getSafeItem, setSafeItem } from '../utils/storage';

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
    getTodayAnsweredCount: () => number;
    todayAnsweredCount: number;
    bonusNotification: { message: string, amount: number } | null;
    clearBonusNotification: () => void;
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
    const { user } = useAuth();
    const [state, setState] = useState<QuizState>({
        questions: [],
        userProgress: {},
        stats: INITIAL_STATS,
        loading: true,
        error: null
    });

    const [bonusNotification, setBonusNotification] = useState<{ message: string, amount: number } | null>(null);

    const clearBonusNotification = () => setBonusNotification(null);

    // Debounce refs
    const progressUpdateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingUpdates = useRef<{ progress: Record<number, UserProgressData>, stats: UserStats } | null>(null);

    // Load Data on Mount and Auth Change
    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Lazy load quiz data
                const quizModule = await import('../data/domande_quiz.json');
                const quizDataRaw = quizModule.default as QuizQuestion[];

                // 2. Load Questions Customizations
                const customQuestions = getSafeItem<QuizQuestion[]>('forestali_custom_questions', true) || [];
                const hiddenIds = getSafeItem<number[]>('forestali_hidden_questions', true) || [];
                const modifiedQuestionsMap = getSafeItem<Record<number, QuizQuestion>>('forestali_modified_questions', true) || {};

                // Merge and Filter Questions
                let allQuestions = [...quizDataRaw, ...customQuestions];
                allQuestions = allQuestions.map(q => modifiedQuestionsMap[q.id] ? modifiedQuestionsMap[q.id] : q);
                const activeQuestions = allQuestions.filter(q => !hiddenIds.includes(q.id));

                // 3. Load User Progress & Stats
                let loadedProgress = {};
                let loadedStats = INITIAL_STATS;

                if (user) {
                    // Authenticated: Try Firestore
                    try {
                        const docRef = doc(db, 'users', user.uid);
                        const docSnap = await getDoc(docRef);

                        const localP = getSafeItem<Record<number, UserProgressData>>('forestali_progress', true) || {};
                        const localS = getSafeItem<UserStats>('forestali_stats', true) || INITIAL_STATS;

                        if (docSnap.exists()) {
                            const cloudData = docSnap.data();
                            loadedProgress = cloudData.progress || {};
                            loadedStats = cloudData.stats || INITIAL_STATS;
                        } else {
                            // First time cloud login, use local data
                            loadedProgress = localP;
                            loadedStats = localS;
                        }

                    } catch (error) {
                        console.error("Firestore Load Error:", error);
                        // Fallback to local
                        loadedProgress = getSafeItem('forestali_progress', true) || {};
                        loadedStats = getSafeItem('forestali_stats', true) || INITIAL_STATS;
                    }

                } else {
                    // Guest: LocalStorage
                    loadedProgress = getSafeItem('forestali_progress', true) || {};
                    loadedStats = getSafeItem('forestali_stats', true) || INITIAL_STATS;
                }

                setState(prev => ({
                    ...prev,
                    questions: activeQuestions,
                    userProgress: loadedProgress,
                    stats: loadedStats,
                    loading: false
                }));

            } catch (err) {
                setState(prev => ({ ...prev, error: 'Failed to load quiz data', loading: false }));
            }
        };

        loadData();
    }, [user]);

    // Persist Data
    useEffect(() => {
        if (state.loading) return;

        // 1. Always save to LocalStorage
        setSafeItem('forestali_progress', state.userProgress, true);
        setSafeItem('forestali_stats', state.stats, true);

        // 2. Save to Firestore (Debounced)
        if (user) {
            pendingUpdates.current = {
                progress: state.userProgress,
                stats: state.stats
            };

            if (progressUpdateTimer.current) {
                clearTimeout(progressUpdateTimer.current);
            }

            progressUpdateTimer.current = setTimeout(async () => {
                if (pendingUpdates.current && user) {
                    try {
                        const docRef = doc(db, 'users', user.uid);
                        await setDoc(docRef, {
                            progress: pendingUpdates.current.progress,
                            stats: pendingUpdates.current.stats,
                            lastUpdated: new Date().toISOString()
                        }, { merge: true });
                        console.log("Synced to Cloud");
                    } catch (error) {
                        console.error("Cloud Sync Error:", error);
                    }
                }
            }, 5000);
        }

        return () => {
            // Cleanup provided by React
        };

    }, [state.userProgress, state.stats, state.loading, user]);

    const addCustomQuestion = (question: QuizQuestion) => {
        const customQuestions = getSafeItem<QuizQuestion[]>('forestali_custom_questions', true) || [];
        const updatedCustom = [...customQuestions, question];
        setSafeItem('forestali_custom_questions', updatedCustom, true);
        setState(prev => ({ ...prev, questions: [...prev.questions, question] }));
    };

    const editQuestion = (question: QuizQuestion) => {
        const modifiedQuestionsMap = getSafeItem<Record<number, QuizQuestion>>('forestali_modified_questions', true) || {};
        modifiedQuestionsMap[question.id] = question;
        setSafeItem('forestali_modified_questions', modifiedQuestionsMap, true);
        setState(prev => ({ ...prev, questions: prev.questions.map(q => q.id === question.id ? question : q) }));
    };

    const hideQuestion = (questionId: number) => {
        const hiddenIds = getSafeItem<number[]>('forestali_hidden_questions', true) || [];
        if (!hiddenIds.includes(questionId)) {
            const updatedHidden = [...hiddenIds, questionId];
            setSafeItem('forestali_hidden_questions', updatedHidden, true);
            setState(prev => ({ ...prev, questions: prev.questions.filter(q => q.id !== questionId) }));
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

            let newBox = isCorrect ? Math.min(currentProgress.box + 1, 5) : 1;
            const intervals = [0, 1, 3, 7, 14, 30];
            const nextReviewDate = Date.now() + (intervals[newBox] * 24 * 60 * 60 * 1000);

            const newProgress: UserProgressData = {
                box: newBox,
                nextReview: nextReviewDate,
                lastReviewed: Date.now(),
                history: [...currentProgress.history, isCorrect].slice(-5)
            };

            const newStats = { ...prev.stats };
            newStats.totalAnswered += 1;
            if (isCorrect) {
                newStats.correctCount += 1;
                newStats.currentStreak += 1;
                newStats.xp += 10 + (newStats.currentStreak * 2);
                if (newStats.currentStreak > newStats.bestStreak) {
                    newStats.bestStreak = newStats.currentStreak;
                }
            } else {
                newStats.currentStreak = 0;
                newStats.xp += 1;
            }
            newStats.level = Math.floor(newStats.xp / 500) + 1;

            // Daily Challenge Bonus Logic
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];
            today.setHours(0, 0, 0, 0);
            const todayStart = today.getTime();
            const todayEnd = todayStart + 24 * 60 * 60 * 1000;

            const updatedUserProgress = { ...prev.userProgress, [questionId]: newProgress };
            const todayAnsweredCount = Object.values(updatedUserProgress).filter(p => {
                return p.lastReviewed >= todayStart && p.lastReviewed < todayEnd;
            }).length;

            if (todayAnsweredCount >= 20 && newStats.dailyBonusClaimedDate !== todayStr) {
                newStats.xp += 50;
                newStats.dailyBonusClaimedDate = todayStr;
                newStats.level = Math.floor(newStats.xp / 500) + 1;

                setBonusNotification({
                    message: "Sfida del Giorno Completata!",
                    amount: 50
                });
            }

            return {
                ...prev,
                userProgress: updatedUserProgress,
                stats: newStats
            };
        });
    };

    const resetProgress = () => {
        if (user) return; // Prevent full reset if logged in (safety)

        if (window.confirm('Sei sicuro di voler resettare tutti i progressi? (Questo cancellerà anche i dati salvati)')) {
            setState(prev => ({
                ...prev,
                userProgress: {},
                stats: INITIAL_STATS
            }));
            // Data sync will happen via useEffect, or we can explicit clear if needed
        }
    };

    const getQuestionsForStudy = (count: number = 10, categoryFilter?: string[]) => {
        if (state.questions.length === 0) return [];
        const now = Date.now();
        let relevantQuestions = state.questions;

        if (categoryFilter && categoryFilter.length > 0) {
            relevantQuestions = relevantQuestions.filter(q =>
                categoryFilter.some(cat =>
                    q.category.toLowerCase().includes(cat.toLowerCase()) ||
                    cat.toLowerCase().includes(q.category.toLowerCase())
                )
            );
        }

        if (relevantQuestions.length === 0) return [];

        const dueQuestions = relevantQuestions.filter(q => {
            const prog = state.userProgress[q.id];
            if (!prog) return true;
            return prog.nextReview <= now;
        });

        const questionsToUse = dueQuestions.length >= count ? dueQuestions : relevantQuestions;

        // Fisher-Yates shuffle
        const shuffled = [...questionsToUse];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        return shuffled.slice(0, Math.min(count, shuffled.length));
    };

    // Performance Optimization: Memoize this calculation
    const todayAnsweredCount = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStart = today.getTime();
        const todayEnd = todayStart + 24 * 60 * 60 * 1000;

        return Object.values(state.userProgress).filter(progress => {
            const lastReviewed = progress.lastReviewed;
            return lastReviewed >= todayStart && lastReviewed < todayEnd;
        }).length;
    }, [state.userProgress]);

    // Provided for backward compatibility if called as function
    const getTodayAnsweredCount = () => todayAnsweredCount;

    return (
        <QuizContext.Provider value={{
            ...state,
            answerQuestion,
            resetProgress,
            getQuestionsForStudy,
            addCustomQuestion,
            editQuestion,
            hideQuestion,
            getTodayAnsweredCount,
            todayAnsweredCount,
            bonusNotification,
            clearBonusNotification
        }}>
            {children}
        </QuizContext.Provider>
    );
};
