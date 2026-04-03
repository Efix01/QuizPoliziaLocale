import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useQuizSession } from '../hooks/useQuizSession';
import { Check, X, Brain, Ban, ArrowLeft, Flag } from 'lucide-react';
import { ReportModal } from '../components/ui/ReportModal';
import './StudyMode.css';

const StudyMode: React.FC = () => {
    const navigate = useNavigate();

    const {
        hasValidSession,
        sessionQuestions,
        currentQuestion,
        showAnswer,
        selectedOption,
        excludedOptions,
        isFinished,
        isPending,
        handleOptionSelect,
        toggleExclusion,
        handleCheck,
        handleFeedback,
        calculateStrategy,
        progressDisplay,
        progressPercentage,
        sessionMode,
        sessionCategoriaId
    } = useQuizSession();

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    // Titolo o Categoria da mostrare nell'header/riepilogo
    const displayFilter = sessionMode === 'categoria' ? sessionCategoriaId : (sessionMode !== 'free' ? sessionMode : null);

    // Reindirizzamento se la sessione non è valida (es. refresh pagina)
    if (!hasValidSession) {
        return <Navigate to="/" replace />;
    }

    if (isFinished) {
        return (
            <div className="study-container">
                <h2>Sessione Completata!</h2>
                <p>Hai ripassato {sessionQuestions.length} domande{displayFilter ? ` di ${displayFilter}` : ''}.</p>
                <p style={{ color: '#aaa', marginTop: '1rem', fontSize: '0.9rem' }}>I progressi sono stati appena sincronizzati sul Cloud.</p>
                <button className="btn-reveal" onClick={() => navigate('/')}>Torna alla Dashboard</button>
            </div>
        );
    }

    if (!currentQuestion) return <div className="study-container">Caricamento in corso...</div>;

    const strategy = calculateStrategy(currentQuestion.opzioni.length);

    return (
        <div className="study-container">
            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                questionId={currentQuestion.id}
                category={currentQuestion.categoriaId || 'NA'}
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

            {displayFilter && (
                <div className="category-filter-badge">
                    {displayFilter}
                </div>
            )}

            <div className="flashcard-container">
                <div className="flashcard">
                    <div className="flashcard-header">
                        <div style={{ flex: 1 }}>
                            <span className="category-tag">{currentQuestion.categoriaId}</span>
                        </div>
                        <button
                            className="report-btn"
                            onClick={() => setIsReportModalOpen(true)}
                            title="Segnala errore"
                        >
                            <Flag size={18} />
                        </button>
                    </div>

                    <h3 className="question-text">{currentQuestion.testo}</h3>

                    {/* Strategia / Aiuto Visivo */}
                    {!showAnswer && strategy && (
                        <div className={`strategy-advisor strategy-${strategy.type}`}>
                            <div className="advisor-icon"><Brain size={20} /></div>
                            <div>
                                <span className="advisor-stats">
                                    {(currentQuestion.opzioni.length) - excludedOptions.length} Opz. Rimaste
                                </span>
                                {strategy.text}
                            </div>
                        </div>
                    )}

                    <div className="options-list">
                        {currentQuestion.opzioni.map((text, index) => {
                            const isSelected = selectedOption === index;
                            const isExcluded = excludedOptions.includes(index);
                            const isCorrect = index === currentQuestion.rispostaCorretta;

                            let className = 'option-item';
                            if (isExcluded) className += ' excluded';

                            if (showAnswer) {
                                if (isCorrect) className += ' correct';
                                else if (isSelected) className += ' wrong';
                            } else {
                                if (isSelected) className += ' selected';
                            }

                            const keyLabel = String.fromCharCode(65 + index); // A, B, C, D...

                            return (
                                <div className="option-wrapper" key={index}>
                                    {!showAnswer && (
                                        <button
                                            className={`exclude-btn ${isExcluded ? 'active' : ''}`}
                                            onClick={(e) => toggleExclusion(e, index)}
                                            title="Escludi opzione"
                                            disabled={isPending}
                                        >
                                            <Ban size={18} />
                                        </button>
                                    )}
                                    <div
                                        className={className}
                                        onClick={() => !isPending && handleOptionSelect(index)}
                                        style={{ pointerEvents: isPending ? 'none' : 'auto' }}
                                    >
                                        <span style={{ fontWeight: 700, marginRight: '0.75rem', color: 'var(--oro-sardegna, #F59E0B)' }}>
                                            {keyLabel}.
                                        </span>
                                        {text}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {showAnswer && (
                        <div className="explanation-box">
                            <strong>Spiegazione</strong>
                            <p>{currentQuestion.spiegazione || 'Nessuna spiegazione disponibile per questa domanda.'}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="controls-area">
                {!showAnswer ? (
                    <button
                        className="btn-reveal"
                        onClick={handleCheck}
                        disabled={selectedOption === null || isPending}
                        style={{ opacity: (selectedOption !== null && !isPending) ? 1 : 0.5 }}
                    >
                        Conferma Risposta
                    </button>
                ) : (
                    <>
                        {selectedOption !== currentQuestion.rispostaCorretta && (
                             <button 
                                className="btn-feedback btn-wrong" 
                                onClick={() => handleFeedback(false)}
                                disabled={isPending}
                             >
                                <X size={20} /> Ho Sbagliato
                            </button>
                        )}
                        <button 
                            className="btn-feedback btn-correct" 
                            onClick={() => handleFeedback(true)}
                            disabled={isPending}
                        >
                            <Check size={20} /> Avanti
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default StudyMode;
