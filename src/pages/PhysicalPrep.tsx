import React, { useState, useEffect, useRef } from 'react';
import { Timer, Activity, TrendingUp, RotateCcw } from 'lucide-react';
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

const PhysicalPrep: React.FC = () => {
    const [gender, setGender] = useState<'M' | 'F'>('M');
    const [bests, setBests] = useState<Record<string, number>>({});

    // Stopwatch State
    const [runTime, setRunTime] = useState(0); // in deciseconds/seconds logic
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        const savedBests = localStorage.getItem('physical_bests');
        const savedGender = localStorage.getItem('physical_gender');
        if (savedBests) setBests(JSON.parse(savedBests));
        if (savedGender) setGender(savedGender as 'M' | 'F');
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

    // Stopwatch Logic
    const toggleTimer = () => {
        if (isRunning) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsRunning(false);
            // Auto-save best if better? For now just manual entry from display.
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

    const checkStatus = (std: PrepStandard, val: number) => {
        const target = gender === 'M' ? std.minMale : std.minFemale;
        if (std.type === 'time') return val > 0 && val <= target;
        return val >= target;
    };

    return (
        <div className="prep-container">
            <header className="prep-header">
                <h2 className="prep-title">Hub Fisico</h2>
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

                    {/* Manual Override for Run */}
                    <div className="manual-input">
                        <span>Record:</span>
                        <input
                            type="number"
                            placeholder="Sec"
                            value={bests['run'] || ''}
                            onChange={(e) => updateBest('run', e.target.value)}
                        />
                        <span className="status-badge" style={{
                            background: checkStatus(STANDARDS[0], bests['run']) ? '#4CAF50' : 'rgba(255,255,255,0.2)',
                            color: 'white'
                        }}>
                            {checkStatus(STANDARDS[0], bests['run']) ? 'IDONEO' : ((bests['run'] || 0) > 0 ? 'NON IDONEO' : '-')}
                        </span>
                    </div>
                </div>

                {/* SMALLER CARDS */}
                {STANDARDS.slice(1).map(std => {
                    const isPass = checkStatus(std, bests[std.key] || 0);
                    const target = gender === 'M' ? std.minMale : std.minFemale;

                    return (
                        <div key={std.key} className="stat-card-wrapper">
                            <div className="stat-icon">
                                {std.key === 'pushups' ? <Activity size={24} /> : <TrendingUp size={24} />}
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
                                <span className="stat-target">Target: {target} {std.unit}</span>
                            </div>

                            <span className={`status-badge ${isPass ? 'ok' : 'no'}`}>
                                {isPass ? 'IDONEO' : 'NON IDONEO'}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PhysicalPrep;
