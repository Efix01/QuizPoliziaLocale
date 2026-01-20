import React, { createContext, useContext, useEffect, useState } from 'react';

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

interface StudyMaterialState {
    subjects: Subject[];
    loading: boolean;
    error: string | null;
}

interface StudyMaterialContextType extends StudyMaterialState {
    getSubjectById: (id: string) => Subject | undefined;
}

const StudyMaterialContext = createContext<StudyMaterialContextType | undefined>(undefined);

export const useStudyMaterial = () => {
    const context = useContext(StudyMaterialContext);
    if (!context) {
        throw new Error('useStudyMaterial must be used within a StudyMaterialProvider');
    }
    return context;
};

export const StudyMaterialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<StudyMaterialState>({
        subjects: [],
        loading: true,
        error: null
    });

    // Lazy load study material on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                // Lazy load study material data
                const module = await import('../data/materiale_studio.json');
                const subjects = module.default as Subject[];

                setState({
                    subjects,
                    loading: false,
                    error: null
                });
            } catch (err) {
                setState(prev => ({
                    ...prev,
                    error: 'Failed to load study material',
                    loading: false
                }));
            }
        };

        loadData();
    }, []);

    const getSubjectById = (id: string) => {
        return state.subjects.find(s => s.id === id);
    };

    return (
        <StudyMaterialContext.Provider value={{ ...state, getSubjectById }}>
            {children}
        </StudyMaterialContext.Provider>
    );
};
