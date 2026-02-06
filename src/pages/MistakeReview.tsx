import React, { useState } from 'react';
import { useQuiz } from '../context/QuizContext';
import { type QuizQuestion } from '../types';
import { ChevronRight, ArrowLeft, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './MistakeReview.css';

const MistakeReview: React.FC = () => {
    const { getMistakeQuestions, answerQuestion } = useQuiz();
    const navigate = useNavigate();
    const [questions /*, setQuestions */] = useState<QuizQuestion[]>(() => {
        return getMistakeQuestions(20);
    });
    const [currentIdx, setCurrentIdx] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    const handleAnswer = (key: string) => {
        if (isAnswered) return;

        setSelectedAnswer(key);
        setIsAnswered(true);
        const correct = key === questions[currentIdx].correct_answer;
        setIsCorrect(correct);

        // Update context
        // If correct, it technically "advances" the box, effectively checking it off as "reviewed".
        // But for Mistakes, we might want to be aggressive. 
        // Standard answerQuestion logic works: if correct -> Box 1->2. If wrong -> Box 1.
        answerQuestion(questions[currentIdx].id, correct);
    };

    const nextQuestion = () => {
        if (currentIdx < questions.length - 1) {
            setCurrentIdx(prev => prev + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
            setIsCorrect(false);
        } else {
            // Finished current batch
            navigate('/dashboard'); // Or show summary
        }
    };

    if (questions.length === 0) {
        return (
            <div className="mistake-container empty-state">
                <div className="empty-content">
                    <div className="success-icon-wrapper">
                        <CheckCircle size={64} color="#10B981" />
                    </div>
                    <h2>Nessun Errore!</h2>
                    <p>Non hai domande sbagliate da rivedere al momento.<br />Ottimo lavoro!</p>
                    <button className="btn-home" onClick={() => navigate('/')}>
                        <ArrowLeft size={18} /> Torna alla Home
                    </button>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentIdx];

    return (
        <div className="mistake-container">
            <header className="mistake-header">
                <button className="btn-back" onClick={() => navigate('/')}>
                    <ArrowLeft size={20} />
                </button>
                <div className="header-title">
                    <AlertTriangle size={20} className="warning-icon" />
                    <span>Revisione Errori</span>
                </div>
                <div className="progress-badge">
                    {currentIdx + 1} / {questions.length}
                </div>
            </header>

            <div className="mistake-content">
                <div className="question-card">
                    <div className="category-tag">{currentQ.category}</div>
                    <h3 className="question-text">{currentQ.question}</h3>

                    <div className="options-list">
                        {Object.entries(currentQ.options).map(([key, text]) => {
                            let optionClass = "option-item";
                            if (isAnswered) {
                                if (key === currentQ.correct_answer) optionClass += " correct";
                                else if (key === selectedAnswer) optionClass += " wrong";
                            } else if (selectedAnswer === key) {
                                optionClass += " selected";
                            }

                            return (
                                <div
                                    key={key}
                                    className={optionClass}
                                    onClick={() => handleAnswer(key)}
                                >
                                    <span className="option-key">{key}.</span>
                                    <span className="option-text">{text}</span>
                                    {isAnswered && key === currentQ.correct_answer && (
                                        <CheckCircle size={20} className="feedback-icon" />
                                    )}
                                    {isAnswered && key === selectedAnswer && key !== currentQ.correct_answer && (
                                        <XCircle size={20} className="feedback-icon" />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {isAnswered && (
                        <div className={`explanation-box ${isCorrect ? 'is-correct' : 'is-wrong'}`}>
                            <strong>{isCorrect ? 'Ben fatto! Hai recuperato questo errore.' : 'Ancora sbagliato...'}</strong>
                            <p>{currentQ.explanation}</p>
                            <button className="btn-next" onClick={nextQuestion}>
                                {currentIdx < questions.length - 1 ? 'Prossima' : 'Concludi Revisione'} <ChevronRight size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MistakeReview;
