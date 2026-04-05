import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePL } from '../context/PLContext';
import { useProgress } from '../context/ProgressContext';
import { useQuizPL } from '../hooks/useQuizPL';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Target, Car, Building2, Scale, ScrollText, AlertTriangle, Search, Trophy } from 'lucide-react';

// Colori Elite per progreso
const getColorForPct = (pct: number): string => {
    if (pct >= 75) return '#22c55e';      // Verde
    if (pct >= 40) return '#f59e0b';      // Giallo
    if (pct > 0) return '#ef4444';        // Rosso
    return '#64748b';                     // Grigio
};

const QuickQuizMenu = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { profilo, domandeRegionali, domandeComunali } = usePL();
    const { progressiGlobali, erroriLog } = useProgress();
    const { generaQuizVeloce, generaQuizCategoria, generaQuizStrato, generaQuizId } = useQuizPL();

    const [animazioneSaluto, setAnimazioneSaluto] = useState(false);

    // Auto-start da URL (?mode=mistakes)
    useEffect(() => {
        if (searchParams.get('mode') === 'mistakes') {
            const errorIds = Object.keys(erroriLog || {});
            if (errorIds.length > 0) {
                const domande = generaQuizId(errorIds);
                navigate('/study', { state: { domande, mode: 'errori' } });
            }
        } else {
            setAnimazioneSaluto(true);
            setTimeout(() => setAnimazioneSaluto(false), 2000);
        }
    }, [searchParams, erroriLog, generaQuizId, navigate]);

    const perCategoria = progressiGlobali?.perCategoria ?? {};

    const getPct = (catId: string): number => {
        const cat = perCategoria[catId];
        if (!cat || cat.fatte === 0) return 0;
        return Math.round((cat.corrette / cat.fatte) * 100);
    };

    const materieNazionali = [
        { id: 'cds', nome: 'CdS', icon: <Car size={20} /> },
        { id: 'tuel', nome: 'TUEL', icon: <Building2 size={20} /> },
        { id: 'l241', nome: 'L.241', icon: <Scale size={20} /> },
        { id: 'l689', nome: 'L.689', icon: <ScrollText size={20} /> },
        { id: 'penale', nome: 'Penale', icon: <AlertTriangle size={20} /> },
        { id: 'procedura', nome: 'Proc.P.', icon: <Search size={20} /> },
    ];

    const startMix = () => {
        const domande = generaQuizVeloce(20);
        navigate('/study', { state: { domande, mode: 'veloce' } });
    };

    const startCategoria = (cat: string) => {
        const domande = generaQuizCategoria(cat, 20);
        navigate('/study', { state: { domande, mode: 'categoria', categoriaId: cat } });
    };

    const startStrato = (strato: 'regionale' | 'comunale') => {
        const domande = generaQuizStrato(strato, 20);
        navigate('/study', { state: { domande, mode: 'strato', strato } });
    };

    const regionePrefix = profilo ? `reg_${profilo.regioneId}` : '';
    const comunePrefix = profilo?.comuneId ? `com_${profilo.comuneId}` : '';

    // Stili riutilizzabili
    const cardStyle = {
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '16px',
        padding: '1.5rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
    };

    const subjectCardStyle: React.CSSProperties = {
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '12px',
        padding: '1rem',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* Header */}
                <header style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            background: '#1e293b',
                            border: '1px solid #334155',
                            color: '#fff',
                            padding: '0.75rem',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>
                            Quiz Veloce
                        </h1>
                        <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0', fontSize: '0.95rem' }}>
                            Scegli cosa ripassare oggi
                        </p>
                    </div>
                </header>

                {/* Saluto motivante */}
                <AnimatePresence>
                {animazioneSaluto && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
                        }}
                    >
                        <Trophy size={28} color="#fbbf24" />
                        <p style={{ color: '#fff', margin: 0, fontWeight: '600' }}>
                            Pronto a mettere alla prova la tua preparazione? Inizia subito! 🎯
                        </p>
                    </motion.div>
                )}
                </AnimatePresence>

                {/* Sezione Crea */}
                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ 
                        fontSize: '1.2rem', 
                        fontWeight: '700', 
                        marginBottom: '1rem',
                        color: '#cbd5e1',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                    }}>Cosa vuoi ripassare?</h2>

                    {/* MIX COMPLETO */}
                    <motion.div
                        whileHover={{ y: -3, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}
                        style={{
                            ...cardStyle,
                            borderLeft: '4px solid #3b82f6',
                        }}
                        onClick={startMix}
                    >
                        <div style={{
                            background: '#0f172a',
                            borderRadius: '12px',
                            width: '50px',
                            height: '50px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            <Target size={28} color="#3b82f6" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem', color: '#f8fafc' }}>
                                Mix completo
                            </div>
                            <div style={{ lineHeight: '1.5', color: '#94a3b8', fontSize: '0.95rem' }}>
                                20 domande da tutto il programma<br />
                                {domandeRegionali.length > 0 || domandeComunali.length > 0 ? (
                                    <>
                                        Nazionale +{' '}
                                        {domandeRegionali.length > 0 && <span>{profilo?.nomeRegione}</span>}
                                        {domandeRegionali.length > 0 && domandeComunali.length > 0 && <span>, </span>}
                                        {domandeComunali.length > 0 && <span>{profilo?.nomeComune}</span>}
                                    </>
                                ) : (
                                    'Solo domande nazionali'
                                )}
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* MATERIE NAZIONALI */}
                <section style={{ marginBottom: '2.5rem' }}>
                    <div style={{
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        marginBottom: '1rem',
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                    }}>
                        Materie Nazionali
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '1rem',
                    }}>
                        {materieNazionali.map(m => {
                            const pct = getPct(m.id);
                            const fatte = perCategoria[m.id]?.fatte ?? 0;
                            const progressColor = getColorForPct(pct);

                            return (
                                <motion.div
                                    key={m.id}
                                    whileHover={{ y: -3, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)', borderColor: progressColor }}
                                    onClick={() => startCategoria(m.id)}
                                    style={{
                                        ...subjectCardStyle,
                                        borderColor: pct > 0 ? progressColor : '#334155',
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        marginBottom: '0.5rem',
                                        color: '#3b82f6',
                                    }}>
                                        {m.icon}
                                        <span style={{ fontWeight: '600', fontSize: '0.9rem', color: '#f8fafc' }}>{m.nome}</span>
                                    </div>
                                    
                                    {fatte > 0 && (
                                        <div style={{
                                            fontSize: '0.75rem',
                                            color: '#94a3b8',
                                            marginBottom: '0.5rem',
                                        }}>
                                            {fatte} fatte
                                        </div>
                                    )}

                                    <div style={{
                                        width: '100%',
                                        height: '6px',
                                        background: '#0f172a',
                                        borderRadius: '3px',
                                        overflow: 'hidden',
                                        marginBottom: '0.5rem',
                                    }}>
                                        <div style={{
                                            width: `${pct}%`,
                                            height: '100%',
                                            background: progressColor,
                                            transition: 'width 0.3s ease',
                                        }} />
                                    </div>

                                    <div style={{
                                        fontSize: '0.85rem',
                                        fontWeight: '700',
                                        color: progressColor,
                                    }}>
                                        {pct}%
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* REGIONALE */}
                {domandeRegionali.length > 0 && profilo && (
                    <section style={{ marginBottom: '2rem' }}>
                        <div style={{
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            marginBottom: '1rem',
                            color: '#94a3b8',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                        }}>
                            Regione {profilo.nomeRegione}
                        </div>
                        
                        <motion.div
                            whileHover={{ y: -3, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}
                            onClick={() => startStrato('regionale')}
                            style={{
                                ...cardStyle,
                                borderLeft: '4px solid #22c55e',
                            }}
                        >
                            <div style={{ fontSize: '2rem', marginRight: '1rem', flexShrink: 0 }}>📜</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.25rem', color: '#f8fafc' }}>
                                    Regionale — {profilo.nomeRegione}
                                </div>
                                <div style={{ lineHeight: '1.5', color: '#94a3b8', fontSize: '0.9rem' }}>
                                    {domandeRegionali.length} domande · {getPct(regionePrefix)}% completato
                                </div>
                            </div>
                        </motion.div>
                    </section>
                )}

                {/* COMUNALE */}
                {domandeComunali.length > 0 && profilo?.nomeComune && (
                    <section style={{ marginBottom: '2rem' }}>
                        <div style={{
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            marginBottom: '1rem',
                            color: '#94a3b8',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                        }}>
                            Comune {profilo.nomeComune}
                        </div>

                        <motion.div
                            whileHover={{ y: -3, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}
                            onClick={() => startStrato('comunale')}
                            style={{
                                ...cardStyle,
                                borderLeft: '4px solid #f59e0b',
                            }}
                        >
                            <div style={{ fontSize: '2rem', marginRight: '1rem', flexShrink: 0 }}>🏛️</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.25rem', color: '#f8fafc' }}>
                                    Statuto e Regolamento {profilo.nomeComune}
                                </div>
                                <div style={{ lineHeight: '1.5', color: '#94a3b8', fontSize: '0.9rem' }}>
                                    {domandeComunali.length} domande · {getPct(comunePrefix)}% completato
                                </div>
                            </div>
                        </motion.div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default QuickQuizMenu;
