export interface QuizQuestion {
    id: number;
    category: string;
    question: string;
    options: {
        [key: string]: string; // A, B, C, D
    };
    correct_answer: string;
    explanation: string;
    source: string;
}

export interface UserProgressData {
    box: number; // SRS Box: 0 (New) to 5 (Mastered)
    nextReview: number; // Timestamp
    lastReviewed: number;
    history: boolean[]; // Last 5 attempts (true=correct, false=wrong)
}

export interface UserStats {
    totalAnswered: number;
    correctCount: number;
    currentStreak: number;
    bestStreak: number;
    level: number;
    xp: number;
    badges: string[];
}

export interface QuizState {
    questions: QuizQuestion[];
    userProgress: Record<number, UserProgressData>;
    stats: UserStats;
    loading: boolean;
    error: string | null;
}
