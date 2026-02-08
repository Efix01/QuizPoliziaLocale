import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import DOMPurify from 'dompurify';
import { useAuth } from '../context/AuthContext';
import { useStudyMaterial } from '../context/StudyMaterialContext';
import './LessonReader.css';



const LessonReader: React.FC = () => {
    const { subjectId, chapterId } = useParams<{ subjectId: string; chapterId?: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { getSubjectById, loading, markAsRead: contextMarkAsRead, isRead: contextIsRead } = useStudyMaterial();
    const contentRef = useRef<HTMLDivElement>(null);



    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // Find subject and chapter using context
    const subject = subjectId ? getSubjectById(subjectId) : undefined;
    const currentChapterIndex = subject?.chapters.findIndex(
        ch => ch.id === (chapterId || subject.chapters[0]?.id)
    ) ?? 0;
    const chapter = subject?.chapters[currentChapterIndex];

    // Mark chapter as read
    const markAsRead = () => {
        if (!subject || !chapter) return;
        const key = `${subject.id}_${chapter.id}`;
        contextMarkAsRead(key);

        // Go to next chapter or back to library
        if (currentChapterIndex < subject.chapters.length - 1) {
            navigate(`/manual/${subject.id}/${subject.chapters[currentChapterIndex + 1].id}`);
        }
    };

    // Navigation
    const goToPreviousChapter = () => {
        if (!subject || currentChapterIndex <= 0) return;
        navigate(`/manual/${subject.id}/${subject.chapters[currentChapterIndex - 1].id}`);
    };

    const goToNextChapter = () => {
        if (!subject || currentChapterIndex >= subject.chapters.length - 1) return;
        navigate(`/manual/${subject.id}/${subject.chapters[currentChapterIndex + 1].id}`);
    };

    // Go to quiz
    const goToQuiz = () => {
        if (!subject) return;
        navigate('/study', { state: { category: subject.title } });
    };

    // Show loading state
    if (loading) {
        return (
            <div className="lesson-not-found">
                <p>Caricamento...</p>
            </div>
        );
    }

    if (!subject || !chapter) {
        return (
            <div className="lesson-not-found">
                <p>Lezione non trovata</p>
                <button onClick={() => navigate('/manual')}>Torna alla libreria</button>
            </div>
        );
    }

    const isRead = contextIsRead(`${subject.id}_${chapter.id}`);

    return (
        <div className="lesson-reader">
            {/* Top Bar */}
            <header className="reader-header">
                <button className="reader-back" onClick={() => navigate('/manual')}>
                    <ArrowLeft size={20} />
                </button>
                <div className="reader-title-container">
                    <span className="reader-subject">{subject.icon} {subject.title}</span>
                    <span className="reader-progress">
                        {currentChapterIndex + 1}/{subject.chapters.length}
                    </span>
                </div>
            </header>

            {/* Chapter List Sidebar (for navigation) */}
            <div className="chapter-nav">
                {subject.chapters.map((ch, index) => {
                    const chKey = `${subject.id}_${ch.id}`;
                    const isActive = ch.id === chapter.id;
                    const isComplete = contextIsRead(chKey);

                    return (
                        <button
                            key={ch.id}
                            className={`chapter-nav-item ${isActive ? 'active' : ''} ${isComplete ? 'complete' : ''}`}
                            onClick={() => navigate(`/manual/${subject.id}/${ch.id}`)}
                        >
                            {isComplete ? <CheckCircle size={16} /> : <span>{index + 1}</span>}
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="reader-content" ref={contentRef}>
                <article className="lesson-article">
                    {/* Chapter Header */}
                    <header className="lesson-header">
                        <h1 className="lesson-title">{chapter.title}</h1>
                        <div className="lesson-meta">
                            <span className="lesson-time">
                                <Clock size={16} />
                                {chapter.read_time} di lettura
                            </span>
                            {isRead && (
                                <span className="lesson-complete">
                                    <CheckCircle size={16} />
                                    Completato
                                </span>
                            )}
                        </div>
                    </header>

                    {/* Chapter Content */}
                    <div
                        className="lesson-body"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(chapter.content_html) }}
                    />
                </article>

                {/* Chapter Navigation */}
                <div className="chapter-navigation">
                    <button
                        className="chapter-nav-btn prev"
                        onClick={goToPreviousChapter}
                        disabled={currentChapterIndex <= 0}
                    >
                        <ChevronLeft size={20} />
                        <span>Precedente</span>
                    </button>
                    <button
                        className="chapter-nav-btn next"
                        onClick={goToNextChapter}
                        disabled={currentChapterIndex >= subject.chapters.length - 1}
                    >
                        <span>Successivo</span>
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="reader-bottom-bar">
                {!isRead ? (
                    <button className="mark-read-btn" onClick={markAsRead}>
                        <CheckCircle size={20} />
                        Segna come letto
                    </button>
                ) : (
                    <button className="quiz-btn" onClick={goToQuiz}>
                        <BookOpen size={20} />
                        Mettiti alla prova
                    </button>
                )}
            </div>
        </div>
    );
};

export default LessonReader;
