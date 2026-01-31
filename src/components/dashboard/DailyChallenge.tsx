import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useScrollAnimation } from '../../hooks/useAnimations';
import { Trophy, RotateCw, Play } from 'lucide-react';

interface DailyChallengeProps {
    todayAnsweredCount: number;
}

const DailyChallenge: React.FC<DailyChallengeProps> = ({ todayAnsweredCount }) => {
    const navigate = useNavigate();
    const [challengeRef, challengeVisible] = useScrollAnimation<HTMLElement>();

    return (
        <section
            ref={challengeRef}
            className={`section animate-on-scroll ${challengeVisible ? 'is-visible' : ''}`}
        >
            <div className="challenge-card">
                <div className="challenge-content-wrapper">
                    <div className="challenge-icon-wrapper">
                        <Trophy />
                    </div>

                    <h3 className="challenge-title">Sfida del Giorno</h3>
                    <p className="challenge-description">
                        Completa 20 domande e guadagna 50 punti bonus!
                    </p>

                    <div className="challenge-progress-container">
                        <div className="challenge-progress-header">
                            <span>Progresso</span>
                            <span>{Math.round(((todayAnsweredCount % 20) / 20) * 100)}%</span>
                        </div>
                        <div className="challenge-progress-bar">
                            <div
                                className="challenge-progress-fill"
                                style={{
                                    width: `${((todayAnsweredCount % 20) / 20) * 100}%`
                                }}
                            />
                        </div>
                        <div className="challenge-progress-text" style={{ textAlign: 'right', fontSize: '10px', opacity: 0.6 }}>
                            {todayAnsweredCount % 20}/20 completate
                        </div>
                    </div>

                    <button
                        className="challenge-button"
                        onClick={() => navigate('/study', {
                            state: {
                                category: 'Sfida del Giorno',
                                count: 20,
                                forceNew: todayAnsweredCount > 0 && todayAnsweredCount % 20 === 0
                            }
                        })}
                    >
                        {todayAnsweredCount > 0 && todayAnsweredCount % 20 === 0 ? (
                            <>
                                <RotateCw /> Nuova Sfida
                            </>
                        ) : (
                            <>
                                <Play fill="currentColor" /> Accetta la sfida
                            </>
                        )}
                    </button>
                </div>
            </div>
        </section>
    );
};

export default DailyChallenge;
