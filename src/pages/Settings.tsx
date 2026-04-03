import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePL } from '../context/PLContext';
import type { ParametriEsame } from '../types/progressi';

import { MapPin, AlertTriangle, Settings2, Save, ArrowLeft } from 'lucide-react';
import '../styles/pl-components.css';

import regioniData from '../data/regioni_pl.json';

const Settings: React.FC = () => {
    const navigate = useNavigate();
    const { profilo, setProfilo, cambiaRegione, cambiaComune } = usePL();

    const [regione, setRegione] = useState<string>('');
    const [comune, setComune] = useState<string>('');
    const [parametri, setParametri] = useState<ParametriEsame>({
        numeroDomande: 100, durataMinuti: 90, punteggioCorretta: 1, punteggioErrata: -0.25, punteggioNonData: 0
    });

    useEffect(() => {
        if (profilo) {
            setRegione(profilo.regioneId);
            setComune(profilo.comuneId || 'nessuno');
            setParametri(profilo.parametriEsame);
        }
    }, [profilo]);

    if (!profilo) {
        return <div className="pl-page" style={{ textAlign: 'center' }}>Caricamento Impostazioni...</div>;
    }

    const currentRegioneData = regioniData.regioni.find(r => r.id === regione);
    const currentComuneData = currentRegioneData?.citta.find(c => c.id === comune);

    const handleSalva = async () => {
        if (regione !== profilo.regioneId) await cambiaRegione(regione, currentRegioneData?.nome || 'Regione');
        if (comune !== profilo.comuneId) await cambiaComune(comune === 'nessuno' ? null : comune, currentComuneData?.nome);

        setProfilo({
            ...profilo,
            regioneId: regione,
            nomeRegione: currentRegioneData?.nome || profilo.nomeRegione,
            comuneId: comune === 'nessuno' ? undefined : comune,
            nomeComune: currentComuneData?.nome,
            parametriEsame: parametri,
        });

        navigate(-1);
    };

    const handleParamChange = (field: keyof ParametriEsame, value: number) => {
        setParametri((prev: ParametriEsame) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="pl-page pl-page--compact">
            
            {/* Header */}
            <div className="pl-header">
                <ArrowLeft className="pl-header__back" onClick={() => navigate(-1)} />
                <h1 className="pl-header__title">Impostazioni</h1>
            </div>

            {/* SEZIONE 1: LOCAZIONE */}
            <div className="pl-card">
                <h2 className="pl-section-title">
                    <MapPin size={20} className="pl-section-title__icon" style={{ color: '#2563eb' }}/> Il tuo concorso
                </h2>

                <div className="pl-form-group">
                    <label className="pl-form-label">Regione:</label>
                    <select className="pl-select" value={regione}
                        onChange={(e) => { setRegione(e.target.value); setComune('nessuno'); }}>
                        {regioniData.regioni.map(r => (
                            <option key={r.id} value={r.id}>{r.nome}</option>
                        ))}
                    </select>
                </div>

                <div className="pl-form-group">
                    <label className="pl-form-label">Comune:</label>
                    <select className="pl-select" value={comune}
                        onChange={(e) => setComune(e.target.value)}
                        disabled={!regione || !currentRegioneData}>
                        <option value="nessuno">[ Salta - non specificare ]</option>
                        {currentRegioneData?.citta.map(c => (
                            <option key={c.id} value={c.id}>{c.nome}</option>
                        ))}
                    </select>
                </div>

                <div className="pl-alert pl-alert--warning">
                    <AlertTriangle size={20} className="pl-alert__icon"/>
                    <div className="pl-alert__text">
                        <strong>Cambiando regione/comune:</strong>
                        <ul style={{ margin: '8px 0 0 0', paddingLeft: '1.2rem' }}>
                            <li>Le tue statistiche globali vengono mantenute</li>
                            <li>Le domande regionali/comunali nel mix cambieranno</li>
                            <li>Il ripasso errori resta (per le domande nazionali condivise)</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* SEZIONE 2: PARAMETRI ESAME */}
            <div className="pl-card">
                <h2 className="pl-section-title">
                    <Settings2 size={20} className="pl-section-title__icon" style={{ color: '#8b5cf6' }}/> Parametri esame
                </h2>

                <div className="pl-param-grid" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                    <span className="pl-param-grid__label">Domande per simulazione:</span>
                    <input className="pl-input-number" type="number" min={10} max={200}
                        value={parametri.numeroDomande}
                        onChange={(e) => handleParamChange('numeroDomande', parseInt(e.target.value))} />
                    
                    <span className="pl-param-grid__label">Durata (minuti):</span>
                    <input className="pl-input-number" type="number" min={5}
                        value={parametri.durataMinuti}
                        onChange={(e) => handleParamChange('durataMinuti', parseInt(e.target.value))} />
                    
                    <span className="pl-param-grid__label">Penalità errore:</span>
                    <input className="pl-input-number" type="number" step={0.05}
                        value={parametri.punteggioErrata}
                        onChange={(e) => handleParamChange('punteggioErrata', parseFloat(e.target.value))} />
                    
                    <span className="pl-param-grid__label">Penalità non data:</span>
                    <input className="pl-input-number" type="number" step={0.05}
                        value={parametri.punteggioNonData}
                        onChange={(e) => handleParamChange('punteggioNonData', parseFloat(e.target.value))} />
                </div>

                <div className="pl-meta-text" style={{ fontStyle: 'italic', marginTop: '1rem' }}>
                    ℹ️ Pre-compilati dal bando di {currentComuneData?.nome || currentRegioneData?.nome || 'riferimento'}.<br/>
                    Puoi personalizzarli se il tuo bando ha parametri diversi.
                </div>
            </div>

            <button className="pl-btn pl-btn--primary" onClick={handleSalva}>
                <Save size={20} style={{ marginRight: '8px' }}/> SALVA MODIFICHE
            </button>
        </div>
    );
};

export default Settings;
