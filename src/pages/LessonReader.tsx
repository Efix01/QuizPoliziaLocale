import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, BookOpen, Clock, ChevronRight } from 'lucide-react';
import manualeData from '../data/manuale_pl.json';
import { useProgress } from '../context/ProgressContext';
import { motion } from 'framer-motion';

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
            <div style={{ minHeight: '100vh', background: '#0f172a', color: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div style={{ textAlign: 'center', maxWidth: '400px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🔍</div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', marginBottom: '1rem' }}>Materia non trovata</h2>
                    <p style={{ marginBottom: '2rem', lineHeight: 1.6 }}>La risorsa formativa richiesta non è disponibile o è in fase di stesura.</p>
                    <button 
                        onClick={() => navigate('/manual')}
                        style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0.85rem 1.5rem', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}
                    >
                        Torna all'Indice
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', color: '#cbd5e1' }}>
            {/* Header bloccato in alto */}
            <header style={{ 
                position: 'sticky',
                top: 0,
                zIndex: 100,
                background: 'rgba(15, 23, 42, 0.9)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid #334155',
                padding: '1rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem'
            }}>
                <button 
                    onClick={() => navigate('/manual')}
                    style={{ background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '0.6rem', borderRadius: '12px', cursor: 'pointer' }}
                >
                    <ArrowLeft size={24} />
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#3b82f6', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.1rem' }}>MANUALE D'ELITE</div>
                    <h1 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subject.titolo}</h1>
                </div>
            </header>

            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 1.5rem 6rem 1.5rem' }}>
                <article>
                    <header style={{ marginBottom: '4rem', textAlign: 'center' }}>
                        <div style={{ 
                            display: 'inline-flex', 
                            padding: '0.5rem 1rem', 
                            background: 'rgba(59, 130, 246, 0.1)', 
                            borderRadius: '12px', 
                            color: '#3b82f6', 
                            fontSize: '0.85rem', 
                            fontWeight: '700',
                            marginBottom: '1.5rem',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <Clock size={16} /> 15-20 min di lettura
                        </div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#fff', lineHeight: 1.2, marginBottom: '1.5rem' }}>{subject.titolo}</h2>
                        <p style={{ fontSize: '1.2rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>{subject.descrizione}</p>
                    </header>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem' }}>
                        {subject.capitoli.map((capitolo, idx) => {
                            const isRead = progressiGlobali?.capitoliLetti?.includes(capitolo.id);

                            return (
                                <section key={capitolo.id} id={capitolo.id} style={{ position: 'relative' }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '1rem', 
                                        marginBottom: '2rem' 
                                    }}>
                                        <div style={{ 
                                            fontSize: '3rem', 
                                            fontWeight: '900', 
                                            color: '#1e293b', 
                                            lineHeight: 1,
                                            flexShrink: 0
                                        }}>
                                            {(idx + 1).toString().padStart(2, '0')}
                                        </div>
                                        <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>{capitolo.titolo}</h3>
                                    </div>
                                    
                                    <div style={{ 
                                        color: '#cbd5e1', 
                                        fontSize: '1.15rem', 
                                        lineHeight: 1.8,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '1.5rem'
                                    }}>
                                        {capitolo.testo.map((paragrafo, pIdx) => (
                                            <p key={pIdx} style={{ margin: 0 }}>{paragrafo}</p>
                                        ))}
                                    </div>

                                    <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'flex-start' }}>
                                        {isRead ? (
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '0.75rem', 
                                                padding: '0.75rem 1.25rem', 
                                                background: 'rgba(34, 197, 94, 0.1)', 
                                                color: '#22c55e', 
                                                borderRadius: '16px',
                                                border: '1px solid rgba(34, 197, 94, 0.2)',
                                                fontWeight: '800',
                                                fontSize: '0.9rem'
                                            }}>
                                                <CheckCircle size={20} />
                                                Capitolo Completato
                                            </div>
                                        ) : (
                                            <motion.button 
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => segnaComeLetto(capitolo.id)}
                                                style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: '0.75rem', 
                                                    padding: '1rem 1.5rem', 
                                                    background: '#1e293b', 
                                                    color: '#3b82f6', 
                                                    borderRadius: '16px',
                                                    border: '1px solid #334155',
                                                    fontWeight: '800',
                                                    fontSize: '0.95rem',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <BookOpen size={20} />
                                                Segna come letto (+15 XP)
                                            </motion.button>
                                        )}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                </article>
            </div>
            
            {/* Navigazione rapida finale */}
            <footer style={{ 
                background: '#1e293b', 
                borderTop: '1px solid #334155', 
                padding: '4rem 1.5rem',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', marginBottom: '1rem' }}>Hai concluso la lettura?</h4>
                    <p style={{ color: '#94a3b8', marginBottom: '2.5rem' }}>Metti alla prova quello che hai imparato con una sessione di quiz mirata.</p>
                    <button 
                        onClick={() => navigate('/quiz-builder')}
                        style={{ 
                            background: '#3b82f6', 
                            color: '#fff', 
                            border: 'none', 
                            padding: '1rem 2rem', 
                            borderRadius: '16px', 
                            fontWeight: '800', 
                            fontSize: '1rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}
                    >
                        Vai ai Quiz <ChevronRight size={20} />
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default LessonReader;
