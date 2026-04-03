import React, { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePL } from '../context/PLContext';
import { useProgress } from '../context/ProgressContext';
import { useQuizPL } from '../hooks/useQuizPL';
import { motion, type Variants } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
    MapPin, 
    Settings2, 
    ClipboardList, 
    RotateCcw, 
    BookOpen, 
    ChevronRight, 
    TrendingUp,
    Shield,
    TrendingDown,
    Target
} from 'lucide-react';

import manualeData from '../data/manuale_pl.json';
import '../styles/dashboard-elite.css';

// --- COMPONENTI INLINE PER EVITARE RIFERIMENTI ESTERNI (FIX STABILITÀ) ---

const ExperienceProgressInline: React.FC<{ xp: number; level: number; xpPerLevel?: number }> = ({ 
  xp, 
  level, 
  xpPerLevel = 500 
}) => {
  const currentXPPercent = Math.min(100, Math.max(0, ((xp % xpPerLevel) / xpPerLevel) * 100));
  return (
    <div className="xp-container">
      <div className="xp-label-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div>
          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', display: 'block', textTransform: 'uppercase' }}>ESPERIENZA</span>
          <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'white' }}>
            {xp.toLocaleString()} <span style={{ fontSize: '0.8rem', opacity: 0.5, fontWeight: '400' }}>XP</span>
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', display: 'block', textTransform: 'uppercase' }}>GRADO</span>
          <span className="xp-level-badge" style={{ backgroundColor: 'var(--pl-gold)', color: 'black', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>
            {level}
          </span>
        </div>
      </div>
      <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '100px', overflow: 'hidden', marginBottom: '8px' }}>
        <motion.div
          style={{ height: '100%', background: 'linear-gradient(90deg, var(--pl-gold), var(--pl-gold-light))' }}
          initial={{ width: 0 }}
          animate={{ width: `${currentXPPercent}%` }}
          transition={{ duration: 1.2 }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>
        <span>LVL {level}</span>
        <span>{xpPerLevel - (xp % xpPerLevel)} XP AL PROSSIMO GRADO</span>
        <span>LVL {level + 1}</span>
      </div>
    </div>
  );
};

// --- COMPONENTE DASHBOARD PRINCIPALE ---

