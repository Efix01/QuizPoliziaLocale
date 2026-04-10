import { useMemo } from 'react';
import { useProgress } from '../context/ProgressContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, Cell
} from 'recharts';
import { 
    ChevronLeft, TrendingUp, Target, Award, Clock, ArrowRight, BarChart3, Zap
} from 'lucide-react';

export default function ProgressStats() {
    const { progressiGlobali } = useProgress();
    const navigate = useNavigate();

    const {
        quizCompletati = 0,
        mediaPercentuale = 0,
        streak = 0,
        xp = 0,
        livello = 1,
        perCategoria = {}
    } = progressiGlobali || {};

    // Dati per grafici
    const chartData = useMemo(() => {
        return Object.entries(perCategoria)
            .map(([id, stats]) => {
                const s = stats as { corrette: number; fatte: number };
                return {
                    name: id.toUpperCase().slice(0, 8),
                    score: Math.round((s.corrette / (s.fatte || 1)) * 100),
                    fatte: s.fatte,
                };
            })
            .sort((a, b) => b.fatte - a.fatte) // Più fatte prima
            .slice(0, 8); // Top 8 categorie
    }, [perCategoria]);

    // XP necessari per prossimo livello (esempio: livello * 1000)
    const xpPerLivello = livello * 1000;
    const xpProgresso = (xp % xpPerLivello) / xpPerLivello * 100;

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* Header */}
                <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={() => navigate('/dashboard')}
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
                            <ChevronLeft size={24} />
                        </button>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                <BarChart3 size={32} color="#3b82f6" />
                                <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>
                                    Analisi Performance
                                </h1>
                            </div>
                            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
                                Statistiche dettagliate del tuo percorso di studio
                            </p>
                        </div>
                    </div>

                    {/* Badge livello */}
                    <div style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: '#fff',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '99px',
                        fontWeight: '700',
                        fontSize: '0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
                    }}>
                        <Zap size={18} />
                        Livello {livello} • {xp} XP
                    </div>
                </header>

                {/* Barra progresso XP */}
                <div style={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '16px',
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
                    <div style={{ height: '12px', background: '#0f172a', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{
                            width: `${xpProgresso}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
                            transition: 'width 0.5s ease',
                        }} />
                    </div>
                </div>

                {/* Metriche principali */}
                <section style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1.5rem',
                }}>
                    {[
                        { label: 'Quiz Completati', val: quizCompletati, icon: Target, color: '#3b82f6', bg: '#1e40af' },
                        { label: 'Media Percentuale', val: `${mediaPercentuale}%`, icon: TrendingUp, color: '#22c55e', bg: '#065f46' },
                        { label: 'Giorni Consecutivi', val: streak > 0 ? streak : 'Inizia oggi!', icon: Clock, color: '#f59e0b', bg: '#92400e' },
                        { label: 'Rango', val: livello >= 10 ? 'Veterano' : livello >= 5 ? 'Esperto' : 'Agente', icon: Award, color: '#a855f7', bg: '#581c87' },
                    ].map((m, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            style={{
                                background: '#1e293b',
                                border: '1px solid #334155',
                                borderRadius: '20px',
                                padding: '2rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                            }}
                            whileHover={{ scale: 1.05, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}
                        >
                            <div style={{
                                background: m.bg,
                                color: m.color,
                                borderRadius: '16px',
                                width: '60px',
                                height: '60px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1rem',
                            }}>
                                <m.icon size={28} />
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#f8fafc', marginBottom: '0.5rem', lineHeight: 1 }}>
                                {m.val}
                            </div>
                            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {m.label}
                            </div>
                        </motion.div>
                    ))}
                </section>

                {/* Grafici */}
                <section style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: '2rem',
                }}>
                    
                    {/* Andamento temporale */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            background: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '24px',
                            padding: '2rem',
                        }}
                    >
                        <h3 style={{
                            fontSize: '1.3rem',
                            fontWeight: '700',
                            margin: '0 0 1.5rem 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                        }}>
                            <TrendingUp size={24} color="#3b82f6" />
                            Andamento per Categoria
                        </h3>
                        <div style={{ height: '280px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
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
                                            border: 'none',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                                            fontWeight: 700,
                                            background: '#1e293b',
                                            color: '#f8fafc',
                                        }}
                                        labelStyle={{ color: '#f8fafc' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        dot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#1e293b' }}
                                        activeDot={{ r: 7, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Padronanza materie */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            background: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '24px',
                            padding: '2rem',
                        }}
                    >
                        <h3 style={{
                            fontSize: '1.3rem',
                            fontWeight: '700',
                            margin: '0 0 1.5rem 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                        }}>
                            <Award size={24} color="#f59e0b" />
                            Padronanza per Materia
                        </h3>
                        <div style={{ height: '280px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} layout="vertical">
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
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                                            fontWeight: 700,
                                            background: '#1e293b',
                                            color: '#f8fafc',
                                        }}
                                    />
                                    <Bar dataKey="score" radius={[0, 12, 12, 0]} barSize={28}>
                                        {chartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.score >= 75 ? '#22c55e' : entry.score >= 50 ? '#f59e0b' : '#ef4444'}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </section>

                {/* CTA Errori */}
                <motion.div
                    onClick={() => navigate('/mistakes')}
                    whileHover={{ scale: 1.02 }}
                    style={{
                        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                        border: '1px solid #334155',
                        borderRadius: '24px',
                        padding: '2.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '1.5rem',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
                    }}
                >
                    <div style={{ flex: 1, minWidth: '250px' }}>
                        <h4 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0 0 0.5rem 0', color: '#f8fafc' }}>
                            🎯 Analisi Critica Errori
                        </h4>
                        <p style={{ color: '#94a3b8', margin: 0, fontSize: '1.05rem' }}>
                            Hai domande da revisionare? Concentrati sulle tue lacune per massimizzare l'Indice di Prontezza.
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
                        Revisiona Ora
                        <ArrowRight size={20} />
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
