import { createContext, useContext } from 'react';
import { type QuizQuestion, type QuizState } from '../types';

export interface QuizContextType extends QuizState {
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
    getMistakeQuestions: (count?: number) => QuizQuestion[];
    getLeitnerStats: () => number[];
}

export const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const useQuiz = () => {
    const context = useContext(QuizContext);
    if (!context) {
        throw new Error('useQuiz must be used within a QuizProvider');
    }
    return context;
};

