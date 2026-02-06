import React, { useState, useEffect } from 'react';
import { StudyMaterialContext, type StudyMaterialState, type Subject } from './StudyMaterialContext';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const StudyMaterialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [state, setState] = useState<StudyMaterialState>({
        subjects: [],
        readChapters: [],
        loading: true,
        error: null
    });

    // Load Subjects Data
    useEffect(() => {
        const loadData = async () => {
            try {
                const module = await import('../data/materiale_studio.json');
                const subjects = module.default as Subject[];
                setState(prev => ({ ...prev, subjects, loading: false }));
            } catch {
                setState(prev => ({ ...prev, error: 'Failed to load study material', loading: false }));
            }
        };
        loadData();
    }, []);

    // Load Progress (Read Chapters) - Sync with Auth
    useEffect(() => {
        const loadProgress = async () => {
            if (user) {
                // Load from Firestore
                try {
                    const docRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        const cloudReadChapters = data.readChapters || [];
                        // Merge with local storage acting as cache/offline
                        const localSaved = localStorage.getItem('forestali_read_chapters');
                        const localReadChapters = localSaved ? JSON.parse(localSaved) : [];

                        const merged = Array.from(new Set([...cloudReadChapters, ...localReadChapters]));

                        setState(prev => ({ ...prev, readChapters: merged }));
                    }
                } catch (error) {
                    console.error("Error loading study progress from cloud:", error);
                }
            } else {
                // Load from LocalStorage (Guest)
                const saved = localStorage.getItem('forestali_read_chapters');
                if (saved) {
                    setState(prev => ({ ...prev, readChapters: JSON.parse(saved) }));
                } else {
                    setState(prev => ({ ...prev, readChapters: [] }));
                }
            }
        };
        loadProgress();
    }, [user]);

    const markAsRead = async (chapterId: string) => {
        if (state.readChapters.includes(chapterId)) return;

        const updatedReadChapters = [...state.readChapters, chapterId];

        // 1. Update State
        setState(prev => ({ ...prev, readChapters: updatedReadChapters }));

        // 2. Save to LocalStorage (Always acts as cache)
        localStorage.setItem('forestali_read_chapters', JSON.stringify(updatedReadChapters));

        // 3. Save to Firestore (If Logged In)
        if (user) {
            try {
                const docRef = doc(db, 'users', user.uid);
                await setDoc(docRef, { readChapters: updatedReadChapters }, { merge: true });
            } catch (error) {
                console.error("Error saving study progress to cloud:", error);
            }
        }
    };

    const resetSubjectProgress = async (subjectId: string) => {
        // Find subject to identify its chapters
        const subject = state.subjects.find(s => s.id === subjectId);
        if (!subject) return;

        // Create a prefix to match (assuming format subjectId_chapterId)
        // Wait, the key format used in LessonReader/StudyContext is inconsistent or relies on the ID passed.
        // In LessonReader: const key = `${subject.id}_${chapter.id}`;
        // So the IDs in readChapters are "subjectId_chapterId".
        // We need to filter OUT any ID that starts with "subjectId_".

        const updatedReadChapters = state.readChapters.filter(id => !id.startsWith(`${subjectId}_`));

        // 1. Update State
        setState(prev => ({ ...prev, readChapters: updatedReadChapters }));

        // 2. Save to LocalStorage
        localStorage.setItem('forestali_read_chapters', JSON.stringify(updatedReadChapters));

        // 3. Save to Firestore
        if (user) {
            try {
                const docRef = doc(db, 'users', user.uid);
                await setDoc(docRef, { readChapters: updatedReadChapters }, { merge: true });
            } catch (error) {
                console.error("Error resetting study progress:", error);
            }
        }
    };

    const isRead = (chapterId: string) => state.readChapters.includes(chapterId);

    const getSubjectById = (id: string) => {
        return state.subjects.find(s => s.id === id);
    };

    return (
        <StudyMaterialContext.Provider value={{ ...state, getSubjectById, markAsRead, isRead, resetSubjectProgress }}>
            {children}
        </StudyMaterialContext.Provider>
    );
};
