import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, BookOpen } from 'lucide-react';
import manualeData from '../data/manuale_pl.json';
import { useProgress } from '../context/ProgressContext';
import './LessonReader.css';

const LessonReader: React.FC = () => {
    const { subjectId } = useParams<{ subjectId: string }>();
    const navigate = useNavigate();
    const { progressiGlobali, segnaComeLetto } = useProgress();

    // Type casting del JSON importato
    const manuale: Record<string, {
        titolo: string;
        descrizione: string;
        capitoli: {
            id: string;
            titolo: string;
            testo: string[];
        }[];
    }> = manualeData;

    const subject = subjectId ? manuale[subjectId] : null;

    if (!subject) {
        return (
            <div className="lesson-reader">
                <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                    <h2>Materia non trovata</h2>
                    <p>La risorsa formativa richiesta non è disponibile o è in fase di stesura.</p>
                    <button className="pl-btn--primary" onClick={() => navigate('/manual')}>
                        Torna all'Indice
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="lesson-reader">
            {/* Header bloccato in alto */}
            <header className="reader-header pl-header">
                <button className="reader-back pl-header__back" onClick={() => navigate('/manual')}>
                    <ArrowLeft size={24} />
                </button>
                <div className="reader-title-container">
                    <span className="reader-subject" style={{ color: "var(--oro-sardegna)" }}>MANUALE</span>
                    <h1 className="reader-chapter">{subject.titolo}</h1>
                </div>
            </header>

            <div className="reader-content">
                <article className="lesson-article">
                    <header className="lesson-header">
                        <div className="lesson-subtitle">{subject.descrizione}</div>
                    </header>

                    {subject.capitoli.map((capitolo, idx) => {
                        const isRead = progressiGlobali?.capitoliLetti?.includes(capitolo.id);

                        return (
                            <section key={capitolo.id} id={capitolo.id} className="chapter-section">
                                <h2 className="chapter-title">
                                    <span className="chapter-number">{idx + 1}.</span> {capitolo.titolo}
                                </h2>
                                
                                <div className="lesson-body">
                                    {capitolo.testo.map((paragrafo, pIdx) => (
                                        <p key={pIdx}>{paragrafo}</p>
                                    ))}
                                </div>

                                <div className="chapter-actions">
                                    {isRead ? (
                                        <div className="chapter-completed-badge">
                                            <CheckCircle size={20} />
                                            Capitolo Completato
                                        </div>
                                    ) : (
                                        <button 
                                            className="mark-read-btn"
                                            onClick={() => segnaComeLetto(capitolo.id)}
                                        >
                                            <BookOpen size={18} />
                                            Segna come letto (+15 XP)
                                        </button>
                                    )}
                                </div>
                            </section>
                        );
                    })}
                </article>
            </div>
        </div>
    );
};

export default LessonReader;
