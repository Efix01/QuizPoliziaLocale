import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePL } from '../context/PLContext';
import { useProgress } from '../context/ProgressContext';

import { MapPin, Settings2, Zap, ClipboardList, RotateCcw, BookOpen, ChevronRight } from 'lucide-react';
import '../styles/pl-components.css';

const getProgressColor = (pct: number): string => {
    if (pct >= 75) return 'green';
    if (pct >= 40) return 'yellow';
    if (pct > 0) return 'red';
    return 'gray';
};

const colorHex: Record<string, string> = {
    green: '#10b981', yellow: '#f59e0b', red: '#ef4444', gray: '#94a3b8'
};

const Dashboard: React.FC = () => {
    const { profilo, totaleDomandeDisponibili, domandeRegionali, domandeComunali, isLoading } = usePL();
    const { progressiGlobali, erroriLog } = useProgress();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!isLoading && !profilo) {
            navigate('/welcome', { replace: true });
        }
    }, [profilo, isLoading, navigate]);

    if (isLoading || !profilo) {
        return (
            <div className="pl-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div className="pl-spinner" style={{ marginBottom: '1rem' }} />
                <h2 style={{ color: '#64748b' }}>Preparazione concorso...</h2>
            </div>
        );
    }

    const { parametriEsame } = profilo;
    const pg = progressiGlobali;
    const quizCompletati = pg?.quizCompletati ?? 0;
    const mediaPercentuale = pg?.mediaPercentuale ?? 0;
    const streak = pg?.streak ?? 0;
    const perCategoria = pg?.perCategoria ?? {};
    const totaleFatte = Object.values(perCategoria).reduce((s, c) => s + c.fatte, 0);
    const totaleCorrette = Object.values(perCategoria).reduce((s, c) => s + c.corrette, 0);
    const progressoGlobale = totaleFatte > 0 ? Math.round((totaleCorrette / totaleFatte) * 100) : 0;
    const erroriCount = Object.keys(erroriLog).length;
    const capitoliLettiCount = pg?.capitoliLetti?.length ?? 0;

    const materieNazionali = [
        { id: 'cds', label: 'CdS' }, { id: 'tuel', label: 'TUEL' },
        { id: 'l241', label: 'L.241' }, { id: 'l689', label: 'L.689' },
        { id: 'penale', label: 'Dir.Penale' },
    ];

    const getPct = (catId: string): number => {
        const cat = perCategoria[catId];
        if (!cat || cat.fatte === 0) return 0;
        return Math.round((cat.corrette / cat.fatte) * 100);
    };

    const regionePrefix = `reg_${profilo.regioneId}`;
    const comunePrefix = profilo.comuneId ? `com_${profilo.comuneId}` : '';
    const pctRegionale = getPct(regionePrefix);
    const pctComunale = comunePrefix ? getPct(comunePrefix) : 0;

    return (
        <div className="pl-page">
            
            {/* 1. HEADER */}
            <div className="pl-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div className="pl-section-label" style={{ marginBottom: '4px' }}>Concorso Attivo</div>
                    <div className="pl-location-badge" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
                        <MapPin size={18} className="pl-location-badge__icon"/>
                        {profilo.nomeRegione} {profilo.nomeComune ? `— ${profilo.nomeComune}` : ''}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                        {totaleDomandeDisponibili.toLocaleString()} domande disponibili
                    </div>
                </div>
                <button className="pl-btn--outline" style={{ width: 'auto', padding: '0.5rem 0.75rem' }}
                    onClick={() => navigate('/settings')}>
                    Cambia <Settings2 size={16} style={{ marginLeft: '4px' }}/>
                </button>
            </div>

            {/* 2. PROGRESS CARD */}
            <div className="pl-card pl-card--dark">
                <h3 style={{ fontSize: '1rem', margin: '0 0 1rem', fontWeight: '500', color: '#cbd5e1' }}>Il tuo progresso</h3>
                
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div className="pl-progress pl-progress--lg" style={{ flex: 1 }}>
                        <div className="pl-progress__fill pl-progress__fill--blue" style={{ width: `${progressoGlobale}%` }} />
                    </div>
                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem', marginLeft: '1rem' }}>{progressoGlobale}%</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#cbd5e1', paddingTop: '1rem', borderTop: '1px solid #334155' }}>
                    <span>Quiz: <strong>{quizCompletati}</strong></span>
                    <span>Media: <strong>{mediaPercentuale}%</strong></span>
                    <span style={{ color: '#fbbf24' }}>🔥 {streak} gg</span>
                </div>
            </div>

            {/* 3. AZIONI STUDIA */}
            <h2 className="pl-section-title">
                <Zap size={20} className="pl-section-title__icon" style={{ fill: '#f59e0b', color: '#f59e0b' }}/> STUDIA
            </h2>
            <div className="pl-action-grid">
                <button className="pl-action-card" onClick={() => navigate('/quiz-veloce')}>
                    <div className="pl-action-card__icon pl-action-card__icon--blue"><ClipboardList size={22} /></div>
                    <span className="pl-action-card__label">Quiz Veloce</span>
                    <span className="pl-action-card__sub">(20 dom.)</span>
                </button>
                <button className="pl-action-card" onClick={() => navigate('/simulation')}>
                    <div className="pl-action-card__icon pl-action-card__icon--red"><ClipboardList size={22} /></div>
                    <span className="pl-action-card__label">Simulaz. Esame</span>
                    <span className="pl-action-card__sub">({parametriEsame.numeroDomande} dom.)</span>
                </button>
                <button 
                    className={`pl-action-card ${erroriCount === 0 ? 'pl-action-card--disabled' : ''}`} 
                    onClick={() => erroriCount > 0 && navigate('/quiz-veloce', { state: { mode: 'mistakes' } })}
                    disabled={erroriCount === 0}
                >
                    <div className="pl-action-card__icon pl-action-card__icon--purple"><RotateCcw size={22} /></div>
                    <span className="pl-action-card__label">Ripasso Errori</span>
                    <span className="pl-action-card__sub">({erroriCount})</span>
                </button>
            </div>

            {/* 4. PER MATERIA */}
            <h2 className="pl-section-title">📊 Per materia</h2>
            <div className="pl-card">
                {/* NAZIONALI */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <div className="pl-section-label">NAZIONALI</div>
                    {materieNazionali.map(m => {
                        const pct = getPct(m.id);
                        const colorKey = getProgressColor(pct);
                        return (
                            <div key={m.id} className="pl-materia-row">
                                <span className="pl-materia-row__label">{m.label}</span>
                                <div className="pl-materia-row__bar">
                                    <div className="pl-progress">
                                        <div className={`pl-progress__fill pl-progress__fill--${colorKey}`} style={{ width: `${pct}%` }}/>
                                    </div>
                                </div>
                                <span className="pl-materia-row__pct" style={{ color: colorHex[colorKey] }}>{pct}%</span>
                            </div>
                        );
                    })}
                </div>

                {/* REGIONE */}
                {domandeRegionali.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div className="pl-section-label">REGIONE {profilo.nomeRegione}</div>
                        <div className="pl-materia-row">
                            <span className="pl-materia-row__label">Regionale</span>
                            <div className="pl-materia-row__bar">
                                <div className="pl-progress">
                                    <div className={`pl-progress__fill pl-progress__fill--${getProgressColor(pctRegionale)}`} style={{ width: `${pctRegionale}%` }}/>
                                </div>
                            </div>
                            <span className="pl-materia-row__pct" style={{ color: colorHex[getProgressColor(pctRegionale)] }}>{pctRegionale}%</span>
                        </div>
                    </div>
                )}

                {/* COMUNE */}
                {domandeComunali.length > 0 && profilo.nomeComune && (
                    <div>
                        <div className="pl-section-label">{profilo.nomeComune}</div>
                        <div className="pl-materia-row">
                            <span className="pl-materia-row__label">Comunale</span>
                            <div className="pl-materia-row__bar">
                                <div className="pl-progress">
                                    <div className={`pl-progress__fill pl-progress__fill--${getProgressColor(pctComunale)}`} style={{ width: `${pctComunale}%` }}/>
                                </div>
                            </div>
                            <span className="pl-materia-row__pct" style={{ color: colorHex[getProgressColor(pctComunale)] }}>{pctComunale}%</span>
                        </div>
                    </div>
                )}
            </div>

            {/* 5. MATERIALE DI STUDIO */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 className="pl-section-title" style={{ margin: 0 }}>
                    <BookOpen size={20} className="pl-section-title__icon" style={{ color: '#8b5cf6' }}/> MATERIALE
                </h2>
                <span className="pl-link" onClick={() => navigate('/manual')}>
                    Vedi libreria <ChevronRight size={16}/>
                </span>
            </div>
            <div className="pl-hscroll">
                <div className="pl-hscroll__item" onClick={() => navigate('/manual')}>
                    <div className="pl-hscroll__item-title">Manuale di Studio</div>
                    <div className="pl-hscroll__item-sub">{capitoliLettiCount} capitoli letti</div>
                </div>
                {domandeRegionali.length > 0 && (
                    <div className="pl-hscroll__item">
                        <div className="pl-hscroll__item-title">Regionale</div>
                        <div className="pl-hscroll__item-sub">4 lezioni</div>
                    </div>
                )}
                {domandeComunali.length > 0 && (
                    <div className="pl-hscroll__item">
                        <div className="pl-hscroll__item-title">Comunale</div>
                        <div className="pl-hscroll__item-sub">2 schede</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
