import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { type QuizQuestion, type QuizState, type UserProgressData, type UserStats } from '../types';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
    const { user } = useAuth();
    const [state, setState] = useState<QuizState>({
        questions: [],
        userProgress: {},
        stats: INITIAL_STATS,
        loading: true,
        error: null
    });

    // Debounce refs to prevent excessive writes
    const progressUpdateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingUpdates = useRef<{ progress: Record<number, UserProgressData>, stats: UserStats } | null>(null);

    // Load Data on Mount and Auth Change
    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Lazy load quiz data (Static content)
                const quizModule = await import('../data/domande_quiz.json');
                const quizDataRaw = quizModule.default as QuizQuestion[];

                // 2. Load Questions Customizations (Local Only for now, could be clouded later)
                const savedCustom = localStorage.getItem('forestali_custom_questions');
                const savedHidden = localStorage.getItem('forestali_hidden_questions');
                const savedModified = localStorage.getItem('forestali_modified_questions');

                const customQuestions: QuizQuestion[] = savedCustom ? JSON.parse(savedCustom) : [];
                const hiddenIds: number[] = savedHidden ? JSON.parse(savedHidden) : [];
                const modifiedQuestionsMap: Record<number, QuizQuestion> = savedModified ? JSON.parse(savedModified) : {};

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

                        // Load local backup as fallback or for merging
                        const localProgress = localStorage.getItem('forestali_progress');
                        const localStats = localStorage.getItem('forestali_stats');
                        const localP = localProgress ? JSON.parse(localProgress) : {};
                        const localS = localStats ? JSON.parse(localStats) : INITIAL_STATS;

                        if (docSnap.exists()) {
                            const cloudData = docSnap.data();
                            // Strategy: Cloud wins if exists, otherwise merge? For now, Cloud wins to be consistent.
                            // Ideally, we could prompt user or merge intelligently (highest XP).
                            // Let's assume Cloud is truth. IF cloud has 0 XP and local has > 0, maybe merge?
                            // For safety: Use Cloud if available.
                            loadedProgress = cloudData.progress || {};
                            loadedStats = cloudData.stats || INITIAL_STATS;

                            // Edge case: User just logged in but played as guest before.
                            // If cloud is empty and local allows it, maybe we want to push local to cloud?
                            // KEEP SHORT: Just load cloud.
                        } else {
                            // First time cloud login? Push local data to cloud?
                            // Let's use local data as starting point for cloud
                            loadedProgress = localP;
                            loadedStats = localS;
                        }

                    } catch (error) {
                        console.error("Firestore Load Error:", error);
                        // Fallback to local
                        const savedProgress = localStorage.getItem('forestali_progress');
                        const savedStats = localStorage.getItem('forestali_stats');
                        loadedProgress = savedProgress ? JSON.parse(savedProgress) : {};
                        loadedStats = savedStats ? JSON.parse(savedStats) : INITIAL_STATS;
                    }

                } else {
                    // Guest: LocalStorage
                    const savedProgress = localStorage.getItem('forestali_progress');
                    const savedStats = localStorage.getItem('forestali_stats');
                    loadedProgress = savedProgress ? JSON.parse(savedProgress) : {};
                    loadedStats = savedStats ? JSON.parse(savedStats) : INITIAL_STATS;
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

    // Persist Data on Change (Debounced for Cloud)
    // This effect runs on every state change.
    useEffect(() => {
        if (state.loading) return;

        // 1. Always save to LocalStorage (Immediate backup/offline support)
        localStorage.setItem('forestali_progress', JSON.stringify(state.userProgress));
        localStorage.setItem('forestali_stats', JSON.stringify(state.stats));

        // 2. Save to Firestore (Debounced)
        if (user) {
            // Update pending payload
            pendingUpdates.current = {
                progress: state.userProgress,
                stats: state.stats
            };

            // Clear existing timer
            if (progressUpdateTimer.current) {
                clearTimeout(progressUpdateTimer.current);
            }

            // Set new timer (e.g., 5 seconds debounce)
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
            }, 5000); // 5 seconds wait
        }

        return () => {
            // Cleanup on unmount or before next effect (optional: could force save here if critical)
            // Ideally, we don't want to cancel the save on unmount, but React effects might.
            // For critical data, use a "flush" mechanism or relies on the timer staying alive in memory if component persists (Provider usually does).
        };

    }, [state.userProgress, state.stats, state.loading, user]);

    // Force flush on unmount/reload is tricky in React.
    // relying on 5s debounce for active usage is usually "good enough" for quiz apps.

    const addCustomQuestion = (question: QuizQuestion) => {
        const savedCustom = localStorage.getItem('forestali_custom_questions');
        const customQuestions: QuizQuestion[] = savedCustom ? JSON.parse(savedCustom) : [];
        const updatedCustom = [...customQuestions, question];
        localStorage.setItem('forestali_custom_questions', JSON.stringify(updatedCustom));
        setState(prev => ({ ...prev, questions: [...prev.questions, question] }));
    };

    const editQuestion = (question: QuizQuestion) => {
        const savedModified = localStorage.getItem('forestali_modified_questions');
        const modifiedQuestionsMap: Record<number, QuizQuestion> = savedModified ? JSON.parse(savedModified) : {};
        modifiedQuestionsMap[question.id] = question;
        localStorage.setItem('forestali_modified_questions', JSON.stringify(modifiedQuestionsMap));
        setState(prev => ({ ...prev, questions: prev.questions.map(q => q.id === question.id ? question : q) }));
    };

    const hideQuestion = (questionId: number) => {
        const savedHidden = localStorage.getItem('forestali_hidden_questions');
        const hiddenIds: number[] = savedHidden ? JSON.parse(savedHidden) : [];
        if (!hiddenIds.includes(questionId)) {
            const updatedHidden = [...hiddenIds, questionId];
            localStorage.setItem('forestali_hidden_questions', JSON.stringify(updatedHidden));
            setState(prev => ({ ...prev, questions: prev.questions.filter(q => q.id !== questionId) }));
        }
    };

    // ... (answerQuestion logic remains same)
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

            return {
                ...prev,
                userProgress: { ...prev.userProgress, [questionId]: newProgress },
                stats: newStats
            };
        });
    };

    const resetProgress = () => {
        if (user) return; // Prevent full reset if logged in without explicit cloud clear? (simplification)

        if (window.confirm('Sei sicuro di voler resettare tutti i progressi? (Questo cancellerà anche i dati salvati)')) {
            setState(prev => ({
                ...prev,
                userProgress: {},
                stats: INITIAL_STATS
            }));
            // Updates will trigger useEffect and clear cloud if timer fires, but immediate clear is safer:
            if (user) {
                // Explicitly clear cloud doc? Or let debounce handle it (setting empty params)
                // Debounce will set 'progress: {}'
            }
        }
    };

    // ... (getQuestionsForStudy logic remains same)
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
        const shuffle = <T,>(array: T[]): T[] => {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        };
        const shuffled = shuffle(questionsToUse);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    };

    return (
        <QuizContext.Provider value={{ ...state, answerQuestion, resetProgress, getQuestionsForStudy, addCustomQuestion, editQuestion, hideQuestion }}>
            {children}
        </QuizContext.Provider>
    );
};
