import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useScrollAnimation } from '../../hooks/useAnimations';

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

    // Mock data
    const sparklineData = [30, 45, 35, 50, 40, 55, 48];
    const maxSparkline = Math.max(...sparklineData);

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
                {/* Sparkline */}
                <div className="sparkline-container">
                    {sparklineData.map((value, i) => (
                        <div
                            key={i}
                            className="sparkline-bar"
                            style={{
                                height: progressVisible ? `${(value / maxSparkline) * 100}%` : '0%',
                                transitionDelay: `${i * 0.05}s`
                            }}
                        />
                    ))}
                </div>

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
        </section>
    );
};

export default DashboardStats;
