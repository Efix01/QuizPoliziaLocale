import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { type QuizQuestion } from '../types';
import { Check, X, Brain, Ban, ArrowLeft, Flag } from 'lucide-react';
import { ReportModal } from '../components/ui/ReportModal';
import { XPBonusOverlay } from '../components/ui/XPBonusOverlay';
import './StudyMode.css';



const StudyMode: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { getQuestionsForStudy, answerQuestion, bonusNotification, clearBonusNotification, todayAnsweredCount } = useQuiz();
    const [sessionQuestions, setSessionQuestions] = useState<QuizQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [excludedOptions, setExcludedOptions] = useState<string[]>([]);
    const [isFinished, setIsFinished] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    // Get category from navigation state
    // Get category and count from navigation state
    const state = location.state as { category?: string; count?: number; forceNew?: boolean };
    const categoryFilter = state?.category;
    const requestedCount = state?.count;
    const forceNew = state?.forceNew;

    useEffect(() => {
        // Load questions for this session, filtered by category if provided
        // Use requested count if available, otherwise default logic (20 for category, 10 for quick)
        const categoryList = categoryFilter && categoryFilter !== 'Sfida del Giorno' ? [categoryFilter] : undefined;

        let questionCount = 10;
        if (requestedCount) {
            questionCount = requestedCount;
        } else if (categoryFilter) {
        } else if (categoryFilter) {
            questionCount = 20;
        }

        // Daily Challenge Cap enforcement
        if (categoryFilter === 'Sfida del Giorno') {
            // Use todayAnsweredCount derived from context (outer scope)
            const todayCount = todayAnsweredCount;

            // Check if we are at a boundary (multiples of 20) and forceNew is NOT set
            if (todayCount > 0 && todayCount % 20 === 0 && !forceNew) {
                questionCount = 0; // Show "Done" screen
            } else {
                const remaining = 20 - (todayCount % 20);
                questionCount = Math.min(questionCount, remaining);
            }
        }

        // Special handling for "Sfida del Giorno" if it doesn't map to a real category
        // If it's a general mix but count is 20, we pass undefined as categoryList
        const questions = getQuestionsForStudy(questionCount, categoryList);
        setSessionQuestions(questions);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoryFilter, requestedCount]);


    const handleOptionSelect = (key: string) => {
        if (showAnswer) return;
        if (excludedOptions.includes(key)) return; // Prevents selection of excluded option
        setSelectedOption(key);
    };

    const toggleExclusion = (e: React.MouseEvent, key: string) => {
        e.stopPropagation(); // Stop bubble if clicked inside button
        if (showAnswer) return;

        if (excludedOptions.includes(key)) {
            setExcludedOptions(prev => prev.filter(k => k !== key));
        } else {
            setExcludedOptions(prev => [...prev, key]);
            if (selectedOption === key) setSelectedOption(null); // Deselect if excluded
        }
    };

    const handleCheck = () => {
        setShowAnswer(true);
    };

    const handleFeedback = (correct: boolean) => {
        if (!currentQuestion) return;

        // Save Result
        answerQuestion(currentQuestion.id, correct);

        // Go next
        if (currentIndex < sessionQuestions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setShowAnswer(false);
            setSelectedOption(null);
            setExcludedOptions([]);
            // Scroll to top for next question
            window.scrollTo(0, 0);
        } else {
            setIsFinished(true);
        }
    };

    const openReportModal = () => {
        setIsReportModalOpen(true);
    };

    // EV Calculator Logic
    const calculateStrategy = (totalOptions: number, excludedCount: number) => {
        const remaining = totalOptions - excludedCount;
        if (remaining <= 0) return null;
        if (remaining === 1) return { type: 'positive', ev: 0.50, text: "Risposta Certa (+0.50)" };

        const prob = 1 / remaining;
        const ev = (prob * 0.50) + ((1 - prob) * -0.17);

        if (ev > 0.1) return { type: 'positive', ev, text: `EV Positivo (+${ev.toFixed(2)}). Conviene Tentare!` };
        if (ev > -0.01) return { type: 'neutral', ev, text: `EV Marginale (${ev.toFixed(2)}). Rischio Medio.` };
        return { type: 'negative', ev, text: `EV Negativo (${ev.toFixed(2)}). Meglio lasciare in bianco.` };
    };

    if (sessionQuestions.length === 0) {
        return (
            <div className="study-container">
                <h2>{categoryFilter === 'Sfida del Giorno' && todayAnsweredCount > 0 && todayAnsweredCount % 20 === 0 && !forceNew ? 'Sfida Completata!' : 'Tutto fatto!'}</h2>
                <p>
                    {categoryFilter === 'Sfida del Giorno' && todayAnsweredCount > 0 && todayAnsweredCount % 20 === 0 && !forceNew
                        ? 'Hai completato 20 domande della sfida giornaliera. Ottimo lavoro!'
                        : `Non ci sono domande ${categoryFilter ? `di ${categoryFilter}` : ''} da ripassare al momento.`}
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button className="btn-reveal" onClick={() => navigate('/')}>Torna alla Home</button>
                    {categoryFilter === 'Sfida del Giorno' && todayAnsweredCount > 0 && todayAnsweredCount % 20 === 0 && !forceNew && (
                        <button
                            className="btn-reveal"
                            style={{ background: 'var(--gold)', color: 'var(--green-dark)' }}
                            onClick={() => {
                                // Reload with forceNew
                                navigate('/study', { state: { category: 'Sfida del Giorno', count: 20, forceNew: true } });
                                window.location.reload(); // Simple reload to force state refresh since we are same route
                            }}
                        >
                            Nuova Sfida
                        </button>
                    )}
                </div>
            </div>
        );
    }

    if (isFinished) {
        return (
            <div className="study-container">
                <h2>Sessione Completata!</h2>
                <p>Hai ripassato {sessionQuestions.length} domande{categoryFilter ? ` di ${categoryFilter}` : ''}.</p>
                <button className="btn-reveal" onClick={() => navigate('/')}>Torna alla Dashboard</button>
            </div>
        );
    }

    const currentQuestion = sessionQuestions[currentIndex];

    // Determine progress display
    let progressDisplay = `${currentIndex + 1}/${sessionQuestions.length}`;
    let progressPercentage = ((currentIndex) / sessionQuestions.length) * 100;

    // If it's the Daily Challenge, show global daily progress (CYCLIC)
    if (categoryFilter === 'Sfida del Giorno') {


        const currentCycleIndex = ((todayAnsweredCount) % 20) + 1;
        progressDisplay = `Domanda ${currentCycleIndex}/20`;
        progressPercentage = (currentCycleIndex / 20) * 100;
    }

    const strategy = calculateStrategy(4, excludedOptions.length);

    return (
        <div className="study-container">
            {bonusNotification && (
                <XPBonusOverlay
                    message={bonusNotification.message}
                    amount={bonusNotification.amount}
                    onClose={clearBonusNotification}
                />
            )}
            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                questionId={currentQuestion.id}
                category={currentQuestion.category}
            />

            <div className="study-header">
                <button
                    className="back-btn"
                    onClick={() => navigate('/')}
                    aria-label="Torna alla Home"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
                </div>
                <span className="question-counter">{progressDisplay}</span>
            </div>

            {categoryFilter && (
                <div className="category-filter-badge">
                    Argomento: {categoryFilter}
                </div>
            )}

            <div className="flashcard-container">
                <div className="flashcard">
                    <div className="flashcard-header">
                        <div className="category-tag">{currentQuestion.category}</div>
                        <button
                            className="report-btn"
                            onClick={openReportModal}
                            title="Segnala errore in questa domanda"
                            aria-label="Segnala errore"
                        >
                            <Flag size={16} />
                        </button>
                    </div>

                    <h3 className="question-text">{currentQuestion.question}</h3>

                    {/* Strategy Advisor */}
                    {!showAnswer && strategy && (
                        <div className={`strategy-advisor strategy-${strategy.type}`}>
                            <div className="advisor-icon"><Brain size={20} /></div>
                            <div>
                                <span className="advisor-stats">
                                    {4 - excludedOptions.length} Opz. Rimaste
                                </span>
                                {strategy.text}
                            </div>
                        </div>
                    )}

                    <div className="options-list">
                        {Object.entries(currentQuestion.options).map(([key, text]) => {
                            const isSelected = selectedOption === key;
                            const isExcluded = excludedOptions.includes(key);
                            const isCorrect = key === currentQuestion.correct_answer;

                            let className = 'option-item';
                            if (isExcluded) className += ' excluded';

                            if (showAnswer) {
                                if (isCorrect) className += ' correct';
                                else if (isSelected) className += ' wrong';
                            } else {
                                if (isSelected) className += ' selected';
                            }

                            return (
                                <div className="option-wrapper" key={key}>
                                    {!showAnswer && (
                                        <button
                                            className={`exclude-btn ${isExcluded ? 'active' : ''}`}
                                            onClick={(e) => toggleExclusion(e, key)}
                                            title="Escludi opzione"
                                        >
                                            <Ban size={16} />
                                        </button>
                                    )}
                                    <div
                                        className={className}
                                        onClick={() => handleOptionSelect(key)}
                                    >
                                        <span style={{ fontWeight: 600, marginRight: '0.5rem' }}>{key}.</span>
                                        {text}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {showAnswer && (
                        <div className="explanation-box">
                            <strong>Spiegazione:</strong> {currentQuestion.explanation}
                            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.8 }}>
                                Fonte: {currentQuestion.source}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="controls-area">
                {!showAnswer ? (
                    <button
                        className="btn-reveal"
                        onClick={handleCheck}
                        disabled={!selectedOption}
                        style={{ opacity: selectedOption ? 1 : 0.5 }}
                    >
                        Verifica Risposta
                    </button>
                ) : (
                    <>
                        <button className="btn-feedback btn-wrong" onClick={() => handleFeedback(false)}>
                            <X size={20} /> Non sapevo
                        </button>
                        <button className="btn-feedback btn-correct" onClick={() => handleFeedback(true)}>
                            <Check size={20} /> Sapevo
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default StudyMode;
