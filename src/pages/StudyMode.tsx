import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizSession } from '../hooks/useQuizSession'; // New Hook
import { Check, X, Brain, Ban, ArrowLeft, Flag } from 'lucide-react';
import { ReportModal } from '../components/ui/ReportModal';
import { XPBonusOverlay } from '../components/ui/XPBonusOverlay';
import { useQuiz } from '../context/QuizContext'; // Only for bonus notification
import './StudyMode.css';

const StudyMode: React.FC = () => {
    const navigate = useNavigate();
    const { bonusNotification, clearBonusNotification, loading: quizLoading } = useQuiz();

    // Use the custom hook for all session logic
    const {
        sessionQuestions,
        currentQuestion,
        showAnswer,
        selectedOption,
        excludedOptions,
        isFinished,
        handleOptionSelect,
        toggleExclusion,
        handleCheck,
        handleFeedback,
        calculateStrategy,
        progressDisplay,
        progressPercentage,
        categoryFilter,
        forceNew,
        todayAnsweredCount
    } = useQuizSession();

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    // Derived UI state
    const strategy = currentQuestion ? calculateStrategy(Object.keys(currentQuestion.options).length) : null;

    // Show loading while quiz data is still being loaded
    if (quizLoading) {
        return <div className="study-container"><p>Caricamento quiz...</p></div>;
    }

    // Loading State
    if (sessionQuestions.length === 0 && !isFinished) {
        // It might be empty because we just finished or there are none.
        // If we are "finished" per hook logic, it will fall through to isFinished block if we handle it right.
        // But useQuizSession initializes empty. Let's assume if empty and not finished -> Loading or Empty Result.

        // Actually, if we loaded 0 questions, it means we are done or none available.
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
                            style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: 'white' }}
                            onClick={() => {
                                navigate('/study', { state: { category: 'Sfida del Giorno', count: 20, forceNew: true } });
                                window.location.reload();
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

    if (!currentQuestion) return <div className="study-container">Caricamento...</div>;

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
                    <ArrowLeft size={24} />
                </button>
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
                </div>
                <span className="question-counter">{progressDisplay}</span>
            </div>

            {/* Note: category-filter-badge is now handled via CSS or we can keep it if we want explicit badge */}
            {categoryFilter && (
                <div className="category-filter-badge">
                    {categoryFilter}
                </div>
            )}

            <div className="flashcard-container">
                <div className="flashcard">
                    <div className="flashcard-header">
                        {/* Empty spacing element if category tag is hidden, or we can use it for something else */}
                        <div style={{ flex: 1 }}>
                            <span className="category-tag">{currentQuestion.category}</span>
                        </div>

                        <button
                            className="report-btn"
                            onClick={() => setIsReportModalOpen(true)}
                            title="Segnala errore"
                        >
                            <Flag size={18} />
                        </button>
                    </div>

                    <h3 className="question-text">{currentQuestion.question}</h3>

                    {/* Strategy Advisor */}
                    {!showAnswer && strategy && (
                        <div className={`strategy-advisor strategy-${strategy.type}`}>
                            <div className="advisor-icon"><Brain size={20} /></div>
                            <div>
                                <span className="advisor-stats">
                                    {Object.keys(currentQuestion.options).length - excludedOptions.length} Opz. Rimaste
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
                                            <Ban size={18} />
                                        </button>
                                    )}
                                    <div
                                        className={className}
                                        onClick={() => handleOptionSelect(key)}
                                    >
                                        <span style={{ fontWeight: 700, marginRight: '0.75rem', color: '#38BDF8' }}>{key}</span>
                                        {text}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {showAnswer && (
                        <div className="explanation-box">
                            <strong>Spiegazione</strong>
                            {currentQuestion.explanation}
                            {currentQuestion.source && (
                                <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', opacity: 0.6, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '4px' }}>
                                    Fonte: {currentQuestion.source}
                                </div>
                            )}
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
                        Conferma Risposta
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
