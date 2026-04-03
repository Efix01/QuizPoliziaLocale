import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePL } from '../context/PLContext';
import { useProgress } from '../context/ProgressContext';
import { useQuizPL } from '../hooks/useQuizPL';
import { motion, type Variants } from 'framer-motion';

import { useAuth } from '../context/AuthContext';
import { 
    MapPin, 
    Settings2, 
    Zap, 
    ClipboardList, 
    RotateCcw, 
    BookOpen, 
    ChevronRight, 
    Play,
    TrendingUp,
    Clock,
    Award
} from 'lucide-react';

import ReadinessGauge from '../components/dashboard/ReadinessGauge';
import ExperienceProgress from '../components/dashboard/ExperienceProgress';

import manualeData from '../data/manuale_pl.json';
import '../styles/dashboard-elite.css';

// Varianti per animazioni vellutate
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
};

const itemVariants: Variants = {
    hidden: { y: 15, opacity: 0 },
    visible: { 
        y: 0, 
        opacity: 1, 
        transition: { type: 'spring', stiffness: 260, damping: 20 } 
    }
};

const Dashboard: React.FC = () => {
    const { profilo, isLoading } = usePL();
    const { user } = useAuth();
    const { progressiGlobali, erroriLog, srsData } = useProgress();
    const { generaQuizVeloce, generaQuizId } = useQuizPL();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!isLoading && !profilo) {
            navigate('/welcome', { replace: true });
        }
    }, [profilo, isLoading, navigate]);

    // Calcolo capitoli totali dal manuale
    const totaleCapitoliManuale = useMemo(() => {
        return Object.values(manualeData).reduce((acc, cat) => acc + (cat.capitoli?.length || 0), 0);
    }, []);

    const pg = progressiGlobali;
    const {
        streak = 0,
        perCategoria = {},
        quizCompletati = 0,
        mediaPercentuale = 0,
        xp = 0,
        livello = 1,
        capitoliLetti = []
    } = pg || {};

    const erroriCount = Object.keys(erroriLog).length;
    const capitoliLettiCount = capitoliLetti.length;

    // Materie Nazionali
    const materieNazionali = [
        { id: 'cds', label: 'Codice della Strada' }, 
        { id: 'tuel', label: 'TUEL (Enti Locali)' },
        { id: 'l241', label: 'Proc. Amministrativo' }, 
        { id: 'l689', label: 'Sanzioni Amm.' },
        { id: 'penale', label: 'Diritto Penale' },
    ];

    const regionePrefix = `reg_${profilo?.regioneId}`;
    const comunePrefix  = profilo?.comuneId ? `com_${profilo.comuneId}` : '';

    // Calcolo Progressi
    const totaleCorretteCore = materieNazionali.reduce((s, m) => s + (perCategoria[m.id]?.corrette ?? 0), 0);
    const totaleFatteCore    = materieNazionali.reduce((s, m) => s + (perCategoria[m.id]?.fatte    ?? 0), 0);
    const progressoCore      = totaleFatteCore > 0 ? Math.round((totaleCorretteCore / totaleFatteCore) * 100) : 0;

    const fatteRegionali     = perCategoria[regionePrefix]?.fatte    ?? 0;
    const corretteRegionali  = perCategoria[regionePrefix]?.corrette ?? 0;
    const progressoRegionale = fatteRegionali > 0 ? Math.round((corretteRegionali / fatteRegionali) * 100) : 0;

    const fatteComunali      = perCategoria[comunePrefix]?.fatte    ?? 0;
    const corretteComunali   = perCategoria[comunePrefix]?.corrette ?? 0;
    const progressoComunale  = fatteComunali > 0 ? Math.round((corretteComunali / fatteComunali) * 100) : 0;

    // Prontezza (Core 60%, Reg 30%, Com 10%)
    const indicePreparazione = Math.round(
        progressoCore * 0.60 +
        progressoRegionale * 0.30 +
        progressoComunale * 0.10
    );

    // SRS Forecast: domande dovute oggi
    const srsDueToday = useMemo(() => {
        const now = new Date();
        return Object.values(srsData).filter(item => new Date(item.nextReview) <= now).length;
    }, [srsData]);

    const handlePrimaryCTA = (action: string) => {
        if (action === 'mistakes') {
            const errorIds = Object.keys(erroriLog);
            const domande = generaQuizId(errorIds);
            navigate('/study', { state: { domande, mode: 'errori' } });
        } else if (action === 'simulation') {
            navigate('/simulazione');
        } else if (action === 'srs') {
            const duoIds = Object.values(srsData)
                .filter(item => new Date(item.nextReview) <= new Date())
                .map(item => item.domandaId);
            const domande = generaQuizId(duoIds);
            navigate('/study', { state: { domande, mode: 'srs' } });
        } else {
            const domande = generaQuizVeloce(20);
            navigate('/study', { state: { domande, mode: 'veloce' } });
        }
    };

    if (isLoading || !profilo) {
        return (
            <div className="dashboard-elite" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="pl-spinner" />
            </div>
        );
    }

    return (
        <motion.div 
            className="dashboard-elite"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* 1. ELITE HEADER */}
            <motion.header className="elite-header" variants={itemVariants}>
                <div className="profile-section">
                    <div className="profile-section__sub">
                        <MapPin size={14} /> {profilo.nomeRegione} {profilo.nomeComune ? `— ${profilo.nomeComune}` : ''}
                    </div>
                    <h1 className="profile-section__name">{user?.displayName || 'Agente'}</h1>
                    <div style={{ marginTop: '8px' }}>
                        <span className="rank-badge">Grado {livello}</span>
                    </div>
                </div>
                <button 
                  className="glass-card" 
                  style={{ padding: '10px', borderRadius: '12px' }}
                  onClick={() => navigate('/settings')}
                >
                    <Settings2 size={20} className="insight-card__icon" />
                </button>
            </motion.header>

            {/* 2. HERO STATS: READINESS & XP */}
            <motion.div className="hero-stats-grid" variants={itemVariants}>
                <div className="glass-card glass-card--gold readiness-gauge-container">
                    <ReadinessGauge value={indicePreparazione} />
                </div>
                <div className="glass-card xp-container">
                    <ExperienceProgress xp={xp} level={livello} />
                </div>
            </motion.div>

            {/* 3. BENTO GRID ACTIONS */}
            <div className="section-label-elite">
                <TrendingUp size={16} /> Operazioni Rapide
            </div>
            <motion.div className="bento-grid" variants={containerVariants}>
                {/* LARGE: Quick Quiz */}
                <motion.button 
                  className="glass-card bento-item bento-item--large" 
                  onClick={() => handlePrimaryCTA('veloce')}
                  variants={itemVariants}
                  whileHover={{ filter: 'brightness(1.1)' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div className="bento-item__icon" style={{ background: 'rgba(255,255,255,0.1)' }}>
                            <Zap size={24} color="white" />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <div className="bento-item__title" style={{ marginTop: 0 }}>Quiz Veloce</div>
                            <div className="bento-item__sub" style={{ color: 'rgba(255,255,255,0.7)' }}>20 domande mix</div>
                        </div>
                    </div>
                    <ChevronRight size={20} color="rgba(255,255,255,0.5)" />
                </motion.button>

                {/* Simulation */}
                <motion.button 
                  className="glass-card bento-item" 
                  onClick={() => handlePrimaryCTA('simulation')}
                  variants={itemVariants}
                >
                    <div className="bento-item__icon"><ClipboardList size={22} color="var(--pl-blue-light)" /></div>
                    <div>
                        <div className="bento-item__title">Simulazione</div>
                        <div className="bento-item__sub">Esame completo</div>
                    </div>
                </motion.button>

                {/* mistakes */}
                <motion.button 
                  className={`glass-card bento-item ${erroriCount === 0 ? 'opacity-50' : ''}`}
                  onClick={() => handlePrimaryCTA('mistakes')}
                  disabled={erroriCount === 0}
                  variants={itemVariants}
                >
                    <div className="bento-item__icon"><RotateCcw size={22} color="#ef4444" /></div>
                    {erroriCount > 0 && <span className="bento-item__badge">{erroriCount}</span>}
                    <div>
                        <div className="bento-item__title">Errori</div>
                        <div className="bento-item__sub">Ripassa sbagliati</div>
                    </div>
                </motion.button>
            </motion.div>

            {/* 4. INSIGHTS & SRS */}
            <div className="section-label-elite">
                <Clock size={16} /> Analisi Studio
            </div>
            <motion.div variants={itemVariants}>
                {srsDueToday > 0 && (
                    <div className="glass-card insight-card" onClick={() => handlePrimaryCTA('srs')} style={{ cursor: 'pointer' }}>
                        <div className="bento-item__icon" style={{ background: 'rgba(212, 175, 55, 0.1)' }}>
                             <Award size={20} color="var(--pl-gold)" />
                        </div>
                        <div className="insight-card__text">
                            <div className="insight-card__title">Ripasso Programmato</div>
                            <div className="insight-card__desc">Hai {srsDueToday} domande da rivedere per non dimenticare.</div>
                        </div>
                        <Play size={18} color="var(--pl-gold)" />
                    </div>
                )}

                <div className="glass-card insight-card" onClick={() => navigate('/manual')} style={{ cursor: 'pointer' }}>
                    <div className="bento-item__icon">
                         <BookOpen size={20} color="var(--pl-blue-light)" />
                    </div>
                    <div className="insight-card__text">
                        <div className="insight-card__title">Materiale Istituzionale</div>
                        <div className="insight-card__desc">Letto {capitoliLettiCount} di {totaleCapitoliManuale} capitoli del manuale.</div>
                    </div>
                    <ChevronRight size={18} color="var(--slate-text)" />
                </div>
            </motion.div>

            {/* 5. FOOTER STATS */}
            <motion.div 
              className="pl-stats-row" 
              variants={itemVariants}
              style={{ marginTop: '2rem', borderTop: '1px solid var(--glass-border)', padding: '1.5rem 0.5rem' }}
            >
                <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--pl-gold)', fontSize: '1.1rem', fontWeight: '800' }}>🔥 {streak}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--slate-text)' }}>STREAK</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'white', fontSize: '1.1rem', fontWeight: '800' }}>{quizCompletati}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--slate-text)' }}>QUIZ</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'white', fontSize: '1.1rem', fontWeight: '800' }}>{Math.round(mediaPercentuale)}%</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--slate-text)' }}>MEDIA</div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Dashboard;
