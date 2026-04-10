import React, { useState, useEffect, useRef } from 'react';
import { Timer, Activity, TrendingUp, RotateCcw, ArrowLeft, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface PrepStandard {
    name: string;
    key: string;
    unit: string;
    minMale: number;
    minFemale: number;
    type: 'reps' | 'time';
}

const STANDARDS: PrepStandard[] = [
    { name: 'Corsa 1000m', key: 'run', unit: 'sec', minMale: 230, minFemale: 290, type: 'time' },
    { name: 'Piegamenti', key: 'pushups', unit: 'reps', minMale: 15, minFemale: 10, type: 'reps' },
    { name: 'Salto in Alto', key: 'jump', unit: 'cm', minMale: 120, minFemale: 100, type: 'reps' }
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
    const label = isPass ? 'IDONEO' : (isNonIdoneo ? 'NON IDONEO' : 'DA REGISTRARE');

    return (
        <span style={{
            padding: '0.4rem 0.8rem',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: '800',
            letterSpacing: '0.05em',
            background: isPass ? 'rgba(34, 197, 94, 0.15)' : (isNonIdoneo ? 'rgba(239, 68, 68, 0.15)' : 'rgba(148, 163, 184, 0.1)'),
            color: isPass ? '#22c55e' : (isNonIdoneo ? '#ef4444' : '#94a3b8'),
            border: `1px solid ${isPass ? 'rgba(34, 197, 94, 0.2)' : (isNonIdoneo ? 'rgba(239, 68, 68, 0.2)' : 'rgba(148, 163, 184, 0.1)')}`,
            textTransform: 'uppercase',
        }}>
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
        } catch { return {}; }
    });

    const [runTime, setRunTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
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
        const centi = Math.floor((ms % 1000) / 100);
        return `${minutes}:${seconds.toString().padStart(2, '0')}.${centi}`;
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* Header with Gender Toggle */}
                <header style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '1.5rem',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '24px',
                    padding: '1.5rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button onClick={() => navigate('/')} style={{ background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '0.6rem', borderRadius: '12px', cursor: 'pointer' }}>
                                <ArrowLeft size={20} />
                            </button>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Hub Fisico d'Élite</h1>
                        </div>
                        <div style={{ display: 'flex', background: '#0f172a', borderRadius: '12px', padding: '0.25rem' }}>
                            {['M', 'F'].map((g) => (
                                <button
                                    key={g}
                                    onClick={() => handleGenderChange(g as 'M' | 'F')}
                                    style={{
                                        padding: '0.5rem 1.25rem',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: gender === g ? '#3b82f6' : 'transparent',
                                        color: gender === g ? '#fff' : '#475569',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {g === 'M' ? 'UOMO' : 'DONNA'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '16px', border: '1px dashed #1e40af' }}>
                        <Info size={18} color="#3b82f6" />
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
                            I target visualizzati si riferiscono ai requisiti minimi previsti dagli ultimi bandi per la Polizia Locale (es. Roma Capitale).
                        </p>
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
                    
                    {/* Stopwatch Card */}
                    <motion.div 
                        whileHover={{ y: -5 }}
                        style={{
                            gridColumn: 'span 1',
                            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                            border: '1px solid #334155',
                            borderRadius: '32px',
                            padding: '2.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '1.5rem',
                            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
                        }}
                    >
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '50%', padding: '1.5rem' }}>
                            <Timer size={48} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#cbd5e1', marginBottom: '0.5rem' }}>Corsa 1000 metri</h3>
                            <div style={{ fontSize: '4rem', fontWeight: '900', color: '#fff', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                                {formatStopwatch(runTime)}
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                            <button
                                onClick={toggleTimer}
                                style={{
                                    flex: 1,
                                    background: isRunning ? '#ef4444' : '#22c55e',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '16px',
                                    padding: '1.25rem',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    boxShadow: `0 10px 15px -3px ${isRunning ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'}`,
                                }}
                            >
                                {isRunning ? 'ARRESTA' : 'AVVIA CRONO'}
                            </button>
                            {!isRunning && runTime > 0 && (
                                <button onClick={resetTimer} style={{ padding: '1rem', background: '#334155', border: 'none', borderRadius: '16px', color: '#fff', cursor: 'pointer' }}>
                                    <RotateCcw size={24} />
                                </button>
                            )}
                        </div>

                        <div style={{ width: '100%', marginTop: '1rem', padding: '1.5rem', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '24px', border: '1px solid #334155' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <span style={{ fontWeight: '700', color: '#94a3b8' }}>Miglior Tempo (sec)</span>
                                <input
                                    type="number"
                                    value={bests['run'] || ''}
                                    onChange={(e) => updateBest('run', e.target.value)}
                                    placeholder="Es. 225"
                                    style={{ background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '8px', padding: '0.5rem', width: '80px', textAlign: 'center', fontWeight: '800' }}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: '#475569' }}>Target {gender === 'M' ? 'Uomo' : 'Donna'}: {gender === 'M' ? '3:50' : '4:50'} min</span>
                                <StatusBadge standard={STANDARDS[0]} value={bests['run'] || 0} gender={gender} />
                            </div>
                        </div>
                    </motion.div>

                    {/* Skill Cards Grid */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {STANDARDS.slice(1).map(std => (
                            <motion.div 
                                key={std.key}
                                whileHover={{ x: 5 }}
                                style={{
                                    background: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: '24px',
                                    padding: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1.5rem',
                                }}
                            >
                                <div style={{ 
                                    background: '#0f172a', 
                                    color: std.key === 'pushups' ? '#ec4899' : '#3b82f6', 
                                    borderRadius: '16px', 
                                    padding: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {std.key === 'pushups' ? <Activity size={28} /> : <TrendingUp size={28} />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '800', color: '#f8fafc', marginBottom: '0.25rem' }}>{std.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Requisito: {gender === 'M' ? std.minMale : std.minFemale} {std.unit}</div>
                                </div>
                                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                                    <input
                                        type="number"
                                        value={bests[std.key] || ''}
                                        onChange={(e) => updateBest(std.key, e.target.value)}
                                        placeholder="0"
                                        style={{ background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '8px', padding: '0.5rem', width: '60px', textAlign: 'center', fontWeight: '800' }}
                                    />
                                    <StatusBadge standard={std} value={bests[std.key] || 0} gender={gender} />
                                </div>
                            </motion.div>
                        ))}

                        <div style={{ 
                            background: '#1e40af22', 
                            border: '1px solid #1e40af', 
                            borderRadius: '24px', 
                            padding: '1.5rem', 
                            textAlign: 'center'
                        }}>
                             <div style={{ fontWeight: '800', color: '#3b82f6', marginBottom: '0.5rem' }}>OBIETTIVO CONCORSO</div>
                             <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
                                Prepararsi fisicamente è fondamentale quanto studiare. Monitora i tuoi progressi ogni settimana.
                             </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PhysicalPrep;
