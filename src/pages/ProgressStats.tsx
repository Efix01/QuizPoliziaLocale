import { useMemo } from 'react';
import { useProgress } from '../context/ProgressContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { ChevronLeft, TrendingUp, Target, Award, Clock, ArrowRight } from 'lucide-react';

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

    const chartData = useMemo(() => {
        return Object.entries(perCategoria).map(([id, stats]) => ({
            name: id.toUpperCase().slice(0, 5),
            score: Math.round((stats.corrette / (stats.fatte || 1)) * 100),
            full: 100
        })).slice(0, 6);
    }, [perCategoria]);

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
            
            <header className="max-w-6xl mx-auto mb-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 shadow-sm transition-all">
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase underline decoration-blue-600 decoration-4 underline-offset-8">Analisi <span className="text-blue-600">Performance</span></h1>
                </div>
                <div className="hidden md:flex gap-4">
                     <div className="bg-slate-900 text-white px-6 py-2 rounded-full font-black text-xs tracking-widest uppercase shadow-xl">
                        Livello {livello} · {xp} XP
                     </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto space-y-8">
                
                {/* Top Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Quiz Svolti', val: quizCompletati, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Media Voto', val: `${mediaPercentuale}%`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'Gioni Consecutivi', val: streak, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                        { label: 'Rango Agente', val: 'SCELTO', icon: Award, color: 'text-slate-600', bg: 'bg-slate-100' }
                    ].map((m, i) => (
                        <motion.div 
                            key={i} 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col items-center text-center group hover:shadow-xl transition-all"
                        >
                            <div className={`${m.bg} ${m.color} p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform`}>
                                <m.icon size={24} />
                            </div>
                            <span className="text-3xl font-black text-slate-900 mb-1">{m.val}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{m.label}</span>
                        </motion.div>
                    ))}
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Performance Evolution */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                        <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                            <TrendingUp size={20} className="text-blue-600" /> Andamento Temporale
                        </h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                                    <YAxis hide domain={[0, 100]} />
                                    <Tooltip 
                                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 700 }}
                                      labelStyle={{ color: '#0f172a' }}
                                    />
                                    <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={4} dot={{r: 6, fill: '#2563eb', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 8, strokeWidth: 0}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Category mastery */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                        <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                           <Award size={20} className="text-amber-500" /> Padronanza Materie
                        </h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} layout="vertical">
                                    <XAxis type="number" hide domain={[0, 100]} />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} width={60} />
                                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 700 }} />
                                    <Bar dataKey="score" radius={[0, 10, 10, 0]} barSize={24}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.score >= 70 ? '#10b981' : entry.score >= 40 ? '#f59e0b' : '#ef4444'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom CTA */}
                <div 
                    onClick={() => navigate('/mistakes')}
                    className="bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 cursor-pointer group hover:scale-[1.01] transition-all relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-full bg-blue-600/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="text-center md:text-left z-10">
                        <h4 className="text-2xl font-black text-white mb-2 italic">Analisi Critica Errori</h4>
                        <p className="text-slate-400 font-medium">Hai domande da revisionare? Concentrati sulle tue lacune per massimizzare l'Indice di Prontezza.</p>
                    </div>
                    <div className="flex items-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-lg transition-transform group-hover:translate-x-2 z-10">
                        Revisiona Ora <ArrowRight size={20} />
                    </div>
                </div>

            </main>
        </div>
    );
}
