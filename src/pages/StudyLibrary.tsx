import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, ChevronRight, CheckCircle, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStudyMaterial, type Subject, type Chapter } from '../context/StudyMaterialContext';
import './StudyLibrary.css';

const STORAGE_KEY = 'quiz_study_progress';

const StudyLibrary: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { subjects, loading } = useStudyMaterial();
    const [readChapters, setReadChapters] = useState<Set<string>>(new Set());

    // Load progress from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            setReadChapters(new Set(JSON.parse(saved)));
        }
    }, []);

    // Calculate total read time for a subject
    const getTotalReadTime = (chapters: Chapter[]) => {
        let totalMinutes = 0;
        chapters.forEach(ch => {
            const match = ch.read_time.match(/(\d+)/);
            if (match) totalMinutes += parseInt(match[1]);
        });
        return totalMinutes;
    };

    // Calculate progress for a subject
    const getProgress = (subject: Subject) => {
        const readCount = subject.chapters.filter(ch =>
            readChapters.has(`${subject.id}_${ch.id}`)
        ).length;
        return {
            read: readCount,
            total: subject.chapters.length,
            percentage: Math.round((readCount / subject.chapters.length) * 100)
        };
    };

    // Get overall progress
    const getOverallProgress = () => {
        let totalChapters = 0;
        let readCount = 0;
        subjects.forEach(subject => {
            totalChapters += subject.chapters.length;
            readCount += subject.chapters.filter(ch =>
                readChapters.has(`${subject.id}_${ch.id}`)
            ).length;
        });
        return { read: readCount, total: totalChapters };
    };

    const overall = getOverallProgress();

    // Show loading state
    if (loading) {
        return (
            <div className="study-library">
                <div className="library-loading">Caricamento...</div>
            </div>
        );
    }

    // If not authenticated, show login prompt
    if (!isAuthenticated) {
        return (
            <div className="study-library">
                <header className="library-header">
                    <h1 className="library-title">Pillole di studio</h1>
                    <p className="library-subtitle">
                        Preparati al meglio con il nostro materiale didattico
                    </p>
                </header>

                <div className="library-locked">
                    <div className="locked-icon">
                        <Lock size={48} />
                    </div>
                    <h2>Contenuto Riservato</h2>
                    <p>
                        Le Pillole di studio sono disponibili solo per gli utenti registrati.
                        Accedi o crea un account per sbloccare tutti i materiali didattici.
                    </p>
                    <button
                        className="locked-btn"
                        onClick={() => navigate('/login')}
                    >
                        Accedi o Registrati
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="study-library">
            {/* Header */}
            <header className="library-header">
                <h1 className="library-title">Pillole di studio</h1>
                <p className="library-subtitle">
                    Preparati al meglio con il nostro materiale didattico
                </p>
            </header>

            {/* Overall Progress */}
            <div className="overall-progress-card">
                <div className="overall-progress-info">
                    <BookOpen className="overall-icon" />
                    <div>
                        <span className="overall-label">Avanzamento Totale</span>
                        <span className="overall-count">
                            {overall.read}/{overall.total} lezioni completate
                        </span>
                    </div>
                </div>
                <div className="overall-progress-bar">
                    <div
                        className="overall-progress-fill"
                        style={{ width: `${(overall.read / overall.total) * 100}%` }}
                    />
                </div>
            </div>

            {/* Subjects List */}
            <div className="subjects-list">
                {subjects.map((subject) => {
                    const progress = getProgress(subject);
                    const totalTime = getTotalReadTime(subject.chapters);
                    const isComplete = progress.read === progress.total;

                    return (
                        <div
                            key={subject.id}
                            className={`subject-card ${isComplete ? 'subject-card--complete' : ''}`}
                            onClick={() => navigate(`/manual/${subject.id}`)}
                        >
                            {/* Colored Left Border */}
                            <div className={`subject-border subject-border--${subject.id}`} />

                            <div className="subject-content">
                                <div className="subject-header">
                                    <span className="subject-icon">{subject.icon}</span>
                                    <div className="subject-info">
                                        <h2 className="subject-title">{subject.title}</h2>
                                        <p className="subject-description">{subject.description}</p>
                                    </div>
                                    {isComplete && (
                                        <CheckCircle className="subject-check" />
                                    )}
                                </div>

                                <div className="subject-meta">
                                    <span className="subject-chapters">
                                        {progress.read}/{progress.total} lezioni
                                    </span>
                                    <span className="subject-time">
                                        <Clock size={14} />
                                        {totalTime} min
                                    </span>
                                </div>

                                <div className="subject-progress">
                                    <div
                                        className="subject-progress-fill"
                                        style={{ width: `${progress.percentage}%` }}
                                    />
                                </div>
                            </div>

                            <ChevronRight className="subject-arrow" />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StudyLibrary;
