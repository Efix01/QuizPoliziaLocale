import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePL } from '../context/PLContext';

import { Shield, MapPin, Building, Search, ArrowLeft, Rocket, CheckCircle2, XCircle } from 'lucide-react';
import '../styles/pl-components.css';
import './Onboarding.css';

import regioniData from '../data/regioni_pl.json';

const ONBOARDING_KEY = 'pl_onboarding_completed';

const Onboarding: React.FC = () => {
    const navigate = useNavigate();
    const { setProfilo, cambiaRegione, cambiaComune } = usePL();
    
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [regione, setRegione] = useState<string>('');
    const [comune, setComune] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const rData = regioniData.regioni.find(r => r.id === regione);
    const cData = rData?.citta.find(c => c.id === comune);

    useEffect(() => {
        try {
            if (localStorage.getItem(ONBOARDING_KEY) === 'true') {
                navigate('/', { replace: true });
            }
        } catch { /* localStorage bloccato */ }
    }, [navigate]);

    const handleInizia = async () => {
        setIsSubmitting(true);
        try {
            const isRegioneActive = regione !== '';
            const isComuneActive = comune !== '' && comune !== 'nessuno';
            const bando = cData?.ultimoBando || rData?.citta[0]?.ultimoBando; 
            const par = bando?.parametriEsame || {
                numeroDomande: 100, durataMinuti: 90,
                punteggioCorretta: 1, punteggioErrata: -0.25, punteggioNonData: 0
            };

            setProfilo({
                regioneId: isRegioneActive ? regione : '',
                nomeRegione: rData?.nome || 'Nazionale',
                comuneId: isComuneActive ? comune : undefined,
                nomeComune: cData?.nome,
                parametriEsame: par,
            });

            if (isRegioneActive) await cambiaRegione(regione);
            if (isComuneActive) await cambiaComune(comune);

            localStorage.setItem(ONBOARDING_KEY, 'true');
            navigate('/', { replace: true });
        } catch (error) {
            console.error("Errore salvataggio:", error);
            setIsSubmitting(false);
        }
    };

    // ========================
    // STEP 1
    // ========================
    const renderStep1 = () => {
        const filteredRegioni = regioniData.regioni.filter(
            r => r.nome.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const quickPicks = ['lazio', 'lombardia', 'veneto', 'emilia_romagna', 'toscana', 'piemonte'];

        return (
            <div className="onboarding-step fade-in" style={{ width: '100%', maxWidth: '450px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Shield size={48} style={{ color: '#2563eb', margin: '0 auto 1rem', fill: '#eff6ff' }}/>
                    <h1 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '0.5rem' }}>
                        Preparati al Concorso di<br/>Polizia Locale
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1rem' }}>Dove si svolge il tuo concorso?</p>
                </div>

                <div className="pl-form-group" style={{ position: 'relative' }}>
                    <label className="pl-form-label">Regione:</label>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: '#94a3b8' }}/>
                        <input className="pl-input pl-input--with-icon"
                            type="text" placeholder="Cerca regione..." 
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                {searchTerm.length === 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                        <div className="pl-section-label">Suggerite:</div>
                        <div className="pl-action-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                            {quickPicks.map(id => {
                                const r = regioniData.regioni.find(x => x.id === id);
                                if (!r) return null;
                                return (
                                    <button key={id} className="pl-btn--outline"
                                        onClick={() => { setRegione(id); setStep(2); setSearchTerm(''); }}
                                        style={{ padding: '0.75rem 0.5rem', justifyContent: 'center', fontSize: '0.85rem' }}>
                                        {r.nome}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {searchTerm.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {filteredRegioni.map(r => (
                            <button key={r.id} className="pl-btn--outline"
                                onClick={() => { setRegione(r.id); setStep(2); setSearchTerm(''); }}>
                                {r.nome} — {r.domandeRegionali.disponibili} domande regionali
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // ========================
    // STEP 2
    // ========================
    const renderStep2 = () => (
        <div className="onboarding-step slide-in" style={{ width: '100%', maxWidth: '450px', margin: '0 auto' }}>
            <div className="pl-link" style={{ marginBottom: '2rem', fontWeight: 'bold' }} onClick={() => setStep(1)}>
                <ArrowLeft size={18} style={{ marginRight: '6px' }}/> {rData?.nome}
            </div>

            <h2 className="pl-section-title" style={{ marginBottom: '1.5rem' }}>Per quale comune? (opzionale)</h2>

            <div className="pl-section-label">Comuni con bandi recenti:</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {rData?.citta.filter(c => c.ultimoBando !== null).map(c => (
                    <button key={c.id} className="pl-card pl-card--clickable"
                        onClick={() => { setComune(c.id); setStep(3); }}
                        style={{ textAlign: 'left', marginBottom: 0 }}>
                        <div style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                            <Building size={16} style={{ marginRight: '6px', color: '#2563eb' }}/> {c.nome}
                        </div>
                        {c.ultimoBando && (
                            <>
                                <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '4px' }}>{c.ultimoBando.posti} posti — Bando {c.ultimoBando.anno}</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{c.ultimoBando.parametriEsame.numeroDomande} domande, {c.ultimoBando.parametriEsame.durataMinuti} min, penalità {c.ultimoBando.parametriEsame.punteggioErrata}</div>
                            </>
                        )}
                    </button>
                ))}
            </div>

            <button className="pl-btn--outline" style={{ marginBottom: '0.5rem' }}
                onClick={() => { setComune('nessuno'); setStep(3); }}>
                <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>📌 Altro comune del {rData?.nome}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Userai le domande nazionali + regionali, parametri standard</div>
                </div>
            </button>

            <button className="pl-btn--outline"
                onClick={() => { setComune('nessuno'); setRegione(''); setStep(3); }}>
                <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>⏭️ Non specificare comune</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Solo domande nazionali (+ regionali se disponibili)</div>
                </div>
            </button>
        </div>
    );

    // ========================
    // STEP 3
    // ========================
    const renderStep3 = () => {
        const hqRegione = rData?.domandeRegionali.disponibili || 0;
        const hqComune = cData?.domandeComunali.disponibili || 0;
        const bandoConfig = cData?.ultimoBando?.parametriEsame || { numeroDomande: 100, durataMinuti: 90, punteggioErrata: -0.25 };
        const hasFallback = (hqRegione === 0 || hqComune === 0);

        return (
            <div className="onboarding-step slide-in" style={{ width: '100%', maxWidth: '450px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '1.5rem', textAlign: 'center' }}>
                    ✅ Tutto pronto!
                </h1>

                <div className="pl-card">
                    <div className="pl-location-badge">
                        <MapPin size={20} className="pl-location-badge__icon"/>
                        {rData ? rData.nome : 'Nazionale'} {cData ? `— ${cData.nome}` : ''}
                    </div>

                    <div className="pl-section-label">Il tuo quiz includerà:</div>

                    {/* CORE */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                        <CheckCircle2 size={18} style={{ color: '#10b981', marginRight: '10px', marginTop: '2px' }}/>
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#1e293b' }}>2.700 domande nazionali</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>CdS, TUEL, L.241, L.689, CP, CPP...</div>
                        </div>
                    </div>

                    {/* REGIONE */}
                    {rData && hqRegione > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                            <div style={{ fontSize: '1.2rem', marginRight: '8px' }}>📜</div>
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#1e293b' }}>{hqRegione} domande Regione {rData.nome}</div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{rData.leggeRegionale?.numero || 'Normativa regionale'}</div>
                            </div>
                        </div>
                    ) : rData && hqRegione === 0 ? (
                        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                            <div style={{ fontSize: '1.2rem', marginRight: '8px' }}>🔜</div>
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#1e293b' }}>Regione {rData.nome} (In arrivo!)</div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Domande in preparazione su {rData.leggeRegionale?.numero || 'Legge Reg.'}</div>
                                <div className="pl-link" style={{ marginTop: '4px' }}>[🔔 Avvisami quando disponibili]</div>
                            </div>
                        </div>
                    ) : null}

                    {/* COMUNE */}
                    {cData && hqComune > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '1.2rem', marginRight: '8px' }}>🏛️</div>
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#1e293b' }}>{hqComune} domande {cData.nome}</div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Statuto, Regolamento PL Locale</div>
                            </div>
                        </div>
                    ) : (comune !== '' && comune !== 'nessuno') && hqComune === 0 ? (
                        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '1.5rem', opacity: 0.7 }}>
                            <XCircle size={18} style={{ color: '#ef4444', marginRight: '10px', marginTop: '2px' }}/>
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#1e293b' }}>{cData?.nome || comune}</div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Nessuna domanda comunale disponibile al momento</div>
                            </div>
                        </div>
                    ) : null}

                    <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#475569' }}>
                        <strong>Simulazione: </strong>{bandoConfig.numeroDomande} domande / {bandoConfig.durataMinuti} min<br/>
                        <strong>Penalità: </strong>{bandoConfig.punteggioErrata} per errore
                    </div>
                </div>

                {hasFallback ? (
                    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '1.4rem', marginRight: '10px' }}>💡</div>
                        <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.4' }}>
                            Puoi iniziare subito con le 2.700 domande nazionali che coprono il <strong>65-70%</strong> di qualsiasi concorso PL!
                        </div>
                    </div>
                ) : (
                    <div className="pl-meta-text" style={{ marginBottom: '1.5rem' }}>
                        ℹ️ Puoi cambiare regione/comune in qualsiasi momento dalle impostazioni
                    </div>
                )}

                <button className="pl-btn pl-btn--primary" onClick={handleInizia} disabled={isSubmitting}>
                    {isSubmitting ? 'Configurazione...' : hasFallback ? 'INIZIA CON LE NAZIONALI' : 'INIZIA A STUDIARE'}
                    {!isSubmitting && <Rocket size={20} style={{ marginLeft: '10px' }}/>}
                </button>
            </div>
        );
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
        </div>
    );
};

export default Onboarding;