const Dashboard: React.FC = () => {
    const { profilo, isLoading, domandeRegionali, domandeComunali } = usePL();
    const { progressiGlobali, erroriLog, srsData } = useProgress();
    const { generaQuizVeloce, generaQuizId, generaQuizStrato } = useQuizPL();
    const navigate = useNavigate();
    const { user } = useAuth();

    const {
        quizCompletati = 0,
        mediaPercentuale = 0,
        streak = 0,
        perCategoria = {},
        xp = 0,
        livello = 1,
        capitoliLetti = []
    } = progressiGlobali || {};

    useEffect(() => {
        if (!isLoading && !profilo) {
            navigate('/welcome', { replace: true });
        }
    }, [profilo, isLoading, navigate]);

    const totaleCapitoliManuale = useMemo(() => {
        return Object.values(manualeData).reduce((acc, cat) => acc + (cat.capitoli?.length || 0), 0);
    }, []);

    const { statsByLayer, totals } = useMemo(() => {
      const stats = { core: { fatte: 0, corrette: 0 }, regionale: { fatte: 0, corrette: 0 }, comunale: { fatte: 0, corrette: 0 } };
      const totalCounts = { core: 60, regionale: domandeRegionali.length || 0, comunale: domandeComunali.length || 0 };

      Object.entries(perCategoria).forEach(([catId, s]) => {
          if (catId.startsWith('reg_')) {
              stats.regionale.fatte += s.fatte;
              stats.regionale.corrette += s.corrette;
          } else if (catId.startsWith('com_')) {
              stats.comunale.fatte += s.fatte;
              stats.comunale.corrette += s.corrette;
          } else {
              stats.core.fatte += s.fatte;
              stats.core.corrette += s.corrette;
          }
      });
      return { statsByLayer: stats, totals: totalCounts };
    }, [perCategoria, domandeRegionali.length, domandeComunali.length]);

    const pctCore = statsByLayer.core.fatte > 0 ? Math.round((statsByLayer.core.corrette / statsByLayer.core.fatte) * 100) : 0;
    const pctRegionale = statsByLayer.regionale.fatte > 0 ? Math.round((statsByLayer.regionale.corrette / statsByLayer.regionale.fatte) * 100) : 0;
    const pctComunale = statsByLayer.comunale.fatte > 0 ? Math.round((statsByLayer.comunale.corrette / statsByLayer.comunale.fatte) * 100) : 0;

    const indiceProntezza = Math.round((pctCore * 0.70) + (pctRegionale * 0.25) + (pctComunale * 0.05));

    const srsDueToday = useMemo(() => {
        const now = new Date();
        return Object.values(srsData).filter(item => new Date(item.nextReview) <= now).length;
    }, [srsData]);

    const smartCTA = useMemo(() => {
        const errCount = Object.keys(erroriLog).length;
        if (errCount > 10) return { label: `Ripassa ${errCount} errori`, path: '/study', state: { mode: 'errori', domande: generaQuizId(Object.keys(erroriLog)) }, type: 'error', desc: 'Stabilizza le basi' };
        if (pctRegionale < 50 && domandeRegionali.length > 0) return { label: 'Allenati sul Regionale', path: '/study', state: { mode: 'regionale', domande: generaQuizStrato('regionale', 20) }, type: 'warning', desc: `Focus su ${profilo?.nomeRegione}` };
        if (pctComunale < 50 && domandeComunali.length > 0) return { label: 'Studia il Comunale', path: '/study', state: { mode: 'comunale', domande: generaQuizStrato('comunale', 20) }, type: 'warning', desc: `Focus su ${profilo?.nomeComune}` };
        if (streak === 0) return { label: 'Inizia la tua Striscia', path: '/study', state: { mode: 'veloce', domande: generaQuizVeloce(20) }, type: 'info', desc: 'Fai il primo quiz' };
        return { label: 'Quiz Veloce', path: '/study', state: { mode: 'veloce', domande: generaQuizVeloce(20) }, type: 'default', desc: 'Mantieni i riflessi' };
    }, [erroriLog, pctRegionale, pctComunale, domandeRegionali.length, domandeComunali.length, streak, profilo, generaQuizId, generaQuizStrato, generaQuizVeloce]);

    const handlePrimaryCTA = (action: string) => {
        if (action === 'smart') { navigate(smartCTA.path, { state: smartCTA.state }); return; }
        if (action === 'mistakes') { navigate('/study', { state: { domande: generaQuizId(Object.keys(erroriLog)), mode: 'errori' } }); }
        else if (action === 'simulation') { navigate('/simulation'); }
        else { navigate('/study', { state: { domande: generaQuizVeloce(20), mode: 'veloce' } }); }
    };

    const getLayerColor = (pct: number) => {
        if (pct >= 70) return '#22c55e';
        if (pct >= 40) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div className="dashboard-elite">
            <header className="elite-header">
                <div className="profile-section">
                    <div className="profile-section__sub">Comandante in Prova</div>
                    <h1 className="profile-section__name">{user?.displayName || 'Agente'}</h1>
                    <div className="profile-section__location"><MapPin size={14} /> {profilo?.nomeComune}, {profilo?.nomeRegione}</div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="glass-card" style={{ padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span style={{ fontSize: '0.7rem', opacity: 0.6, textTransform: 'uppercase' }}>Livello</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--pl-gold)' }}>{livello}</span>
                    </div>
                    <button className="glass-card icon-btn" onClick={() => navigate('/settings')}><Settings2 size={20} /></button>
                </div>
            </header>

            <main className="elite-grid">
                <section className="elite-column">
                    <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h3 className="profile-section__sub" style={{ fontSize: '0.9rem', opacity: 0.8 }}>Prontezza Stimata</h3>
                        <div style={{ textAlign: 'center', fontSize: '4.5rem', fontWeight: '900', lineHeight: '1', color: indiceProntezza >= 70 ? '#22c55e' : '#f59e0b', margin: '0.5rem 0' }}>
                            {indiceProntezza}%
                            <div style={{ fontSize: '0.8rem', fontWeight: '500', color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem' }}>
                                {indiceProntezza >= 70 ? 'IDONEO AL SERVIZIO' : 'REVISIONE NECESSARIA'}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {[
                                { label: 'Core Nazionale', pct: pctCore, fatte: statsByLayer.core.fatte, total: totals.core },
                                { label: `Regionale · ${profilo?.nomeRegione}`, pct: pctRegionale, fatte: statsByLayer.regionale.fatte, total: totals.regionale },
                                { label: `Comunale · ${profilo?.nomeComune}`, pct: pctComunale, fatte: statsByLayer.comunale.fatte, total: totals.comunale }
                            ].map((layer, i) => (
                                <div key={i} className="pl-layer-item">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                        <span style={{ fontWeight: '700', color: 'white' }}>{layer.label}</span>
                                        <span style={{ color: 'rgba(255,255,255,0.6)' }}>{layer.fatte}/{layer.total} · <b style={{ color: getLayerColor(layer.pct) }}>{layer.pct}%</b></span>
                                    </div>
                                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', overflow: 'hidden' }}>
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${layer.pct}%` }} style={{ height: '100%', backgroundColor: getLayerColor(layer.pct) }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                            <span>Quiz: <b>{quizCompletati}</b></span>
                            <span>Media: <b>{mediaPercentuale}%</b></span>
                            <span>Streak: <b>🔥 {streak} gg</b></span>
                        </div>

                        <button 
                            onClick={() => handlePrimaryCTA('smart')}
                            className="pl-btn"
                            style={{
                                marginTop: '1rem', width: '100%', padding: '1.25rem', fontSize: '1.1rem', fontWeight: '700', borderRadius: '12px', border: 'none', cursor: 'pointer',
                                color: smartCTA.type === 'default' ? 'black' : 'white',
                                backgroundColor: smartCTA.type === 'error' ? '#ef4444' : smartCTA.type === 'warning' ? '#f59e0b' : smartCTA.type === 'info' ? '#3b82f6' : 'var(--pl-gold)'
                            }}
                        >
                            {smartCTA.label}
                        </button>
                    </div>

                    <div className="glass-card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
                        <ExperienceProgressInline xp={xp} level={livello} />
                    </div>
                </section>

                <section className="elite-column">
                    <div className="section-label"><TrendingUp size={16} /> Operazioni Rapide</div>
                    <div className="bento-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                        <button className="glass-card bento-item" style={{ gridColumn: 'span 2', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => handlePrimaryCTA('simulation')}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <ClipboardList size={24} color="var(--pl-gold)" />
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontWeight: '700', color: 'white' }}>Simulazione Ministeriale</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>60 domande · 60 minuti</div>
                                </div>
                            </div>
                            <ChevronRight size={20} />
                        </button>
                        <button className="glass-card bento-item" style={{ padding: '1rem', textAlign: 'left' }} onClick={() => handlePrimaryCTA('srs')}>
                            <Target size={20} color="#3b82f6" />
                            <div style={{ fontWeight: '700', marginTop: '0.5rem' }}>SRS</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{srsDueToday}</div>
                        </button>
                        <button className="glass-card bento-item" style={{ padding: '1rem', textAlign: 'left' }} onClick={() => handlePrimaryCTA('mistakes')}>
                            <TrendingDown size={20} color="#ef4444" />
                            <div style={{ fontWeight: '700', marginTop: '0.5rem' }}>Errori</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{Object.keys(erroriLog).length}</div>
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
