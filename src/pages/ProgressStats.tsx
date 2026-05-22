import { useMemo, useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { useQuizData } from '../context/QuizDataContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { 
    ChevronLeft, TrendingUp, TrendingDown, Target, Award, Clock, ArrowRight, BarChart3, Zap, AlertTriangle
} from 'lucide-react';

const COLORI_PIE = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

export default function ProgressStats() {
    const { progressiGlobali, erroriLog } = useProgress();
    const { tutteLeDomande } = useQuizData();
    const navigate = useNavigate();
    const [filtroTemporale, setFiltroTemporale] = useState<'7d' | '30d' | 'all'>('30d');

    const {
        quizCompletati = 0,
        mediaPercentuale = 0,
        streak = 0,
        xp = 0,
        livello = 1,
    } = progressiGlobali || {};

    // 1. Filtro dei dati storici in base alla selezione temporale
    const filteredStorico = useMemo(() => {
        const oggi = new Date();
        const limite = new Date();
        if (filtroTemporale === '7d') {
            limite.setDate(oggi.getDate() - 7);
        } else if (filtroTemporale === '30d') {
            limite.setDate(oggi.getDate() - 30);
        } else {
            return progressiGlobali.storicoQuiz || [];
        }
        const limiteStr = limite.toISOString().split('T')[0];
        return (progressiGlobali.storicoQuiz || []).filter(e => e.data >= limiteStr);
    }, [progressiGlobali.storicoQuiz, filtroTemporale]);

    // 2. Aggregazione per categoria basata sul filtro temporale
    const statsPerCategoriaFiltro = useMemo(() => {
        const aggregated: Record<string, { fatte: number; corrette: number }> = {};
        
        if (filteredStorico.length === 0) {
            // Se non ci sono dati storici per il filtro, fallback ai progressi globali perCategoria
            return progressiGlobali.perCategoria || {};
        }

        filteredStorico.forEach(entry => {
            const catId = entry.categoriaId;
            if (!aggregated[catId]) {
                aggregated[catId] = { fatte: 0, corrette: 0 };
            }
            aggregated[catId].fatte += entry.risposteFatte;
            aggregated[catId].corrette += entry.risposteCorrette;
        });
        return aggregated;
    }, [filteredStorico, progressiGlobali.perCategoria]);

    // 3. Dati per i grafici di padronanza ed andamento
    const chartData = useMemo(() => {
        return Object.entries(statsPerCategoriaFiltro)
            .map(([id, stats]) => {
                const s = stats as { corrette: number; fatte: number };
                return {
                    name: id.toUpperCase().slice(0, 8),
                    fullName: id.toUpperCase(),
                    score: Math.round((s.corrette / (s.fatte || 1)) * 100),
                    fatte: s.fatte,
                };
            })
            .sort((a, b) => b.fatte - a.fatte)
            .slice(0, 8); // Top 8 categorie
    }, [statsPerCategoriaFiltro]);

    // 4. Calcolo Trend Settimanale dell'Accuratezza (ultimi 7gg vs 7gg precedenti)
    const trendAccuratezza = useMemo(() => {
        const oggi = new Date();
        const d7 = new Date();
        d7.setDate(oggi.getDate() - 7);
        const d14 = new Date();
        d14.setDate(oggi.getDate() - 14);
        
        const d7Str = d7.toISOString().split('T')[0];
        const d14Str = d14.toISOString().split('T')[0];
        
        let fatte7 = 0, corrette7 = 0;
        let fatte14 = 0, corrette14 = 0;
        
        (progressiGlobali.storicoQuiz || []).forEach(e => {
            if (e.data >= d7Str) {
                fatte7 += e.risposteFatte;
                corrette7 += e.risposteCorrette;
            } else if (e.data >= d14Str) {
                fatte14 += e.risposteFatte;
                corrette14 += e.risposteCorrette;
            }
        });
        
        const acc7 = fatte7 > 0 ? (corrette7 / fatte7) * 100 : null;
        const acc14 = fatte14 > 0 ? (corrette14 / fatte14) * 100 : null;
        
        if (acc7 === null) return { valore: `${mediaPercentuale}%`, positivo: true, diff: 'N/D' };
        if (acc14 === null) return { valore: `${Math.round(acc7)}%`, positivo: true, diff: '+0%' };
        
        const diff = acc7 - acc14;
        const diffStr = diff >= 0 ? `+${Math.round(diff)}%` : `${Math.round(diff)}%`;
        return {
            valore: `${Math.round(acc7)}%`,
            positivo: diff >= 0,
            diff: diffStr
        };
    }, [progressiGlobali.storicoQuiz, mediaPercentuale]);

    // 5. Calcolo Punteggio Medio Simulato (proiettato su base 100) nel range selezionato
    const punteggioMedioSimulato = useMemo(() => {
        let fatte = 0, corrette = 0;
        filteredStorico.forEach(e => {
            fatte += e.risposteFatte;
            corrette += e.risposteCorrette;
        });
        const acc = fatte > 0 ? Math.round((corrette / fatte) * 100) : mediaPercentuale;
        return acc;
    }, [filteredStorico, mediaPercentuale]);

    // 6. Distribuzione degli Errori Attivi per Categoria (PieChart)
    const dataDistribuzioneErrori = useMemo(() => {
        const aggregated: Record<string, number> = {};
        
        Object.keys(erroriLog || {}).forEach(domandaId => {
            const domanda = tutteLeDomande.find(d => d.id === domandaId);
            if (domanda) {
                const catId = domanda.categoriaId;
                aggregated[catId] = (aggregated[catId] || 0) + 1;
            }
        });
        
        return Object.entries(aggregated).map(([id, count]) => ({
            name: id.toUpperCase(),
            value: count
        })).sort((a, b) => b.value - a.value);
    }, [erroriLog, tutteLeDomande]);

    // 7. Tempo Medio di Risposta per Categoria
    const tempiMediCategoria = useMemo(() => {
        const aggregated: Record<string, { sum: number; count: number }> = {};
        
        Object.entries(progressiGlobali.tempiRisposta || {}).forEach(([domandaId, tempo]) => {
            const domanda = tutteLeDomande.find(d => d.id === domandaId);
            if (domanda) {
                const catId = domanda.categoriaId;
                if (!aggregated[catId]) {
                    aggregated[catId] = { sum: 0, count: 0 };
                }
                aggregated[catId].sum += tempo;
                aggregated[catId].count += 1;
            }
        });
        
        return Object.entries(aggregated).map(([id, stats]) => ({
            name: id.toUpperCase(),
            tempo: Math.round((stats.sum / stats.count) * 10) / 10
        })).sort((a, b) => b.tempo - a.tempo);
    }, [progressiGlobali.tempiRisposta, tutteLeDomande]);

    const xpPerLivello = livello * 1000;
    const xpProgresso = (xp % xpPerLivello) / xpPerLivello * 100;

    return (
        <div style={{ minHeight: '100vh', background: '#090d16', color: '#f8fafc', padding: '2rem 1.5rem', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* Header */}
                <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={() => navigate('/dashboard')}
                            style={{
                                background: '#131c2e',
                                border: '1px solid #233554',
                                color: '#fff',
                                padding: '0.75rem',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                            }}
                            onMouseOver={e => e.currentTarget.style.borderColor = '#3b82f6'}
                            onMouseOut={e => e.currentTarget.style.borderColor = '#233554'}
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                <BarChart3 size={32} color="#3b82f6" />
                                <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, letterSpacing: '-0.025em', background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    Analisi Performance
                                </h1>
                            </div>
                            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
                                Statistiche e proiezioni del tuo percorso di studio per il concorso
                            </p>
                        </div>
                    </div>

                    {/* Filtri Temporali */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', gap: '0.25rem', background: '#131c2e', padding: '0.25rem', borderRadius: '12px', border: '1px solid #233554' }}>
                            {(['7d', '30d', 'all'] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFiltroTemporale(f)}
                                    style={{
                                        background: filtroTemporale === f ? '#3b82f6' : 'transparent',
                                        color: filtroTemporale === f ? '#fff' : '#94a3b8',
                                        border: 'none',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '8px',
                                        fontWeight: '700',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {f === '7d' ? '7 Giorni' : f === '30d' ? '30 Giorni' : 'Tutto'}
                                </button>
                            ))}
                        </div>

                        {/* Badge livello */}
                        <div style={{
                            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                            color: '#fff',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '99px',
                            fontWeight: '700',
                            fontSize: '0.95rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            border: '1px solid #3b82f6',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                        }}>
                            <Zap size={18} />
                            Livello {livello} • {xp} XP
                        </div>
                    </div>
                </header>

                {/* Progress Bar XP */}
                <div style={{
                    background: 'rgba(30, 41, 59, 0.4)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid #233554',
                    borderRadius: '20px',
                    padding: '1.5rem',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                        <span style={{ color: '#94a3b8', fontWeight: '600' }}>
                            Progresso verso Livello {livello + 1}
                        </span>
                        <span style={{ color: '#cbd5e1', fontWeight: '700' }}>
                            {xp % xpPerLivello} / {xpPerLivello} XP
                        </span>
                    </div>
                    <div style={{ height: '12px', background: '#090d16', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{
                            width: `${xpProgresso}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
                            transition: 'width 0.5s ease',
                        }} />
                    </div>
                </div>

                {/* Grid di Metriche Avanzate */}
                <section style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '1.5rem',
                }}>
                    {[
                        { label: 'Quiz Completati', val: quizCompletati, icon: Target, color: '#3b82f6', bg: '#172554' },
                        { label: 'Media Periodo', val: `${punteggioMedioSimulato}%`, icon: TrendingUp, color: '#10b981', bg: '#064e3b' },
                        { label: 'Trend Settimanale', val: trendAccuratezza.valore, sub: trendAccuratezza.diff, icon: trendAccuratezza.positivo ? TrendingUp : TrendingDown, color: trendAccuratezza.positivo ? '#10b981' : '#ef4444', bg: trendAccuratezza.positivo ? '#064e3b' : '#450a0a' },
                        { label: 'Proiezione Voto', val: `${Math.round(punteggioMedioSimulato * 0.3)}/30`, sub: 'Base 30 esame', icon: Award, color: '#f59e0b', bg: '#78350f' },
                        { label: 'Streak Studio', val: streak > 0 ? `${streak} Giorni` : '0', sub: 'Mantieni il ritmo', icon: Clock, color: '#a855f7', bg: '#581c87' },
                    ].map((m, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass-card"
                            style={{
                                borderRadius: '20px',
                                padding: '1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                position: 'relative',
                                overflow: 'hidden',
                                cursor: 'default'
                            }}
                            whileHover={{ scale: 1.03 }}
                        >
                            <div style={{
                                background: m.bg,
                                color: m.color,
                                borderRadius: '14px',
                                width: '50px',
                                height: '50px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '0.75rem',
                            }}>
                                <m.icon size={24} />
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#f8fafc', marginBottom: '0.25rem', lineHeight: 1 }}>
                                {m.val}
                            </div>
                            <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                                {m.label}
                            </div>
                            {m.sub && (
                                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: m.color }}>
                                    {m.sub}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </section>

                {/* Grafici Avanzati Row 1 */}
                <section style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '2rem',
                }}>
                    {/* Distribuzione degli Errori per Categoria */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass-card"
                        style={{
                            borderRadius: '24px',
                            padding: '2rem',
                            cursor: 'default'
                        }}
                    >
                        <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            margin: '0 0 1.5rem 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            color: '#ef4444'
                        }}>
                            <AlertTriangle size={24} />
                            Distribuzione Errori per Materia
                        </h3>
                        {dataDistribuzioneErrori.length > 0 ? (
                            <div style={{ height: '280px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <ResponsiveContainer width="100%" height="90%">
                                    <PieChart>
                                        <Pie
                                            data={dataDistribuzioneErrori}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={85}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {dataDistribuzioneErrori.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORI_PIE[index % COLORI_PIE.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '12px',
                                                border: '1px solid #233554',
                                                background: '#131c2e',
                                                color: '#f8fafc',
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                                    {dataDistribuzioneErrori.slice(0, 5).map((entry, index) => (
                                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORI_PIE[index % COLORI_PIE.length] }} />
                                            <span>{entry.name}: {entry.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div style={{ height: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', gap: '1rem' }}>
                                <Award size={48} color="#10b981" />
                                <span style={{ textAlign: 'center', fontSize: '0.95rem' }}>Nessun errore registrato! Ottimo lavoro!</span>
                            </div>
                        )}
                    </motion.div>

                    {/* Tempi Medi di Risposta per Materia */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass-card"
                        style={{
                            borderRadius: '24px',
                            padding: '2rem',
                            cursor: 'default'
                        }}
                    >
                        <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            margin: '0 0 1.5rem 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            color: '#3b82f6'
                        }}>
                            <Clock size={24} />
                            Tempo Medio di Risposta
                        </h3>
                        <div style={{ height: '280px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                            {tempiMediCategoria.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {tempiMediCategoria.map((t, idx) => (
                                        <div 
                                            key={idx} 
                                            style={{ 
                                                background: '#090d16', 
                                                border: '1px solid #233554', 
                                                borderRadius: '12px', 
                                                padding: '0.75rem 1rem', 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center',
                                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                            }}
                                            onMouseOver={e => {
                                                e.currentTarget.style.borderColor = 'var(--elite-primary)';
                                                e.currentTarget.style.transform = 'translateX(4px)';
                                            }}
                                            onMouseOut={e => {
                                                e.currentTarget.style.borderColor = '#233554';
                                                e.currentTarget.style.transform = 'translateX(0)';
                                            }}
                                        >
                                            <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#cbd5e1' }}>{t.name}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: t.tempo > 15 ? '#ef4444' : '#10b981' }}>
                                                <Clock size={16} />
                                                <span style={{ fontWeight: '800', fontSize: '1rem' }}>{t.tempo} s</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', gap: '1rem' }}>
                                    <Clock size={48} />
                                    <span>Nessun tempo di risposta registrato.</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </section>

                {/* Grafici Storici Row 2 */}
                <section style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: '2rem',
                }}>
                                       {/* Andamento temporale */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass-card"
                        style={{
                            borderRadius: '24px',
                            padding: '2rem',
                            cursor: 'default'
                        }}
                    >
                        <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            margin: '0 0 1.5rem 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                        }}>
                            <TrendingUp size={24} color="#3b82f6" />
                            Accuratezza per Materia
                        </h3>
                        <div style={{ height: '280px', width: '100%' }}>
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorAccuratezza" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#233554" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                                            dy={10}
                                        />
                                        <YAxis hide domain={[0, 100]} />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '12px',
                                                border: '1px solid #233554',
                                                background: '#131c2e',
                                                color: '#f8fafc',
                                            }}
                                            labelStyle={{ color: '#f8fafc' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="score"
                                            name="Accuratezza"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorAccuratezza)"
                                            dot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#131c2e' }}
                                            activeDot={{ r: 7, strokeWidth: 0 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                    Nessun dato registrato in questo periodo.
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Padronanza materie */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass-card"
                        style={{
                            borderRadius: '24px',
                            padding: '2rem',
                            cursor: 'default'
                        }}
                    >
                        <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            margin: '0 0 1.5rem 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                        }}>
                            <Award size={24} color="#f59e0b" />
                            Padronanza per Materia ({filtroTemporale === '7d' ? '7 Giorni' : filtroTemporale === '30d' ? '30 Giorni' : 'Storico'})
                        </h3>
                        <div style={{ height: '280px', width: '100%' }}>
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} layout="vertical">
                                        <defs>
                                            <linearGradient id="gradientSuccess" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                                                <stop offset="100%" stopColor="#059669" stopOpacity={1}/>
                                            </linearGradient>
                                            <linearGradient id="gradientWarning" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8}/>
                                                <stop offset="100%" stopColor="#d97706" stopOpacity={1}/>
                                            </linearGradient>
                                            <linearGradient id="gradientDanger" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8}/>
                                                <stop offset="100%" stopColor="#dc2626" stopOpacity={1}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis type="number" hide domain={[0, 100]} />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                                            width={80}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                            contentStyle={{
                                                borderRadius: '12px',
                                                border: '1px solid #233554',
                                                background: '#131c2e',
                                                color: '#f8fafc',
                                            }}
                                        />
                                        <Bar dataKey="score" radius={[0, 12, 12, 0]} barSize={20}>
                                            {chartData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.score >= 75 ? 'url(#gradientSuccess)' : entry.score >= 50 ? 'url(#gradientWarning)' : 'url(#gradientDanger)'}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                    Nessun dato registrato in questo periodo.
                                </div>
                            )}
                        </div>
                    </motion.div>
                </section>

                {/* CTA Errori */}
                <motion.div
                    onClick={() => navigate('/mistakes')}
                    whileHover={{ scale: 1.02 }}
                    className="notion-card animate-border-glow"
                    style={{
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.04) 0%, rgba(30, 41, 59, 0.4) 100%)',
                        padding: '2.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '1.5rem',
                    }}
                >
                    <div style={{ flex: 1, minWidth: '250px' }}>
                        <h4 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0 0 0.5rem 0', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>🎯</span> Sistema di Errori Intelligenti (SRS)
                        </h4>
                        <p style={{ color: '#94a3b8', margin: 0, fontSize: '1.05rem' }}>
                            Hai domande da consolidare? Allena le tue lacune per spostarle da Critiche a Consolidate ed eliminarle del tutto.
                        </p>
                    </div>
                    <button
                        style={{
                            background: '#3b82f6',
                            color: '#fff',
                            border: 'none',
                            padding: '1rem 2rem',
                            borderRadius: '12px',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            transition: 'transform 0.2s',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                    >
                        Apri Archivio Errori
                        <ArrowRight size={20} />
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
