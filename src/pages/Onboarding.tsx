import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePL } from '../context/PLContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import {
  MapPin, Building2, CheckCircle2, Shield, BrainCircuit,
  BarChart3, ChevronRight, CalendarDays, SkipForward, ArrowLeft
} from 'lucide-react';
import dataRegioni from '../data/regioni_pl.json';

type Step = 'welcome' | 'regione' | 'comune' | 'data';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cambiaRegione, cambiaComune } = usePL();

  const [step, setStep] = useState<Step>('welcome');
  const [selectedRegioneId, setSelectedRegioneId] = useState<string | null>(null);
  const [selectedRegioneName, setSelectedRegioneName] = useState<string>('');
  const [dataEsame, setDataEsame] = useState('');
  const [saving, setSaving] = useState(false);

  const regioni = dataRegioni?.regioni || [];
  const comuniDisponibili = selectedRegioneId
    ? regioni.find((r: any) => r.id === selectedRegioneId)?.citta || []
    : [];

  const handleRegioneSelect = async (regioneId: string, nomeRegione: string) => {
    setSelectedRegioneId(regioneId);
    setSelectedRegioneName(nomeRegione);
    setStep('comune');
    await cambiaRegione(regioneId, nomeRegione);
  };

  const handleComuneSelect = async (comuneId: string, nomeComune: string) => {
    await cambiaComune(comuneId, nomeComune);
    setStep('data');
  };

  const handleSkipComune = () => setStep('data');

  const handleSalvaData = async (salta = false) => {
    setSaving(true);
    try {
      if (!salta && dataEsame && user) {
        await updateDoc(doc(db, 'users', user.uid), {
          dataEsamePrevista: dataEsame,
        });
      }
    } catch (e) {
      console.error('Errore salvataggio data esame:', e);
    } finally {
      setSaving(false);
      navigate('/dashboard');
    }
  };

  const benefits = [
    {
      icon: BrainCircuit,
      color: '#3b82f6',
      bg: 'rgba(59,130,246,0.12)',
      title: 'Quiz Personalizzato',
      desc: '70% domande nazionali + 30% normativa specifica della tua regione',
    },
    {
      icon: Shield,
      color: '#10b981',
      bg: 'rgba(16,185,129,0.12)',
      title: 'Simulazioni Ufficiali',
      desc: 'Esercitati con la stessa struttura del vero esame: 30 domande, 30 minuti',
    },
    {
      icon: BarChart3,
      color: '#a78bfa',
      bg: 'rgba(167,139,250,0.12)',
      title: 'Traccia i Progressi',
      desc: 'Statistiche dettagliate per sapere dove sei forte e dove migliorare',
    },
  ];

  // --- Calcola giorni mancanti ---
  const giorniMancanti = dataEsame
    ? Math.max(0, Math.ceil((new Date(dataEsame).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const STEP_LABELS: Record<Step, string> = {
    welcome: 'Benvenuto',
    regione: 'Regione',
    comune: 'Comune',
    data: 'Esame',
  };
  const STEP_ORDER: Step[] = ['welcome', 'regione', 'comune', 'data'];
  const currentIdx = STEP_ORDER.indexOf(step);

  return (
    <div style={{
      minHeight: '100vh', background: '#0f172a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        width: '100%', maxWidth: '860px',
        background: '#1e293b', borderRadius: '28px',
        border: '1px solid #334155',
        boxShadow: '0 32px 64px -16px rgba(0,0,0,0.6)',
        overflow: 'hidden',
      }}>

        {/* Barra progresso in cima */}
        <div style={{ height: '4px', background: '#0f172a', display: 'flex' }}>
          {STEP_ORDER.map((s, i) => (
            <div key={s} style={{
              flex: 1,
              background: i <= currentIdx ? '#3b82f6' : 'transparent',
              transition: 'background 0.4s ease',
            }} />
          ))}
        </div>

        <div style={{ padding: '3rem' }}>

          {/* Indicatori step testuali */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            {STEP_ORDER.map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700,
                  background: i < currentIdx ? '#10b981' : i === currentIdx ? '#3b82f6' : '#1e293b',
                  border: `2px solid ${i < currentIdx ? '#10b981' : i === currentIdx ? '#3b82f6' : '#334155'}`,
                  color: i <= currentIdx ? '#fff' : '#64748b',
                  transition: 'all 0.3s',
                }}>
                  {i < currentIdx ? <CheckCircle2 size={14} /> : i + 1}
                </div>
                <span style={{ fontSize: '0.8rem', color: i === currentIdx ? '#f8fafc' : '#64748b', fontWeight: i === currentIdx ? 600 : 400 }}>
                  {STEP_LABELS[s]}
                </span>
                {i < STEP_ORDER.length - 1 && (
                  <div style={{ width: '24px', height: '1px', background: i < currentIdx ? '#10b981' : '#334155', marginLeft: '0.2rem' }} />
                )}
              </div>
            ))}
          </div>

          {/* ═══════════════════════════════════════════════ */}
          {/* STEP 0 — WELCOME                               */}
          {/* ═══════════════════════════════════════════════ */}
          {step === 'welcome' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                  background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)',
                  borderRadius: '100px', padding: '0.4rem 1rem',
                  color: '#3b82f6', fontSize: '0.85rem', fontWeight: 600,
                  marginBottom: '1.5rem',
                }}>
                  <Shield size={14} /> Polizia Locale Quiz
                </div>
                <h1 style={{ fontSize: '2.2rem', color: '#f8fafc', margin: '0 0 1rem 0', lineHeight: 1.2 }}>
                  Ciao {user?.displayName?.split(' ')[0] || 'Agente'},<br />
                  <span style={{ color: '#3b82f6' }}>inizia la tua preparazione</span>
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto' }}>
                  Personalizzeremo il tuo percorso in 3 passi. Ci vogliono meno di un minuto.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem', marginBottom: '3rem' }}>
                {benefits.map((b) => {
                  const Icon = b.icon;
                  return (
                    <div key={b.title} style={{
                      background: '#0f172a', borderRadius: '16px',
                      border: '1px solid #334155', padding: '1.8rem',
                    }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '12px',
                        background: b.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '1rem',
                      }}>
                        <Icon size={24} color={b.color} />
                      </div>
                      <h3 style={{ color: '#f8fafc', fontSize: '1rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>{b.title}</h3>
                      <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0, lineHeight: 1.5 }}>{b.desc}</p>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setStep('regione')}
                style={{
                  width: '100%', padding: '1.1rem', borderRadius: '14px',
                  background: '#3b82f6', border: 'none',
                  color: '#fff', fontWeight: 700, fontSize: '1.05rem',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                  transition: 'background 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.background = '#2563eb'}
                onMouseOut={e => e.currentTarget.style.background = '#3b82f6'}
              >
                Configura il mio profilo <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* ═══════════════════════════════════════════════ */}
          {/* STEP 1 — REGIONE                               */}
          {/* ═══════════════════════════════════════════════ */}
          {step === 'regione' && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.6rem' }}>
                  <div style={{ background: 'rgba(59,130,246,0.12)', padding: '0.6rem', borderRadius: '10px' }}>
                    <MapPin size={22} color="#3b82f6" />
                  </div>
                  <h2 style={{ color: '#f8fafc', fontSize: '1.6rem', margin: 0 }}>In quale regione si terrà il concorso?</h2>
                </div>
                <p style={{ color: '#94a3b8', margin: '0 0 0 3.2rem', fontSize: '0.935rem' }}>
                  Il <strong style={{ color: '#3b82f6' }}>30% del tuo quiz</strong> sarà specifico per le normative e i regolamenti della tua regione
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))', gap: '0.8rem' }}>
                {regioni.map((r: any) => (
                  <button
                    key={r.id}
                    onClick={() => handleRegioneSelect(r.id, r.nome)}
                    style={{
                      background: '#0f172a', border: '1px solid #334155',
                      borderRadius: '12px', padding: '1.2rem',
                      color: '#f8fafc', fontSize: '0.95rem', fontWeight: 500,
                      cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.borderColor = '#3b82f6';
                      e.currentTarget.style.background = 'rgba(59,130,246,0.06)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.borderColor = '#334155';
                      e.currentTarget.style.background = '#0f172a';
                    }}
                  >
                    {r.nome}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════ */}
          {/* STEP 2 — COMUNE                                */}
          {/* ═══════════════════════════════════════════════ */}
          {step === 'comune' && (
            <div>
              <button
                onClick={() => { setStep('regione'); setSelectedRegioneId(null); }}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}
              >
                <ArrowLeft size={16} /> {selectedRegioneName}
              </button>

              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.6rem' }}>
                  <div style={{ background: 'rgba(16,185,129,0.12)', padding: '0.6rem', borderRadius: '10px' }}>
                    <Building2 size={22} color="#10b981" />
                  </div>
                  <h2 style={{ color: '#f8fafc', fontSize: '1.6rem', margin: 0 }}>Per quale comune stai concorrendo?</h2>
                </div>
                <p style={{ color: '#94a3b8', margin: '0 0 0 3.2rem', fontSize: '0.935rem' }}>
                  Le domande comunali (es. regolamento di polizia urbana) saranno aggiunte al tuo quiz
                </p>
              </div>

              {comuniDisponibili.length > 0 ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))', gap: '0.8rem', marginBottom: '1.5rem' }}>
                    {comuniDisponibili.map((c: any) => (
                      <button
                        key={c.id}
                        onClick={() => handleComuneSelect(c.id, c.nome)}
                        style={{
                          background: '#0f172a', border: '1px solid #334155',
                          borderRadius: '12px', padding: '1.2rem',
                          color: '#f8fafc', fontSize: '0.95rem', fontWeight: 500,
                          cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
                        }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.background = 'rgba(16,185,129,0.06)'; }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.background = '#0f172a'; }}
                      >
                        {c.nome}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleSkipComune}
                    style={{
                      width: '100%', padding: '0.9rem', borderRadius: '12px',
                      background: 'transparent', border: '1px dashed #334155',
                      color: '#64748b', cursor: 'pointer', fontWeight: 500,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      transition: 'all 0.2s', fontSize: '0.9rem',
                    }}
                    onMouseOver={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#475569'; }}
                    onMouseOut={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#334155'; }}
                  >
                    <SkipForward size={16} /> Studio solo il percorso regionale (salta questo step)
                  </button>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', background: '#0f172a', borderRadius: '16px', border: '1px dashed #334155' }}>
                  <Building2 size={40} color="#475569" style={{ margin: '0 auto 1rem auto' }} />
                  <h3 style={{ color: '#f8fafc', margin: '0 0 0.5rem 0' }}>Nessun Comune ancora disponibile</h3>
                  <p style={{ color: '#64748b', margin: '0 0 1.5rem 0' }}>Stiamo espandendo il database. Continua con il percorso regionale.</p>
                  <button
                    onClick={handleSkipComune}
                    style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.8rem 1.8rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 }}
                  >
                    Continua con il Regionale →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════ */}
          {/* STEP 3 — DATA ESAME                            */}
          {/* ═══════════════════════════════════════════════ */}
          {step === 'data' && (
            <div style={{ maxWidth: '520px', margin: '0 auto' }}>
              <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '18px',
                  background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.2rem auto',
                }}>
                  <CalendarDays size={30} color="#a78bfa" />
                </div>
                <h2 style={{ color: '#f8fafc', fontSize: '1.7rem', margin: '0 0 0.7rem 0' }}>Hai già una data d'esame?</h2>
                <p style={{ color: '#94a3b8', margin: 0 }}>
                  Se la conosci, attiviamo un <strong style={{ color: '#a78bfa' }}>conto alla rovescia</strong> nella tua dashboard per mantenere il focus.
                </p>
              </div>

              <div style={{ background: '#0f172a', borderRadius: '16px', border: '1px solid #334155', padding: '2rem', marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Data esame prevista
                </label>
                <input
                  type="date"
                  value={dataEsame}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setDataEsame(e.target.value)}
                  style={{
                    width: '100%', padding: '1rem',
                    background: '#1e293b', border: '1px solid #334155',
                    borderRadius: '10px', color: '#f8fafc',
                    fontSize: '1rem', outline: 'none',
                    boxSizing: 'border-box',
                    colorScheme: 'dark',
                  }}
                />

                {giorniMancanti !== null && (
                  <div style={{
                    marginTop: '1rem', padding: '1rem', borderRadius: '10px',
                    background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)',
                    display: 'flex', alignItems: 'center', gap: '0.8rem',
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#a78bfa', lineHeight: 1 }}>{giorniMancanti}</div>
                    <div>
                      <div style={{ color: '#f8fafc', fontWeight: 700 }}>giorni all'esame</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                        {giorniMancanti > 30
                          ? 'Ottimo! Hai tempo per prepararti bene.'
                          : giorniMancanti > 7
                          ? 'Focus massimo sulle aree deboli.'
                          : 'Sprint finale — revisione totale!'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleSalvaData(false)}
                disabled={!dataEsame || saving}
                style={{
                  width: '100%', padding: '1.1rem', borderRadius: '14px',
                  background: dataEsame ? '#a78bfa' : '#1e293b',
                  border: 'none', color: dataEsame ? '#0f172a' : '#64748b',
                  fontWeight: 700, fontSize: '1rem', cursor: dataEsame ? 'pointer' : 'not-allowed',
                  marginBottom: '0.8rem', transition: 'all 0.2s',
                }}
              >
                {saving ? 'Salvataggio...' : 'Salva e Inizia →'}
              </button>

              <button
                onClick={() => handleSalvaData(true)}
                disabled={saving}
                style={{
                  width: '100%', padding: '0.9rem', borderRadius: '14px',
                  background: 'transparent', border: '1px dashed #334155',
                  color: '#64748b', cursor: 'pointer', fontWeight: 500,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  transition: 'all 0.2s', fontSize: '0.9rem',
                }}
                onMouseOver={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#475569'; }}
                onMouseOut={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#334155'; }}
              >
                <SkipForward size={16} /> Non lo so ancora, salta
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
