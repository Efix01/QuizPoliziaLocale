import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useScrollAnimation } from '../../hooks/useAnimations';

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
                <div className="challenge-icon">⭐</div>
                <h3 className="challenge-title display-text">Sfida del Giorno</h3>
                <p className="challenge-description">
                    Completa 20 domande e guadagna 50 punti bonus!
                </p>
                <div className="challenge-progress-container">
                    <div className="challenge-progress-bar">
                        <div
                            className="challenge-progress-fill"
                            style={{
                                width: `${((todayAnsweredCount % 20) / 20) * 100}%`,
                                transition: 'width 0.5s ease-out'
                            }}
                        />
                    </div>
                    <span className="challenge-progress-text">
                        {todayAnsweredCount % 20}/20 completate
                    </span>
                </div>
                <button
                    className="challenge-button hover-lift focus-gold"
                    onClick={() => navigate('/study', {
                        state: {
                            category: 'Sfida del Giorno',
                            count: 20,
                            // Force new if we are at a boundary (20, 40, etc.)
                            forceNew: todayAnsweredCount > 0 && todayAnsweredCount % 20 === 0
                        }
                    })}
                >
                    {todayAnsweredCount > 0 && todayAnsweredCount % 20 === 0 ? 'Nuova Sfida' : 'Accetta la sfida'}
                </button>
            </div>
        </section>
    );
};

export default DailyChallenge;
