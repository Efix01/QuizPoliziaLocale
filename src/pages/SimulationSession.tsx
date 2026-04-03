import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { DomandaPLSchema, ParametriEsameSchema } from '../types/pl';
import { useProgress } from '../context/ProgressContext';
import { ResultCard } from '../components/simulation/ResultCard';
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import './SimulationMode.css';

const SimulationStateSchema = z.object({
    domande: z.array(DomandaPLSchema).min(1),
    parametriEsame: ParametriEsameSchema
});

const SimulationSession: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Validazione dello stato tramite Zod
    const parsed = SimulationStateSchema.safeParse(location.state);
    const state = parsed.success ? parsed.data : null;
    
    const { salvaRisultatoQuiz } = useProgress();

    // Se mancano i parametri o si accede direttamente ricarichiamo ad home
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
    const PASS_THRESHOLD = parametri.sogliaSuperamento ?? (MAX_SCORE * 0.6); // Default 60% se non definito

    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [timeLeft, setTimeLeft] = useState(SIMULATION_TIME);
    const [isFinished, setIsFinished] = useState(false);
    const [flaggedQuestions, setFlaggedQuestions] = useState<string[]>([]);

    // Results
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const [skippedCount, setSkippedCount] = useState(0);

    // Advanced Features
    const [pointsLost, setPointsLost] = useState(0);
    const [potentialScore, setPotentialScore] = useState(0);
    const [isReviewing, setIsReviewing] = useState(false);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFinished, state]);

    const finishSimulation = () => {
        let finalScore = 0;
        let correct = 0;
        let wrong = 0;
        let skipped = 0;
        
        // Per loggare in ProgressContext
        const risultatiList: any[] = []; // Usa il tipo equivalente a RisultatoRisposta se esportato, qui va bene un array di oggetti

        simQuestions.forEach(q => {
            const userAnswer = answers[q.id];
            
            const risultato = {
                domandaId: q.id,
                categoriaId: q.categoriaId,
                corretta: false,
                indiceRispostaScelta: userAnswer !== undefined ? userAnswer : 0,
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
                finalScore += parametri.punteggioErrata; // punteggioErrata è di solito negativo
            }
            
            risultatiList.push(risultato);
        });

        // Previene punteggi sotto zero estremi (a discrezione)
        if (finalScore < 0) finalScore = 0;

        setScore(finalScore);
        setCorrectCount(correct);
        setWrongCount(wrong);
        setSkippedCount(skipped);

        // Fortune Teller Logic
        const penaltyValue = Math.abs(parametri.punteggioErrata);
        const pLost = wrong * penaltyValue;
        setPointsLost(pLost);
        setPotentialScore(finalScore + pLost);

        setIsFinished(true);

        // SALVATAGGIO PROGRESSI TOTALI (Richiesto e Implementato)
        salvaRisultatoQuiz(risultatiList);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
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

    const startReview = () => {
        setIsReviewing(true);
        setCurrentIdx(0);
    };

    const toggleFlag = () => {
        if (isFinished) return;
        const qId = simQuestions[currentIdx].id;
        if (flaggedQuestions.includes(qId)) {
            setFlaggedQuestions(prev => prev.filter(id => id !== qId));
        } else {
            setFlaggedQuestions(prev => [...prev, qId]);
        }
    };

    if (!state || simQuestions.length === 0) return <div className="pl-page">Caricamento in corso...</div>;

    if (isFinished && !isReviewing) {
        return (
            <ResultCard
                score={score}
                maxScore={MAX_SCORE}
                passThreshold={PASS_THRESHOLD}
                correctCount={correctCount}
                wrongCount={wrongCount}
                skippedCount={skippedCount}
                pointsLost={pointsLost}
                potentialScore={potentialScore}
                onReviewClick={startReview}
                onRetryClick={() => navigate('/simulation')}
                onHomeClick={() => navigate('/')}
            />
        );
    }

    const currentQ = simQuestions[currentIdx];

    const getOptionClass = (idx: number, questionId: string) => {
        const userAnswer = answers[questionId];
        const isCorrect = idx === currentQ.rispostaCorretta;
        const isSelected = userAnswer === idx;

        if (isReviewing) {
            if (isCorrect) return 'option-item review-correct';
            if (isSelected && !isCorrect) return 'option-item review-wrong';
            if (isSelected && isCorrect) return 'option-item review-selected-correct';
            return 'option-item';
        } else {
            return `option-item ${isSelected ? 'selected' : ''}`;
        }
    };

    return (
        <div className="simulation-container" style={{ margin: '0 auto', maxWidth: '800px', width: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="sim-header">
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Simulazione Esame</h2>
                {!isReviewing ? (
                    <div className={`timer-display ${timeLeft < 300 ? 'timer-warning' : ''}`}>
                        {formatTime(timeLeft)}
                    </div>
                ) : (
                    <div className="review-mode-indicator">REVISIONE</div>
                )}
            </div>

            <div className="sim-content">
                <div className="flashcard">
                    <div className="category-tag">{currentQ.categoriaId || 'Generale'}</div>
                    <h3 className="question-text">{currentQ.testo}</h3>

                    <div className="options-list">
                        {currentQ.opzioni.map((text, idx) => (
                            <div
                                key={idx}
                                className={getOptionClass(idx, currentQ.id)}
                                onClick={() => handleAnswer(idx)}
                                style={{ cursor: isReviewing ? 'default' : 'pointer' }}
                            >
                                <span style={{ fontWeight: 600, marginRight: '0.5rem' }}>{String.fromCharCode(65 + idx)}.</span>
                                {text}
                            </div>
                        ))}
                    </div>
                    {!isReviewing && (
                        <p className="deselect-hint">
                            💡 <strong>Suggerimento:</strong> Tocca la risposta selezionata per deselezionarla (lasciare in bianco).
                        </p>
                    )}

                    {isReviewing && currentQ.spiegazione && (
                        <div className="explanation-box" style={{ marginTop: '1rem' }}>
                            <strong>Spiegazione:</strong> {currentQ.spiegazione}
                        </div>
                    )}
                </div>
            </div>

            <div className="sim-controls">
                <button
                    className="btn-nav"
                    onClick={() => setCurrentIdx(p => Math.max(0, p - 1))}
                    disabled={currentIdx === 0}
                >
                    <ChevronLeft size={20} />
                </button>

                {!isReviewing && !isFinished && (
                    <button
                        className={`btn-nav ${flaggedQuestions.includes(simQuestions[currentIdx].id) ? 'btn-flag-active' : ''}`}
                        onClick={toggleFlag}
                        style={{ color: flaggedQuestions.includes(simQuestions[currentIdx].id) ? '#f59e0b' : 'inherit' }}
                    >
                        <Flag size={20} fill={flaggedQuestions.includes(simQuestions[currentIdx].id) ? "#f59e0b" : "none"} />
                    </button>
                )}

                {currentIdx === parametri.numeroDomande - 1 ? (
                    !isReviewing ? (
                        <button className="btn-nav btn-submit" onClick={finishSimulation}>
                            Consegna
                        </button>
                    ) : (
                        <button className="btn-nav" onClick={() => navigate('/simulation')}>
                            Esci
                        </button>
                    )
                ) : (
                    <button
                        className="btn-nav"
                        onClick={() => setCurrentIdx(p => Math.min(parametri.numeroDomande - 1, p + 1))}
                    >
                        <ChevronRight size={20} />
                    </button>
                )}
            </div>

            <div className="question-nav">
                {simQuestions.map((q, idx) => {
                    let dotClass = 'q-dot';
                    if (currentIdx === idx) dotClass += ' active';

                    if (isReviewing) {
                        const ans = answers[q.id];
                        let style = {};
                        if (ans === q.rispostaCorretta) style = { backgroundColor: 'var(--color-success)', color: 'white', borderColor: 'transparent' };
                        else if (ans !== undefined) style = { backgroundColor: 'var(--color-error)', color: 'white', borderColor: 'transparent' };
                        else style = { backgroundColor: '#e5e7eb', color: '#6b7280' };

                        if (currentIdx === idx) style = { ...style, border: '2px solid black' };

                        return (
                            <div key={q.id} className={dotClass} onClick={() => setCurrentIdx(idx)} style={style}>
                                {idx + 1}
                            </div>
                        );
                    } else {
                        if (answers[q.id] !== undefined) dotClass += ' answered';
                        if (flaggedQuestions.includes(q.id)) dotClass += ' flagged';

                        const style: React.CSSProperties = flaggedQuestions.includes(q.id)
                            ? { borderColor: '#f59e0b', color: '#d97706', backgroundColor: '#fffbeb' }
                            : {};

                        return (
                            <div key={q.id} className={dotClass} onClick={() => setCurrentIdx(idx)} style={style}>
                                {idx + 1}
                            </div>
                        );
                    }
                })}
            </div>
        </div>
    );
};

export default SimulationSession;
