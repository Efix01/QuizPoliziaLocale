import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePL } from '../context/PLContext';
import type { ParametriEsame } from '../types/progressi';
import { MapPin, AlertTriangle, Settings2, Save, ArrowLeft, Check } from 'lucide-react';
import regioniData from '../data/regioni_pl.json';

export default function Settings() {
    const navigate = useNavigate();
    const { profilo, setProfilo, cambiaRegione, cambiaComune } = usePL();

    const [regione, setRegione] = useState<string>('');
    const [comune, setComune] = useState<string>('');
    const [parametri, setParametri] = useState<ParametriEsame>({
        numeroDomande: 100,
        durataMinuti: 90,
        punteggioCorretta: 1,
        punteggioErrata: -0.25,
        punteggioNonData: 0,
    });
    const [isSaving, setIsSaving] = useState(false);

    const [prevProfilo, setPrevProfilo] = useState(profilo);
    if (profilo !== prevProfilo) {
        setPrevProfilo(profilo);
        if (profilo) {
            setRegione(profilo.regioneId);
            setComune(profilo.comuneId || 'nessuno');
            setParametri(profilo.parametriEsame);
        }
    }

    if (!profilo) {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#0f172a',
                color: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
            }}>
                Caricamento Impostazioni...
            </div>
        );
    }

    const currentRegioneData = regioniData.regioni.find(r => r.id === regione);
    const currentComuneData = currentRegioneData?.citta.find(c => c.id === comune);

    const handleSalva = async () => {
        setIsSaving(true);

        try {
            if (regione !== profilo.regioneId) {
                await cambiaRegione(regione, currentRegioneData?.nome || 'Regione');
            }
            if (comune !== profilo.comuneId) {
                await cambiaComune(comune, currentComuneData?.nome || 'Comune');
            }

            setProfilo({
                ...profilo,
                regioneId: regione,
                nomeRegione: currentRegioneData?.nome || profilo.nomeRegione,
                comuneId: comune === 'nessuno' ? undefined : comune,
                nomeComune: currentComuneData?.nome,
                parametriEsame: parametri,
            });

            // Feedback visivo prima di uscire
            setTimeout(() => {
                navigate(-1);
            }, 800);
        } catch (error) {
            console.error('Errore salvataggio impostazioni:', error);
            setIsSaving(false);
        }
    };

    const handleParamChange = (field: keyof ParametriEsame, value: number) => {
        setParametri(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* Header */}
                <header style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => navigate(-1)}
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
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                            <Settings2 size={32} color="#3b82f6" />
                            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>
                                Impostazioni
                            </h1>
                        </div>
                        <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
                            Configura il tuo concorso e i parametri d'esame
                        </p>
                    </div>
                </header>

                {/* SEZIONE 1: LOCAZIONE */}
                <section style={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '24px',
                    padding: '2rem',
                }}>
                    <h2 style={{
                        fontSize: '1.3rem',
                        fontWeight: '700',
                        margin: '0 0 1.5rem 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                    }}>
                        <MapPin size={24} color="#3b82f6" />
                        Il tuo concorso
                    </h2>

                    {/* Regione */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.75rem',
                            color: '#cbd5e1',
                            fontWeight: '600',
                            fontSize: '0.95rem',
                        }}>
                            Regione:
                        </label>
                        <select
                            value={regione}
                            onChange={(e) => {
                                setRegione(e.target.value);
                                setComune('nessuno');
                            }}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: '#0f172a',
                                border: '1px solid #334155',
                                color: '#f8fafc',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                cursor: 'pointer',
                            }}
                        >
                            {regioniData.regioni.map(r => (
                                <option key={r.id} value={r.id}>
                                    {r.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Comune */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.75rem',
                            color: '#cbd5e1',
                            fontWeight: '600',
                            fontSize: '0.95rem',
                        }}>
                            Comune:
                        </label>
                        <select
                            value={comune}
                            onChange={(e) => setComune(e.target.value)}
                            disabled={!regione || !currentRegioneData}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: '#0f172a',
                                border: '1px solid #334155',
                                color: '#f8fafc',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                cursor: regione && currentRegioneData ? 'pointer' : 'not-allowed',
                                opacity: regione && currentRegioneData ? 1 : 0.5,
                            }}
                        >
                            <option value="nessuno">[ Salta - non specificare ]</option>
                            {currentRegioneData?.citta.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Alert */}
                    <div style={{
                        background: '#92400e',
                        border: '1px solid #c2410c',
                        borderRadius: '12px',
                        padding: '1rem',
                        display: 'flex',
                        gap: '1rem',
                    }}>
                        <AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '0.25rem' }} />
                        <div style={{ fontSize: '0.95rem', color: '#fef3c7' }}>
                            <strong style={{ color: '#fde68a', display: 'block', marginBottom: '0.5rem' }}>
                                Cambiando regione/comune:
                            </strong>
                            <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 1.7 }}>
                                <li>Le tue statistiche globali vengono mantenute</li>
                                <li>Le domande regionali/comunali nel mix cambieranno</li>
                                <li>Il ripasso errori resta (per le domande nazionali condivise)</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* SEZIONE 2: PARAMETRI ESAME */}
                <section style={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '24px',
                    padding: '2rem',
                }}>
                    <h2 style={{
                        fontSize: '1.3rem',
                        fontWeight: '700',
                        margin: '0 0 1.5rem 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                    }}>
                        <Settings2 size={24} color="#a855f7" />
                        Parametri d'esame
                    </h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        gap: '1rem 2rem',
                        alignItems: 'center',
                        paddingBottom: '1.5rem',
                        borderBottom: '1px solid #334155',
                    }}>
                        <label style={{ color: '#cbd5e1', fontWeight: '600' }}>Domande per simulazione:</label>
                        <input
                            type="number"
                            min={10}
                            max={200}
                            value={parametri.numeroDomande}
                            onChange={(e) => handleParamChange('numeroDomande', parseInt(e.target.value))}
                            style={{
                                width: '100px',
                                padding: '0.5rem 0.75rem',
                                background: '#0f172a',
                                border: '1px solid #334155',
                                color: '#f8fafc',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                textAlign: 'center',
                            }}
                        />

                        <label style={{ color: '#cbd5e1', fontWeight: '600' }}>Durata (minuti):</label>
                        <input
                            type="number"
                            min={5}
                            value={parametri.durataMinuti}
                            onChange={(e) => handleParamChange('durataMinuti', parseInt(e.target.value))}
                            style={{
                                width: '100px',
                                padding: '0.5rem 0.75rem',
                                background: '#0f172a',
                                border: '1px solid #334155',
                                color: '#f8fafc',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                textAlign: 'center',
                            }}
                        />

                        <label style={{ color: '#cbd5e1', fontWeight: '600' }}>Penalità errore:</label>
                        <input
                            type="number"
                            step={0.05}
                            value={parametri.punteggioErrata}
                            onChange={(e) => handleParamChange('punteggioErrata', parseFloat(e.target.value))}
                            style={{
                                width: '100px',
                                padding: '0.5rem 0.75rem',
                                background: '#0f172a',
                                border: '1px solid #334155',
                                color: '#f8fafc',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                textAlign: 'center',
                            }}
                        />

                        <label style={{ color: '#cbd5e1', fontWeight: '600' }}>Penalità non data:</label>
                        <input
                            type="number"
                            step={0.05}
                            value={parametri.punteggioNonData}
                            onChange={(e) => handleParamChange('punteggioNonData', parseFloat(e.target.value))}
                            style={{
                                width: '100px',
                                padding: '0.5rem 0.75rem',
                                background: '#0f172a',
                                border: '1px solid #334155',
                                color: '#f8fafc',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                textAlign: 'center',
                            }}
                        />
                    </div>

                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        background: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '12px',
                        color: '#94a3b8',
                        fontSize: '0.95rem',
                        fontStyle: 'italic',
                        lineHeight: 1.6,
                    }}>
                        ℹ️ Pre-compilati dal bando di{' '}
                        <strong style={{ color: '#cbd5e1' }}>
                            {currentComuneData?.nome || currentRegioneData?.nome || 'riferimento'}
                        </strong>
                        .<br />
                        Puoi personalizzarli se il tuo bando ha parametri diversi.
                    </div>
                </section>

                {/* Pulsante Salva */}
                <button
                    onClick={handleSalva}
                    disabled={isSaving}
                    style={{
                        width: '100%',
                        background: isSaving ? '#22c55e' : '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        padding: '1.25rem',
                        borderRadius: '16px',
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        cursor: isSaving ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        transition: 'all 0.3s',
                        boxShadow: isSaving
                            ? '0 0 0 4px rgba(34, 197, 94, 0.2)'
                            : '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
                    }}
                    onMouseOver={(e) => {
                        if (!isSaving) e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    {isSaving ? (
                        <>
                            <Check size={24} />
                            SALVATO!
                        </>
                    ) : (
                        <>
                            <Save size={24} />
                            SALVA MODIFICHE
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
