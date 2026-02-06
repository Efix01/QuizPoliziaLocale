import { createContext, useContext } from 'react';

export interface Chapter {
    id: string;
    title: string;
    read_time: string;
    content_html: string;
}

export interface Subject {
    id: string;
    title: string;
    icon: string;
    description: string;
    chapters: Chapter[];
}

export interface StudyMaterialState {
    subjects: Subject[];
    readChapters: string[]; // List of IDs of read chapters
    loading: boolean;
    error: string | null;
}

export interface StudyMaterialContextType extends StudyMaterialState {
    getSubjectById: (id: string) => Subject | undefined;
    markAsRead: (chapterId: string) => void;
    isRead: (chapterId: string) => boolean;
    resetSubjectProgress: (subjectId: string) => Promise<void>;
}

export const StudyMaterialContext = createContext<StudyMaterialContextType | undefined>(undefined);

export const useStudyMaterial = () => {
    const context = useContext(StudyMaterialContext);
    if (!context) {
        throw new Error('useStudyMaterial must be used within a StudyMaterialProvider');
    }
    return context;
};

