import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useScrollAnimation } from '../../hooks/useAnimations';
import StudyProgressChart from './StudyProgressChart';

interface DashboardStatsProps {
    stats: {
        totalAnswered: number;
        correctCount: number;
    };
    accuracy: number;
    averageScore: string;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, accuracy, averageScore }) => {
    const navigate = useNavigate();
    const [progressRef, progressVisible] = useScrollAnimation<HTMLElement>();

    return (
        <section
            ref={progressRef}
            className={`section animate-on-scroll ${progressVisible ? 'is-visible' : ''}`}
        >
            <div className="section-header">
                <h2 className="section-title">I tuoi progressi</h2>
                <button className="section-link" onClick={() => navigate('/profile')}>
                    Vedi tutto <ChevronRight />
                </button>
            </div>

            <div className="progress-card">
                {/* Stats */}
                <div className="stats-row">
                    <div className="stat-item">
                        <span className={`stat-value ${parseFloat(averageScore) >= 31 ? 'stat-value--success' : 'stat-value--warning'}`}>
                            {averageScore}
                        </span>
                        <span className="stat-label">Media punteggio</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{stats.totalAnswered}</span>
                        <span className="stat-label">Quiz completati</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{accuracy}%</span>
                        <span className="stat-label">Precisione</span>
                    </div>
                </div>

                {/* Learning Progress Chart (Replaces Sparkline) */}
                <div className="chart-container-wrapper">
                    <h3 className="chart-title">Distribuzione Apprendimento (Metodo Leitner)</h3>
                    <StudyProgressChart />
                </div>

                {/* Threshold bar */}
                <div className="threshold-bar">
                    <div className="threshold-track">
                        <div
                            className="threshold-fill"
                            style={{
                                width: progressVisible ? `${Math.min((parseFloat(averageScore) / 45) * 100, 100)}%` : '0%',
                                transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s'
                            }}
                        />
                    </div>
                    <div className="threshold-marker">
                        <div className="threshold-line" />
                        <span className="threshold-label">Soglia 31/45</span>
                    </div>
                </div>
            </div>

            <style>{`
                .chart-container-wrapper {
                    margin: 24px 0;
                    padding-top: 16px;
                    border-top: 1px solid rgba(255,255,255,0.05);
                }
                .chart-title {
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: rgba(255,255,255,0.5);
                    font-weight: 600;
                    margin-bottom: 8px;
                    text-align: center;
                }
            `}</style>
        </section>
    );
};

export default DashboardStats;
