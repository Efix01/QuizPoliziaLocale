import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { useQuiz } from '../../context/QuizContext';

// Custom Tooltip Component
interface CustomTooltipProps {
    active?: boolean;
    payload?: { payload: { label: string }; value: number }[];
    label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        const dataItem = payload[0].payload;
        return (
            <div className="chart-tooltip">
                <p className="tooltip-title">Box {label}: {dataItem.label}</p>
                <p className="tooltip-value">{payload[0].value} Domande</p>
            </div>
        );
    }
    return null;
};

const StudyProgressChart: React.FC = () => {
    const { getLeitnerStats } = useQuiz();

    // Memoize stats to prevent animation flicker on every render
    const stats = useMemo(() => getLeitnerStats(), [getLeitnerStats]);

    // Data prep for Recharts
    const data = [
        { name: '1', count: stats[1], label: 'Apprendimento' },
        { name: '2', count: stats[2], label: 'Pratica' },
        { name: '3', count: stats[3], label: 'Ripasso' },
        { name: '4', count: stats[4], label: 'Consolida' },
        { name: '5', count: stats[5], label: 'Master' },
    ];

    // Calculate mastery percentage (Box 4+5 / Total Active)
    // We ignore Box 0 (Unseen) for "Mastery of what has been studied" or include it?
    // Let's show "Mastery Level" as weighted.
    // Or simplier: % of questions seen that are in Box 5.

    const totalSeen = stats.slice(1).reduce((a, b) => a + b, 0);
    // const masteryRate = totalSeen > 0 ? Math.round((stats[5] / totalSeen) * 100) : 0;

    const COLORS = ['#F87171', '#FB923C', '#FBBF24', '#34D399', '#059669'];

    if (totalSeen === 0) {
        return (
            <div className="chart-empty-state">
                <p>Inizia a studiare per vedere i tuoi progressi qui.</p>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: 200, marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                    />
                    <YAxis
                        hide
                        tickCount={5}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.1)' }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} animationDuration={1000}>
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            <div className="chart-legend">
                <div className="legend-item">
                    <span className="dot" style={{ background: '#F87171' }}></span>
                    <span>Inizio</span>
                </div>
                <div className="legend-item">
                    <span className="dot" style={{ background: '#FBBF24' }}></span>
                    <span>Progresso</span>
                </div>
                <div className="legend-item">
                    <span className="dot" style={{ background: '#059669' }}></span>
                    <span>Master</span>
                </div>
            </div>

            <style>{`
                .chart-tooltip {
                    background: rgba(15, 23, 42, 0.9);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(255,255,255,0.1);
                    padding: 8px 12px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                }
                .tooltip-title {
                    margin: 0;
                    font-size: 0.8rem;
                    color: rgba(255,255,255,0.7);
                }
                .tooltip-value {
                    margin: 4px 0 0;
                    font-weight: 700;
                    font-size: 1rem;
                    color: white;
                }
                .chart-empty-state {
                    height: 200px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: rgba(255,255,255,0.4);
                    font-size: 0.9rem;
                    border: 1px dashed rgba(255,255,255,0.1);
                    border-radius: 12px;
                    margin-top: 20px;
                }
                .chart-legend {
                    display: flex;
                    justify-content: center;
                    gap: 16px;
                    margin-top: 8px;
                }
                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.75rem;
                    color: rgba(255,255,255,0.5);
                }
                .legend-item .dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }
            `}</style>
        </div>
    );
};

export default StudyProgressChart;
