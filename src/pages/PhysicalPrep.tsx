import React, { useState, useEffect, useRef } from 'react';
import { Timer, Activity, TrendingUp, RotateCcw, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './PhysicalPrep.css';

interface PrepStandard {
    name: string;
    key: string; // for internal state mapping
    unit: string;
    minMale: number;
    minFemale: number;
    type: 'reps' | 'time';
}

// Mapped standards. Note: "Salto" is often part of Art. 12, but we'll use generic logic.
const STANDARDS: PrepStandard[] = [
    { name: 'Corsa 1000m', key: 'run', unit: 'sec', minMale: 230, minFemale: 290, type: 'time' },
    { name: 'Piegamenti', key: 'pushups', unit: 'reps', minMale: 15, minFemale: 10, type: 'reps' },
    { name: 'Salto in Alto', key: 'jump', unit: 'cm', minMale: 120, minFemale: 100, type: 'reps' } // Example values logic (higher is better)
];

const StatusBadge: React.FC<{
    standard: PrepStandard;
    value: number;
    gender: 'M' | 'F';
}> = ({ standard, value, gender }) => {
    const target = gender === 'M' ? standard.minMale : standard.minFemale;
    let isPass = false;

    if (standard.type === 'time') {
        isPass = value > 0 && value <= target;
    } else {
        isPass = value >= target;
    }

    const isNonIdoneo = value > 0 && !isPass;
    const label = isPass ? 'IDONEO' : (isNonIdoneo ? 'NON IDONEO' : '-');

    // Inline styles for badges to match the dynamic logic
    const style: React.CSSProperties = isPass ? {
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 78, 59, 0.4))',
        color: '#34D399',
        border: '1px solid rgba(16, 185, 129, 0.3)'
    } : {
        background: isNonIdoneo ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(127, 29, 29, 0.4))' : 'rgba(255,255,255,0.1)',
        color: isNonIdoneo ? '#F87171' : 'rgba(255,255,255,0.5)',
        border: isNonIdoneo ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255,255,255,0.1)'
    };

    return (
        <span className="status-badge" style={style}>
            {label}
        </span>
    );
};

const PhysicalPrep: React.FC = () => {
    const navigate = useNavigate();
    const [gender, setGender] = useState<'M' | 'F'>(() => {
        const saved = localStorage.getItem('physical_gender');
        return (saved === 'M' || saved === 'F') ? saved : 'M';
    });
    const [bests, setBests] = useState<Record<string, number>>(() => {
        try {
            const saved = localStorage.getItem('physical_bests');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.error("Failed to parse physical_bests", e);
            return {};
        }
    });

    const [runTime, setRunTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const updateBest = (key: string, val: string) => {
        const num = parseFloat(val);
        const newBests = { ...bests, [key]: isNaN(num) ? 0 : num };
        setBests(newBests);
        localStorage.setItem('physical_bests', JSON.stringify(newBests));
    };

    const handleGenderChange = (g: 'M' | 'F') => {
        setGender(g);
        localStorage.setItem('physical_gender', g);
    };

    const toggleTimer = () => {
        if (isRunning) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsRunning(false);
        } else {
            setIsRunning(true);
            const startTime = Date.now() - runTime;
            timerRef.current = window.setInterval(() => {
                setRunTime(Date.now() - startTime);
            }, 100);
        }
    };

    const resetTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsRunning(false);
        setRunTime(0);
    };

    const formatStopwatch = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="prep-container">
            <header className="prep-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={() => navigate('/')} className="btn-nav" aria-label="Torna alla Home">
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="prep-title">Hub Fisico</h2>
                </div>

                <div className="gender-toggle">
                    <button
                        className={`gender-btn ${gender === 'M' ? 'active' : ''}`}
                        onClick={() => handleGenderChange('M')}
                    >
                        UOMO
                    </button>
                    <button
                        className={`gender-btn ${gender === 'F' ? 'active' : ''}`}
                        onClick={() => handleGenderChange('F')}
                    >
                        DONNA
                    </button>
                </div>
            </header>

            <div className="prep-grid">
                {/* HERO RUN CARD */}
                <div className="hero-run-card">
                    <Timer size={40} className="run-icon" />
                    <span className="run-label">Corsa 1000m</span>
                    <div className="timer-giant">
                        {formatStopwatch(runTime)}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            className={`btn-start ${isRunning ? 'btn-stop' : ''}`}
                            onClick={toggleTimer}
                        >
                            {isRunning ? 'STOP' : 'START'}
                        </button>
                        {!isRunning && runTime > 0 && (
                            <button className="btn-nav" onClick={resetTimer} style={{ width: '48px', height: '48px' }}>
                                <RotateCcw size={20} />
                            </button>
                        )}
                    </div>

                    <div className="manual-input">
                        <span>Record:</span>
                        <input
                            type="number"
                            placeholder="Sec"
                            value={bests['run'] || ''}
                            onChange={(e) => updateBest('run', e.target.value)}
                        />
                        <StatusBadge
                            standard={STANDARDS[0]}
                            value={bests['run'] || 0}
                            gender={gender}
                        />
                    </div>
                </div>

                {/* SMALLER CARDS */}
                {STANDARDS.slice(1).map(std => (
                    <div key={std.key} className="stat-card-wrapper">
                        <div className="stat-icon">
                            {std.key === 'pushups' ? <Activity size={28} /> : <TrendingUp size={28} />}
                        </div>
                        <span className="stat-name">{std.name}</span>

                        <div className="stat-input-group">
                            <input
                                className="stat-input"
                                type="number"
                                value={bests[std.key] || ''}
                                onChange={(e) => updateBest(std.key, e.target.value)}
                                placeholder="0"
                            />
                            <span className="stat-target">Target: {gender === 'M' ? std.minMale : std.minFemale} {std.unit}</span>
                        </div>

                        <StatusBadge
                            standard={std}
                            value={bests[std.key] || 0}
                            gender={gender}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PhysicalPrep;
