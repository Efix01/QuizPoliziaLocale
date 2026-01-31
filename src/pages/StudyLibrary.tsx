import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen, Clock, ChevronRight, CheckCircle, Lock,
    Scale, TreeDeciduous, Leaf, Map, Gavel, Flame, BookMarked, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStudyMaterial, type Subject, type Chapter } from '../context/StudyMaterialContext';
import './StudyLibrary.css';

// Helper to map IDs to Icons
const getSubjectIcon = (id: string) => {
    switch (id) {
        case 'lr_26_1985_art_1_7': return <Scale size={20} color="#4ADE80" />;
        case 'ecologia_selvicoltura_avanzata': return <TreeDeciduous size={20} color="#22C55E" />;
        case 'botanica_zoologia_sarda': return <Leaf size={20} color="#FB923C" />;
        case 'geografia_fisica_sardegna': return <Map size={20} color="#38BDF8" />;
        case 'rdl_3267_1923': return <Gavel size={20} color="#A78BFA" />;
        case 'manuale_legislazione_forestale': return <BookMarked size={20} color="#F472B6" />;
        case 'legge_394_1991': return <ShieldAlert size={20} color="#FACC15" />;
        case 'legge_353_2000': return <Flame size={20} color="#F87171" />;
        default: return <BookOpen size={20} color="#E2E8F0" />;
    }
};

const StudyLibrary: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { subjects, loading, isRead, resetSubjectProgress } = useStudyMaterial();

    // Calculate total read time for a subject
    const getTotalReadTime = (chapters: Chapter[]) => {
        let totalMinutes = 0;
        chapters.forEach(ch => {
            const match = ch.read_time.match(/(\d+)/);
            if (match) totalMinutes += parseInt(match[1]);
        });
        return totalMinutes;
    };

    // Calculate progress for a subject using global context
    const getProgress = (subject: Subject) => {
        const readCount = subject.chapters.filter(ch =>
            isRead(`${subject.id}_${ch.id}`)
        ).length;

        return {
            read: readCount,
            total: subject.chapters.length,
            percentage: Math.round((readCount / subject.chapters.length) * 100)
        };
    };

    // Get overall progress
    const overall = useMemo(() => {
        let totalChapters = 0;
        let readCount = 0;
        subjects.forEach(subject => {
            totalChapters += subject.chapters.length;
            readCount += subject.chapters.filter(ch =>
                isRead(`${subject.id}_${ch.id}`)
            ).length;
        });
        return { read: readCount, total: totalChapters };
    }, [subjects, isRead]);

    const handleReset = async (e: React.MouseEvent, subjectId: string) => {
        e.stopPropagation();
        if (window.confirm('Vuoi davvero resettare i progressi di questa materia?')) {
            await resetSubjectProgress(subjectId);
        }
    };

    // Show loading state
    if (loading) {
        return (
            <div className="study-library">
                <div style={{ color: 'white', textAlign: 'center', marginTop: '4rem' }}>Caricamento materiale didattico...</div>
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
                        Accedi ai materiali esclusivi per la preparazione al concorso.
                    </p>
                </header>

                <div className="library-locked">
                    <div className="locked-icon">
                        <Lock size={32} />
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
                <h1 className="library-title">Piano di Studio</h1>
                <p className="library-subtitle">
                    Il tuo percorso formativo completo per Agente Forestale.
                </p>
            </header>

            {/* Overall Progress */}
            <div className="overall-progress-card">
                <div className="overall-progress-info">
                    <BookOpen className="overall-icon" />
                    <div>
                        <span className="overall-label">Avanzamento Totale</span>
                        <div className="overall-count">
                            {overall.read} / {overall.total}
                        </div>
                    </div>
                </div>
                <div className="overall-progress-bar">
                    <div
                        className="overall-progress-fill"
                        style={{ width: `${overall.total > 0 ? (overall.read / overall.total) * 100 : 0}%` }}
                    />
                </div>
            </div>

            {/* Subjects List */}
            <div className="subjects-list">
                {subjects.map((subject) => {
                    const progress = getProgress(subject);
                    const totalTime = getTotalReadTime(subject.chapters);
                    const isComplete = progress.read === progress.total && progress.total > 0;

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
                                    <div className="subject-icon">
                                        {/* Dynamic Icon based on ID */}
                                        {getSubjectIcon(subject.id)}
                                    </div>
                                    <div className="subject-info">
                                        <h2 className="subject-title">{subject.title}</h2>
                                        <p className="subject-description">{subject.description}</p>
                                    </div>
                                    {isComplete && (
                                        <div className="subject-badge">
                                            <CheckCircle size={14} />
                                            <span>Completato</span>
                                        </div>
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

                                    {/* Push Arrow to end if needed, structure handles it via flex */}
                                </div>

                                <div className="subject-progress">
                                    <div
                                        className="subject-progress-fill"
                                        style={{ width: `${progress.percentage}%` }}
                                    />
                                </div>

                                {isComplete && (
                                    <button
                                        className="study-again-btn"
                                        onClick={(e) => handleReset(e, subject.id)}
                                    >
                                        Studia di nuovo
                                    </button>
                                )}
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
