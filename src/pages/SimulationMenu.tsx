import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePL } from '../context/PLContext';
import { useProgress } from '../context/ProgressContext';
import { useQuizPL } from '../hooks/useQuizPL';
import { ComposizioneQuizSchemaPL } from '../types/pl';
import { motion, type Variants } from 'framer-motion';

import { ArrowLeft, Rocket, AlertTriangle, MapPin } from 'lucide-react';

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1, 
        transition: { staggerChildren: 0.1 } 
    }
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
        y: 0, 
        opacity: 1, 
        transition: { type: 'spring', stiffness: 300, damping: 25 } 
    }
};

const SimulationMenu: React.FC = () => {
    const navigate = useNavigate();
    const { profilo, domandeCore, domandeRegionali, domandeComunali } = usePL();
    const { progressiGlobali } = useProgress();
    const { generaSimulazione, parametriEsame } = useQuizPL();

    if (!profilo || !parametriEsame) {
        return (
            <div className="dashboard-elite" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="glass-card">Caricamento Dati Esame...</div>
            </div>
        );
    }

    const pg = progressiGlobali;
    const prevSimulations = pg?.quizCompletati ?? 0;

    // SSOT: Calcolo composizione domande in base allo schema
    const config = ComposizioneQuizSchemaPL.parse(profilo?.composizioneQuiz || {});
    const totale = parametriEsame.numeroDomande;
    
    const targetRegionali = Math.min(Math.round(totale * (config.percentualeRegionale / 100)), domandeRegionali.length);
    const targetComunali  = Math.min(Math.round(totale * (config.percentualeComunale / 100)), domandeComunali.length);
    const targetNazionali = Math.min(totale - targetRegionali - targetComunali, domandeCore.length);

    const maxParam = Math.max(targetNazionali, targetRegionali, targetComunali, 1);
    const wNaz = (targetNazionali / maxParam) * 100;
    const wReg = (targetRegionali / maxParam) * 100;
    const wCom = (targetComunali / maxParam) * 100;

    const startSimulazione = () => {
        const activeQuestions = generaSimulazione();
        navigate('/simulation', { state: { domande: activeQuestions, parametriEsame } });
    };

    return (
        <motion.div 
            className="dashboard-elite"
            style={{ paddingBottom: '2rem' }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            
            {/* Header */}
            <motion.div className="elite-header" variants={itemVariants}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div 
                        onClick={() => navigate(-1)}
                        style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px' }}
                    >
                        <ArrowLeft size={20} />
                    </div>
                    <h1 className="profile-section__name">Simulazione Esame</h1>
                 </div>
            </motion.div>

            <motion.div className="section-label-elite" variants={itemVariants}>
                Parametri Concorso Attivo
            </motion.div>

            {/* Box RIEPILOGO */}
            <motion.div className="glass-card" variants={itemVariants} style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--pl-gold)' }}>
                <div className="profile-section__sub" style={{ marginBottom: '1.5rem' }}>
                    <MapPin size={16} />
                    {profilo.nomeRegione} {profilo.nomeComune ? `— ${profilo.nomeComune}` : ''}
                </div>

                <div className="hero-stats-grid" style={{ marginBottom: '1.5rem', gridTemplateColumns: 'repeat(2, 1fr)' }}>
                    <div className="glass-card" style={{ padding: '1rem', textAlign: 'center', background: 'rgba(255,255,255,0.03)' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--slate-text)', textTransform: 'uppercase' }}>Domande</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{parametriEsame.numeroDomande}</div>
                    </div>
                    <div className="glass-card" style={{ padding: '1rem', textAlign: 'center', background: 'rgba(255,255,255,0.03)' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--slate-text)', textTransform: 'uppercase' }}>Tempo</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{parametriEsame.durataMinuti}'</div>
                    </div>
                </div>

                {/* Composizione */}
                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                    <div className="section-label-elite" style={{ fontSize: '0.65rem' }}>
                        Distribuzione Domande
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="xp-container">
                            <div className="xp-label-row">
                                <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Nazionali</span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--slate-text)' }}>{targetNazionali}</span>
                            </div>
                            <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${wNaz}%` }}
                                    style={{ height: '100%', background: 'var(--pl-blue-light)' }}
                                />
                            </div>
                        </div>

                        <div className="xp-container">
                            <div className="xp-label-row">
                                <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Regionali</span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--slate-text)' }}>{targetRegionali}</span>
                            </div>
                            <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${wReg}%` }}
                                    style={{ height: '100%', background: '#8b5cf6' }}
                                />
                            </div>
                        </div>

                        {targetComunali > 0 && (
                            <div className="xp-container">
                                <div className="xp-label-row">
                                    <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Comunali</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--slate-text)' }}>{targetComunali}</span>
                                </div>
                                <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${wCom}%` }}
                                        style={{ height: '100%', background: 'var(--successo)' }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Avviso */}
            <motion.div className="glass-card" variants={itemVariants} style={{ marginBottom: '2rem', display: 'flex', gap: '12px', alignItems: 'center', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
                <AlertTriangle size={20} color="var(--warning)" style={{ flexShrink: 0 }}/>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-text)', lineHeight: '1.4' }}>
                   La simulazione riproduce le condizioni reali. Una volta avviata, il timer non può essere messo in pausa.
                </div>
            </motion.div>

            <motion.button 
                onClick={startSimulazione} 
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ 
                    width: '100%',
                    background: 'linear-gradient(135deg, var(--pl-gold), #b8860b)',
                    color: '#1a1a1a',
                    fontWeight: '800',
                    fontSize: '1rem',
                    padding: '1.25rem',
                    borderRadius: '16px',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    boxShadow: '0 10px 20px rgba(212, 175, 55, 0.2)'
                }}
            >
                <Rocket size={22}/> INIZIA SIMULAZIONE
            </motion.button>

            <motion.div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--slate-text)' }} variants={itemVariants}>
                Hai completato {prevSimulations} simulazioni con questo profilo
            </motion.div>
        </motion.div>
    );
};

export default SimulationMenu;
