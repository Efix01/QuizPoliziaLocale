import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { DomandaPLSchema, ParametriEsameSchema } from '../types/pl';
import type { RisultatoRisposta } from '../types/progressi';
import { useProgress } from '../context/ProgressContext';
import { ResultCard } from '../components/simulation/ResultCard';
import { ChevronLeft, ChevronRight, Flag, Clock, Award, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './SimulationMode.css';

const SimulationStateSchema = z.object({
    domande: z.array(DomandaPLSchema).min(1),
    parametriEsame: ParametriEsameSchema
});

const getLayerLabel = (catId: string) => {
    if (catId.startsWith('reg_')) return 'Regionale';
    if (catId.startsWith('com_')) return 'Comunale';
    return 'Core Nazionale';
};

const SimulationSession: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { salvaRisultatoQuiz } = useProgress();
    
    const parsed = SimulationStateSchema.safeParse(location.state);
    const state = parsed.success ? parsed.data : null;
    
    useEffect(() => {
        if (!state?.domande || !state?.parametriEsame) {
            navigate('/dashboard');
        }
    }, [state, navigate]);

    const simQuestions = state?.domande || [];
    const parametri = state?.parametriEsame || {
        numeroDomande: 20,
        durataMinuti: 20,
        punteggioCorretta: 1,
        punteggioErrata: 0,
        punteggioNonData: 0,
        sogliaSuperamento: 12
    };

    const SIMULATION_TIME = parametri.durataMinuti * 60;
    const MAX_SCORE = parametri.numeroDomande * parametri.punteggioCorretta;
    const PASS_THRESHOLD = parametri.sogliaSuperamento ?? (MAX_SCORE * 0.6);

    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [timeLeft, setTimeLeft] = useState(SIMULATION_TIME);
    const [isFinished, setIsFinished] = useState(false);
    const [flaggedQuestions, setFlaggedQuestions] = useState<string[]>([]);
    const [isReviewing, setIsReviewing] = useState(false);

    // Risultati finali
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const [skippedCount, setSkippedCount] = useState(0);

    useEffect(() => {
        if (isFinished || !state) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    finishSimulation();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isFinished, state]);

    const finishSimulation = () => {
        let finalScore = 0;
        let correct = 0;
        let wrong = 0;
        let skipped = 0;
        const risultatiList: RisultatoRisposta[] = [];

        simQuestions.forEach(q => {
            const userAnswer = answers[q.id];
            const risultato: RisultatoRisposta = {
                domandaId: q.id,
                categoriaId: q.categoriaId,
                corretta: false,
                indiceRispostaScelta: userAnswer !== undefined ? userAnswer : -1,
                timestamp: new Date().toISOString()
            };

            if (userAnswer === undefined) {
                skipped++;
                finalScore += parametri.punteggioNonData;
            } else if (userAnswer === q.rispostaCorretta) {
                correct++;
                finalScore += parametri.punteggioCorretta;
                risultato.corretta = true;
            } else {
                wrong++;
                finalScore += parametri.punteggioErrata;
            }
            risultatiList.push(risultato);
        });

        if (finalScore < 0) finalScore = 0;
        setScore(finalScore);
        setCorrectCount(correct);
        setWrongCount(wrong);
        setSkippedCount(skipped);
        setIsFinished(true);
        salvaRisultatoQuiz(risultatiList);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleAnswer = (idx: number) => {
        if (isFinished && !isReviewing) return;
        if (isReviewing) return;
        if (answers[simQuestions[currentIdx].id] === idx) {
            setAnswers(prev => {
                const next = { ...prev };
                delete next[simQuestions[currentIdx].id];
                return next;
            });
        } else {
            setAnswers(prev => ({ ...prev, [simQuestions[currentIdx].id]: idx }));
        }
    };

    if (!state || simQuestions.length === 0) return (
        <div className="dashboard-elite" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <div className="pl-spinner" />
        </div>
    );

    if (isFinished && !isReviewing) {
        return (
            <ResultCard
                score={score}
                maxScore={MAX_SCORE}
                passThreshold={PASS_THRESHOLD}
                correctCount={correctCount}
                wrongCount={wrongCount}
                skippedCount={skippedCount}
                pointsLost={0}
                potentialScore={score}
                onReviewClick={() => { setIsReviewing(true); setCurrentIdx(0); }}
                onRetryClick={() => navigate('/simulation')}
                onHomeClick={() => navigate('/')}
            />
        );
    }

    const currentQ = simQuestions[currentIdx];
    const layerLabel = getLayerLabel(currentQ.categoriaId);

    return (
        <div className="dashboard-elite" style={{ minHeight: '100vh', padding: '1rem' }}>
            <header className="elite-header" style={{ marginBottom: '1.5rem' }}>
                <div className="profile-section">
                    <div className="profile-section__sub"><Shield size={14} /> Sessione d'Esame Ministeriale</div>
                    <h1 className="profile-section__name">Simulazione Ufficiale</h1>
                </div>
                <div className="glass-card" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderColor: timeLeft < 300 ? '#ef4444' : 'var(--glass-border)' }}>
                    <Clock size={18} color={timeLeft < 300 ? '#ef4444' : 'var(--pl-gold)'} />
                    <span style={{ fontWeight: '800', fontSize: '1.2rem', color: timeLeft < 300 ? '#ef4444' : 'white', fontFamily: 'monospace' }}>
                        {formatTime(timeLeft)}
                    </span>
                </div>
            </header>

            <main style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={currentIdx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="glass-card"
                        style={{ padding: '2rem', marginBottom: '1.5rem' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                            <span className="rank-badge">Domanda {currentIdx + 1} di {parametri.numeroDomande}</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--pl-gold)' }}>
                                <Award size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {layerLabel}
                            </span>
                        </div>

                        <h2 style={{ fontSize: '1.2rem', lineHeight: '1.5', color: 'white', marginBottom: '2rem' }}>
                            {currentQ.testo}
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {currentQ.opzioni.map((text, idx) => {
                                const isSelected = answers[currentQ.id] === idx;
                                const isCorrect = idx === currentQ.rispostaCorretta;
                                let bgColor = 'rgba(255,255,255,0.03)';
                                let borderColor = 'rgba(255,255,255,0.1)';
                                
                                if (isReviewing) {
                                    if (isCorrect) { bgColor = 'rgba(34,197,94,0.15)'; borderColor = '#22c55e'; }
                                    else if (isSelected) { bgColor = 'rgba(239,68,68,0.15)'; borderColor = '#ef4444'; }
                                } else if (isSelected) {
                                    bgColor = 'rgba(212,175,55,0.1)';
                                    borderColor = 'var(--pl-gold)';
                                }

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(idx)}
                                        style={{
                                            textAlign: 'left',
                                            padding: '1.15rem',
                                            borderRadius: '12px',
                                            border: `1px solid ${borderColor}`,
                                            backgroundColor: bgColor,
                                            color: 'white',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            gap: '1rem',
                                            cursor: isReviewing ? 'default' : 'pointer'
                                        }}
                                    >
                                        <span style={{ color: isSelected ? 'var(--pl-gold)' : 'var(--slate-text)', fontWeight: '800' }}>
                                            {String.fromCharCode(65 + idx)}
                                        </span>
                                        {text}
                                    </button>
                                );
                            })}
                        </div>

                        {isReviewing && currentQ.spiegazione && (
                             <div style={{ marginTop: '2rem', padding: '1rem', borderRadius: '10px', background: 'rgba(212,175,55,0.05)', borderLeft: '4px solid var(--pl-gold)' }}>
                                <strong style={{ color: 'var(--pl-gold)', fontSize: '0.9rem' }}>Spiegazione:</strong>
                                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem' }}>{currentQ.spiegazione}</p>
                             </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button className="glass-card" style={{ padding: '0.75rem 1.5rem' }} onClick={() => setCurrentIdx(p => Math.max(0, p - 1))} disabled={currentIdx === 0}>
                        <ChevronLeft size={20} />
                    </button>
                    {!isReviewing && (
                        <button className="glass-card" style={{ padding: '0.75rem 1.5rem', color: flaggedQuestions.includes(currentQ.id) ? '#f59e0b' : 'white' }} onClick={() => setFlaggedQuestions(prev => prev.includes(currentQ.id) ? prev.filter(id => id !== currentQ.id) : [...prev, currentQ.id])}>
                            <Flag size={20} fill={flaggedQuestions.includes(currentQ.id) ? "#f59e0b" : "none"} />
                        </button>
                    )}
                    {currentIdx === simQuestions.length - 1 ? (
                        <button className="glass-card" style={{ padding: '0.75rem 2rem', background: 'var(--pl-gold)', color: 'black', fontWeight: '800' }} onClick={() => isReviewing ? navigate('/dashboard') : finishSimulation()}>
                            {isReviewing ? 'Esci' : 'Consegna'}
                        </button>
                    ) : (
                        <button className="glass-card" style={{ padding: '0.75rem 1.5rem' }} onClick={() => setCurrentIdx(p => Math.min(simQuestions.length - 1, p + 1))}>
                            <ChevronRight size={20} />
                        </button>
                    )}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginTop: '2rem' }}>
                    {simQuestions.map((q, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIdx(idx)}
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '6px',
                                fontSize: '0.7rem',
                                fontWeight: '700',
                                backgroundColor: currentIdx === idx ? 'white' : (answers[q.id] !== undefined ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.03)'),
                                color: currentIdx === idx ? 'black' : 'white',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default SimulationSession;
