import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePL } from '../context/PLContext';
import { useProgress } from '../context/ProgressContext';
import { useQuizPL } from '../hooks/useQuizPL';

import { ArrowLeft, Target, Car, Building2, Scale, ScrollText, AlertTriangle, Search } from 'lucide-react';
import '../styles/pl-components.css';

const colorHex: Record<string, string> = {
    green: '#10b981', yellow: '#f59e0b', red: '#ef4444', gray: '#94a3b8'
};

const getProgressColor = (pct: number): string => {
    if (pct >= 75) return 'green';
    if (pct >= 40) return 'yellow';
    if (pct > 0) return 'red';
    return 'gray';
};

const QuickQuizMenu: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { profilo, domandeRegionali, domandeComunali } = usePL();
    const { progressiGlobali, erroriLog } = useProgress();
    const { generaQuizVeloce, generaQuizCategoria, generaQuizStrato, generaQuizId } = useQuizPL();

    // Auto-start se la URL contiene ?mode=mistakes (sopravvive al reload)
    useEffect(() => {
        if (searchParams.get('mode') === 'mistakes') {
            const errorIds = Object.keys(erroriLog);
            if (errorIds.length > 0) {
                const domande = generaQuizId(errorIds);
                navigate('/study', { state: { domande, mode: 'errori' } });
            }
        }
    }, [searchParams, erroriLog, generaQuizId, navigate]);

    const perCategoria = progressiGlobali?.perCategoria ?? {};

    const getPct = (catId: string): number => {
        const cat = perCategoria[catId];
        if (!cat || cat.fatte === 0) return 0;
        return Math.round((cat.corrette / cat.fatte) * 100);
    };

    const materieNazionali = [
        { id: 'cds', nome: 'CdS', icon: <Car size={18}/> },
        { id: 'tuel', nome: 'TUEL', icon: <Building2 size={18}/> },
        { id: 'l241', nome: 'L.241', icon: <Scale size={18}/> },
        { id: 'l689', nome: 'L.689', icon: <ScrollText size={18}/> },
        { id: 'penale', nome: 'Penale', icon: <AlertTriangle size={18}/> },
        { id: 'procedura', nome: 'Proc.P.', icon: <Search size={18}/> },
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

    return (
        <div className="pl-page pl-page--compact">
            
            {/* Header */}
            <div className="pl-header">
                <ArrowLeft className="pl-header__back" onClick={() => navigate(-1)} />
                <h1 className="pl-header__title">Quiz Veloce</h1>
            </div>

            <h2 className="pl-section-title">Cosa vuoi ripassare?</h2>

            {/* MIX COMPLETO */}
            <button className="pl-card pl-card--highlight pl-card--clickable" onClick={startMix}
                style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '2rem', textAlign: 'left', outline: 'none', width: '100%' }}>
                <div className="pl-action-card__icon pl-action-card__icon--blue" style={{ width: '48px', height: '48px', borderRadius: '12px', marginRight: '1rem', flexShrink: 0 }}>
                    <Target size={26} />
                </div>
                <div>
                    <div className="pl-strato-btn__title" style={{ fontSize: '1.1rem' }}>Mix completo</div>
                    <div className="pl-strato-btn__sub" style={{ lineHeight: '1.4' }}>
                        20 domande da tutto il programma<br/>
                        (nazionali {domandeRegionali.length > 0 ? `+ ${profilo?.nomeRegione}` : ''} {domandeComunali.length > 0 ? `+ ${profilo?.nomeComune}` : ''})
                    </div>
                </div>
            </button>

            {/* MATERIE NAZIONALI */}
            <div style={{ marginBottom: '2.5rem' }}>
                <div className="pl-section-label">MATERIE NAZIONALI</div>
                
                <div className="pl-action-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    {materieNazionali.map(m => {
                        const pct = getPct(m.id);
                        const fatte = perCategoria[m.id]?.fatte ?? 0;
                        const colorKey = getProgressColor(pct);
                        return (
                            <button key={m.id} className="pl-action-card" onClick={() => startCategoria(m.id)}
                                style={{ alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', color: '#3b82f6' }}>
                                    {m.icon} <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#1e293b', marginLeft: '6px' }}>{m.nome}</span>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '6px' }}>{fatte} fatte</div>
                                <div className="pl-progress pl-progress--sm" style={{ width: '100%' }}>
                                    <div className={`pl-progress__fill pl-progress__fill--${colorKey}`} style={{ width: `${pct}%` }}/>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: colorHex[colorKey], fontWeight: '600', marginTop: '4px' }}>{pct}%</div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* REGIONALE */}
            {domandeRegionali.length > 0 && profilo && (
                <div style={{ marginBottom: '2.5rem' }}>
                    <div className="pl-section-label">REGIONE {profilo.nomeRegione}</div>
                    <button className="pl-strato-btn" onClick={() => startStrato('regionale')}>
                        <span className="pl-strato-btn__emoji">📜</span>
                        <div style={{ flex: 1 }}>
                            <div className="pl-strato-btn__title">Regionale — {profilo.nomeRegione}</div>
                            <div className="pl-strato-btn__sub">{domandeRegionali.length} domande  |  {getPct(regionePrefix)}% completato</div>
                        </div>
                    </button>
                </div>
            )}

            {/* COMUNALE */}
            {domandeComunali.length > 0 && profilo?.nomeComune && (
                <div>
                    <div className="pl-section-label">{profilo.nomeComune}</div>
                    <button className="pl-strato-btn" onClick={() => startStrato('comunale')}>
                        <span className="pl-strato-btn__emoji">🏛️</span>
                        <div style={{ flex: 1 }}>
                            <div className="pl-strato-btn__title">Statuto e Regolamento {profilo.nomeComune}</div>
                            <div className="pl-strato-btn__sub">{domandeComunali.length} domande  |  {getPct(comunePrefix)}% completato</div>
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
};

export default QuickQuizMenu;
