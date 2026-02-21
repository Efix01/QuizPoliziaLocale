import React, { useState, useEffect, useRef, useMemo } from 'react';
import { QuizContext } from './QuizContext';
import { type QuizQuestion, type QuizState, type UserProgressData, type UserStats } from '../types';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getSafeItem, setSafeItem } from '../utils/storage';
import quizDataRaw from '../data/domande_quiz.json';

const INITIAL_STATS: UserStats = {
    totalAnswered: 0,
    correctCount: 0,
    currentStreak: 0,
    bestStreak: 0,
    level: 1,
    xp: 0,
    badges: []
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
                // 1. Quiz data is now statically imported (no async delay)
                const allQuizData = quizDataRaw as QuizQuestion[];

                // 2. Load Questions Customizations
                const customQuestions = getSafeItem<QuizQuestion[]>('forestali_custom_questions', true) || [];
                const hiddenIds = getSafeItem<number[]>('forestali_hidden_questions', true) || [];
                const modifiedQuestionsMap = getSafeItem<Record<number, QuizQuestion>>('forestali_modified_questions', true) || {};

                // Merge and Filter Questions
                let allQuestions = [...(allQuizData as QuizQuestion[]), ...customQuestions];
                allQuestions = allQuestions.map(q => modifiedQuestionsMap[q.id] ? modifiedQuestionsMap[q.id] : q);
                const activeQuestions = allQuestions.filter(q => !hiddenIds.includes(q.id));

                // 3. PHASE 1: Load from localStorage immediately → UI is ready instantly
                const localProgress = getSafeItem<Record<number, UserProgressData>>('forestali_progress', true) || {};
                const localStats = getSafeItem<UserStats>('forestali_stats', true) || INITIAL_STATS;

                setState(prev => ({
                    ...prev,
                    questions: activeQuestions,
                    userProgress: localProgress,
                    stats: localStats,
                    loading: false   // ← UI is already usable
                }));

                // 4. PHASE 2: If logged in, sync with Firestore in background (no blocking)
                if (user) {
                    try {
                        const docRef = doc(db, 'users', user.uid);
                        const docSnap = await getDoc(docRef);

                        if (docSnap.exists()) {
                            const cloudData = docSnap.data();
                            const cloudProgress = cloudData.progress || {};
                            const cloudStats = cloudData.stats || INITIAL_STATS;

                            // Only update state if cloud data is newer
                            const cloudUpdated = cloudData.lastUpdated || '';
                            const localUpdated = getSafeItem<string>('forestali_last_updated', false) || '';

                            if (cloudUpdated > localUpdated) {
                                setState(prev => ({
                                    ...prev,
                                    userProgress: cloudProgress,
                                    stats: cloudStats
                                }));
                                // Update local cache with cloud data
                                setSafeItem('forestali_progress', cloudProgress, true);
                                setSafeItem('forestali_stats', cloudStats, true);
                                setSafeItem('forestali_last_updated', cloudUpdated, false);
                            }
                        }
                    } catch {
                        // Silent fail — local data is already shown
                    }
                }

            } catch {
                setState(prev => ({ ...prev, error: 'Failed to load quiz data', loading: false }));
            }
        };

        loadData();
    }, [user]);

    // Persist Data
    useEffect(() => {
        if (state.loading) return;

        // 1. Always save to LocalStorage
        const now = new Date().toISOString();
        setSafeItem('forestali_progress', state.userProgress, true);
        setSafeItem('forestali_stats', state.stats, true);
        setSafeItem('forestali_last_updated', now, false);

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
                            lastUpdated: now
                        }, { merge: true });
                    } catch {
                        // Silent fail for cloud sync - data is safe in localStorage
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

            const newBox = isCorrect ? Math.min(currentProgress.box + 1, 5) : 1;
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

    const getMistakeQuestions = (count: number = 20): QuizQuestion[] => {
        if (state.questions.length === 0) return [];

        // Filter questions where:
        // 1. History exists and has at least one entry
        // 2. The LAST attempt was FALSE (wrong)
        // 3. The question is not yet mastered (box <= 2)
        const mistakeIds = Object.keys(state.userProgress).filter(idStr => {
            const id = parseInt(idStr);
            const progress = state.userProgress[id];

            // Skip if no progress or empty history
            if (!progress || !progress.history || progress.history.length === 0) {
                return false;
            }

            // Check that the last attempt was wrong
            const lastAttempt = progress.history[progress.history.length - 1];
            if (lastAttempt !== false) {
                return false;
            }

            // Include only questions in lower boxes (not mastered yet)
            return progress.box <= 2;
        }).map(id => parseInt(id));

        const questions = state.questions.filter(q => mistakeIds.includes(q.id));

        // Fisher-Yates shuffle for better randomization
        const shuffled = [...questions];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        return shuffled.slice(0, count);
    };

    const getLeitnerStats = () => {
        const stats = [0, 0, 0, 0, 0, 0]; // Box 0 to 5

        // Count Box 0 (Unseen)
        // Ideally we iterate all questions. 
        // Optimized: Total Questions - Seen Questions (in userProgress)
        // But some in userProgress might be Box 0 if reset? No, usually initialized to Box 1 on first correct answer? 
        // Actually answerQuestion logic: currentProgress.box defaults to 0. 
        // If isCorrect -> box 1, else box 1. So seen questions are at least Box 1.
        // Wait, if answerQuestion is called:
        // let newBox = isCorrect ? Math.min(currentProgress.box + 1, 5) : 1;
        // So they go to 1 minimum.

        const totalQuestions = state.questions.length;
        let seenCount = 0;

        Object.values(state.userProgress).forEach(p => {
            if (p.box >= 1 && p.box <= 5) {
                stats[p.box]++;
                seenCount++;
            }
        });

        stats[0] = Math.max(0, totalQuestions - seenCount);
        return stats;
    };

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
            clearBonusNotification,
            getMistakeQuestions,
            getLeitnerStats
        }}>
            {children}
        </QuizContext.Provider>
    );
};
