import React from 'react';
import { Eye, RefreshCw } from 'lucide-react';

interface ResultCardProps {
    score: number;
    maxScore: number;
    passThreshold: number;
    correctCount: number;
    wrongCount: number;
    skippedCount: number;
    pointsLost: number;
    potentialScore: number;
    onReviewClick: () => void;
    onRetryClick: () => void;
    onHomeClick: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
    score,
    maxScore,
    passThreshold,
    correctCount,
    wrongCount,
    skippedCount,
    pointsLost,
    potentialScore,
    onReviewClick,
    onRetryClick,
    onHomeClick
}) => {
    const isPassed = score >= passThreshold;

    return (
        <div className="simulation-container">
            <div className="result-card">
                <div className="sim-header" style={{ justifyContent: 'center', boxShadow: 'none', background: 'transparent' }}>
                    <h2>Risultato Prova</h2>
                </div>

                <div className={`result-status ${isPassed ? 'status-pass' : 'status-fail'}`}>
                    {isPassed ? 'IDONEO' : 'NON IDONEO'}
                </div>

                <div className="score-circle" style={{ borderColor: isPassed ? 'var(--color-success)' : 'var(--color-error)' }}>
                    <span className="score-number">{score.toFixed(2)}</span>
                    <span className="score-max">/ {maxScore}</span>
                </div>

                <p className="result-message">
                    {isPassed
                        ? "Congratulazioni! Hai superato la soglia di 31/45. Ricorda che l'accesso alla fase successiva dipende dalla graduatoria (primi 600)."
                        : "Non hai raggiunto il punteggio minimo di 31/45. Continua a studiare e riprova!"}
                </p>

                <div className="stats-breakdown">
                    <div className="stat-item">
                        <span className="stat-num stat-correct">{correctCount}</span>
                        <span className="stat-label-small">Esatte</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-num stat-wrong">{wrongCount}</span>
                        <span className="stat-label-small">Errate</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-num stat-skipped">{skippedCount}</span>
                        <span className="stat-label-small">Omesse</span>
                    </div>
                </div>

                {/* Stratagemma dell'Indovino */}
                {wrongCount > 0 && (
                    <div className="fortune-teller">
                        <strong>🔮 Stratagemma dell'Indovino</strong>
                        <p>
                            A causa del malus (-0.17), hai perso <b>{pointsLost.toFixed(2)}</b> punti per errori evitabili.
                            <br />
                            Se avessi lasciato in bianco quelle domande, il tuo punteggio sarebbe stato <b>{potentialScore.toFixed(2)}</b>.
                        </p>
                    </div>
                )}

                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button className="btn-submit" onClick={onReviewClick} style={{ backgroundColor: 'var(--oro-sardegna)', color: '#ffffff' }}>
                        <Eye size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Rivedi Risposte (Correzione)
                    </button>
                    <button className="btn-submit" onClick={onRetryClick}>
                        <RefreshCw size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Nuova Simulazione
                    </button>
                    <button className="btn-nav" onClick={onHomeClick}>Torna alla Home</button>
                </div>
            </div>
        </div>
    );
};
