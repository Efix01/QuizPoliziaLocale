import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePL } from '../context/PLContext';
import { useProgress } from '../context/ProgressContext';
import { useQuizPL } from '../hooks/useQuizPL';

import { ArrowLeft, Rocket, AlertTriangle, MapPin } from 'lucide-react';
import '../styles/pl-components.css';

const SimulationMenu: React.FC = () => {
    const navigate = useNavigate();
    const { profilo, domandeRegionali, domandeComunali } = usePL();
    const { progressiGlobali } = useProgress();
    const { generaSimulazione, parametriEsame } = useQuizPL();

    if (!profilo || !parametriEsame) {
        return <div className="pl-page" style={{ textAlign: 'center' }}>Caricamento Dati Esame...</div>;
    }

    const pg = progressiGlobali;
    const prevSimulations = pg?.quizCompletati ?? 0;

    const totale = parametriEsame.numeroDomande;
    const targetComunali = domandeComunali.length > 0 ? Math.min(Math.round(totale * 0.05), domandeComunali.length) : 0;
    const targetRegionali = domandeRegionali.length > 0 ? Math.min(Math.round(totale * 0.25), domandeRegionali.length) : 0;
    const targetNazionali = totale - targetRegionali - targetComunali;

    const maxParam = Math.max(targetNazionali, targetRegionali, targetComunali, 1);
    const wNaz = (targetNazionali / maxParam) * 100;
    const wReg = (targetRegionali / maxParam) * 100;
    const wCom = (targetComunali / maxParam) * 100;

    const startSimulazione = () => {
        const activeQuestions = generaSimulazione();
        navigate('/simulation', { state: { domande: activeQuestions, parametriEsame } });
    };

    return (
        <div className="pl-page pl-page--compact">
            
            {/* Header */}
            <div className="pl-header">
                <ArrowLeft className="pl-header__back" onClick={() => navigate(-1)} />
                <h1 className="pl-header__title">Simulazione Esame</h1>
            </div>

            <h2 className="pl-section-title">Parametri:</h2>

            {/* Box RIEPILOGO */}
            <div className="pl-card">
                <div className="pl-location-badge">
                    <MapPin size={20} className="pl-location-badge__icon"/>
                    {profilo.nomeRegione} {profilo.nomeComune ? `— ${profilo.nomeComune}` : ''}
                </div>

                <div className="pl-stat-grid">
                    <div className="pl-stat-item">
                        <span className="pl-stat-item__emoji">📝</span>
                        <strong>{parametriEsame.numeroDomande}</strong>&nbsp;domande
                    </div>
                    <div className="pl-stat-item">
                        <span className="pl-stat-item__emoji">⏱️</span>
                        <strong>{parametriEsame.durataMinuti}</strong>&nbsp;minuti
                    </div>
                    <div className="pl-stat-item pl-stat-item--success">
                        <span className="pl-stat-item__emoji">✅</span>
                        +{parametriEsame.punteggioCorretta} p.to corretta
                    </div>
                    <div className="pl-stat-item pl-stat-item--error">
                        <span className="pl-stat-item__emoji">❌</span>
                        {parametriEsame.punteggioErrata} errata
                    </div>
                    <div className="pl-stat-item pl-stat-item--muted">
                        <span className="pl-stat-item__emoji">⬜</span>
                        {parametriEsame.punteggioNonData} non risposta
                    </div>
                </div>

                {/* Composizione */}
                <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#475569', marginBottom: '0.75rem' }}>Composizione:</div>
                    
                    <div className="pl-composition-row">
                        <div className="pl-composition-row__bar">
                            <div className="pl-composition-row__fill" style={{ width: `${wNaz}%`, backgroundColor: '#3b82f6' }}/>
                        </div>
                        <span className="pl-composition-row__label">{targetNazionali} nazionali</span>
                    </div>

                    <div className="pl-composition-row">
                        <div className="pl-composition-row__bar">
                            <div className="pl-composition-row__fill" style={{ width: `${wReg}%`, backgroundColor: '#8b5cf6' }}/>
                        </div>
                        <span className="pl-composition-row__label">{targetRegionali} regionali</span>
                    </div>

                    {targetComunali > 0 && (
                        <div className="pl-composition-row">
                            <div className="pl-composition-row__bar">
                                <div className="pl-composition-row__fill" style={{ width: `${wCom}%`, backgroundColor: '#64748b' }}/>
                            </div>
                            <span className="pl-composition-row__label">{targetComunali} comunali</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Avviso */}
            <div className="pl-alert pl-alert--warning">
                <AlertTriangle size={20} className="pl-alert__icon"/>
                <div className="pl-alert__text">
                    <strong>La simulazione riproduce le condizioni reali</strong> del concorso di {profilo.nomeComune || profilo.nomeRegione}. Il timer partirà immediatamente all'avvio.
                </div>
            </div>

            <button className="pl-btn pl-btn--primary" onClick={startSimulazione} style={{ marginBottom: '1.5rem' }}>
                <Rocket size={22} style={{ marginRight: '10px' }}/> INIZIA SIMULAZIONE
            </button>

            <div className="pl-meta-text">
                Hai completato {prevSimulations} quiz finora
            </div>
        </div>
    );
};

export default SimulationMenu;
