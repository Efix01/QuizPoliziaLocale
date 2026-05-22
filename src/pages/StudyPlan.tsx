/**
 * StudyPlan — Pagina "Il Mio Piano di Studio"
 * 
 * Mostra il piano di studio personalizzato generato dall'engine adattivo,
 * con timeline settimanale, sessioni suggerite e indicatore di readiness.
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar, Target, Clock, BrainCircuit, Timer, 
  AlertCircle, ChevronRight, Sparkles, TrendingUp,
  BookOpen, Zap, RefreshCw, Bot,
} from 'lucide-react';
import { usePL } from '../context/PLContext';
import { useProgress } from '../context/ProgressContext';
import {
  generaPianoStudio,
  calcolaReadiness,
  analizzaCategorie,
  type PianoStudio,
  type SessioneSuggerita,
} from '../engine/StudyPlanEngine';

// Mappa tipo sessione → navigazione
const TIPO_ROUTE: Record<string, string> = {
  quiz: '/quiz-builder',
  ripasso_errori: '/mistakes',
  srs: '/srs',
  simulazione: '/simulation',
  studio_manuale: '/library',
};

function SessioneCard({ sessione, onStart }: { sessione: SessioneSuggerita; onStart: () => void }) {
  const prioritaColors = {
    alta: { bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' },
    media: { bg: 'rgba(99, 102, 241, 0.08)', border: 'rgba(99, 102, 241, 0.2)', color: 'var(--elite-primary)' },
    bassa: { bg: 'rgba(34, 197, 94, 0.08)', border: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' },
  };
  const colors = prioritaColors[sessione.priorita];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '14px',
        padding: '1rem',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onClick={onStart}
      onMouseOver={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)'; }}
      onMouseOut={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = 'none'; }}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onStart()}
    >
      <div style={{
        fontSize: '1.5rem',
        width: '42px',
        height: '42px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '10px',
        background: 'var(--bg-deep)',
        flexShrink: 0,
      }}>
        {sessione.icona}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
            {sessione.categoriaLabel}
          </h4>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: colors.color,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            {sessione.priorita}
          </span>
        </div>
        <p style={{ margin: '0.2rem 0', fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.3 }}>
          {sessione.motivazione}
        </p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.3rem', fontSize: '0.75rem', color: '#64748b' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <BookOpen size={12} /> {sessione.numeroDomande} domande
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={12} /> ~{sessione.stimaMinuti} min
          </span>
        </div>
      </div>
      <ChevronRight size={18} color="#64748b" />
    </motion.div>
  );
}

export default function StudyPlan() {
  const navigate = useNavigate();
  const { profilo } = usePL();
  const { progressiGlobali, srsData, erroriLog } = useProgress();
  const [refreshKey, setRefreshKey] = useState(0);
  const [copilotaEnabled, setCopilotaEnabled] = useState(() => {
    try {
      return localStorage.getItem('copilotaEnabled') !== 'false';
    } catch {
      return true;
    }
  });

  const toggleCopilota = () => {
    const newVal = !copilotaEnabled;
    setCopilotaEnabled(newVal);
    try {
      localStorage.setItem('copilotaEnabled', String(newVal));
    } catch (e) {
      console.warn("Impossibile salvare lo stato del Copilota in localStorage:", e);
    }
  };

  const srsScaduti = useMemo(() => {
    const now = new Date();
    return Object.values(srsData).filter(item => item && new Date(item.nextReview) <= now).length;
  }, [srsData]);

  const erroriCount = Object.keys(erroriLog).length;
  const tempoMinuti = profilo?.tempoStudioGiornaliero || 20;

  // Genera piano
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const piano: PianoStudio = useMemo(
    () => generaPianoStudio(progressiGlobali, srsScaduti, erroriCount, tempoMinuti, undefined, 7),
    [progressiGlobali, srsScaduti, erroriCount, tempoMinuti, refreshKey],
  );

  // Readiness
  const readiness = useMemo(
    () => calcolaReadiness(progressiGlobali.perCategoria),
    [progressiGlobali.perCategoria],
  );

  // Analisi categorie per heatmap
  const categorie = useMemo(
    () => analizzaCategorie(progressiGlobali.perCategoria),
    [progressiGlobali.perCategoria],
  );

  const faseLabels: Record<string, { label: string; color: string; icon: typeof Zap }> = {
    fondamenta: { label: 'Fondamenta', color: '#3b82f6', icon: BookOpen },
    consolidamento: { label: 'Consolidamento', color: '#f59e0b', icon: TrendingUp },
    simulazioni: { label: 'Simulazioni', color: '#a855f7', icon: Timer },
    sprint_finale: { label: 'Sprint Finale', color: '#ef4444', icon: Zap },
  };

  const faseInfo = faseLabels[piano.faseCorrente] || faseLabels.fondamenta;
  const FaseIcon = faseInfo.icon;

  const handleStartSession = (sessione: SessioneSuggerita) => {
    const route = TIPO_ROUTE[sessione.tipo] || '/quiz-builder';
    navigate(route, {
      state: sessione.tipo === 'quiz'
        ? { suggestedCategory: sessione.categoriaId, suggestedCount: sessione.numeroDomande }
        : undefined,
    });
  };

  const oggiStr = new Date().toISOString().split('T')[0];
  const giorniNomi = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', color: '#f8fafc', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={28} color="var(--elite-primary)" />
              Il Tuo Piano di Studio
            </h1>
            <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0', fontSize: '1rem' }}>
              Piano personalizzato basato sui tuoi punti di forza e debolezza.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={toggleCopilota}
              style={{
                background: copilotaEnabled ? 'rgba(167, 139, 250, 0.1)' : 'rgba(30, 41, 59, 0.4)',
                border: copilotaEnabled ? '1px solid rgba(167, 139, 250, 0.3)' : '1px solid var(--border-elite)',
                color: copilotaEnabled ? '#a78bfa' : '#94a3b8',
                padding: '0.6rem 1rem',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s',
              }}
              title={copilotaEnabled ? "Disattiva Copilota Didattico AI" : "Attiva Copilota Didattico AI"}
            >
              <Bot size={16} />
              Copilota AI: {copilotaEnabled ? 'ATTIVO' : 'DISATTIVO'}
            </button>

            <button
              onClick={() => setRefreshKey(k => k + 1)}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-elite)',
                color: '#cbd5e1',
                padding: '0.6rem 1rem',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s',
              }}
            >
              <RefreshCw size={16} />
              Rigenera Piano
            </button>
          </div>
        </header>

        {/* Readiness + Fase Cards */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* Readiness */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '20px',
            padding: '1.5rem',
            border: '1px solid var(--border-elite)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>
              Indice di Prontezza
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: readiness.color, lineHeight: 1 }}>
              {readiness.score}%
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: readiness.color, marginTop: '0.3rem' }}>
              {readiness.label}
            </div>
            {readiness.categorieCritiche.length > 0 && (
              <div style={{ marginTop: '1rem', textAlign: 'left' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.5rem' }}>
                  <AlertCircle size={14} /> Materie critiche:
                </div>
                {readiness.categorieCritiche.slice(0, 3).map(cat => (
                  <div key={cat.id} style={{ fontSize: '0.8rem', color: '#94a3b8', padding: '0.2rem 0' }}>
                    {cat.label}: <strong style={{ color: '#ef4444' }}>{cat.accuratezza}%</strong>
                    {cat.domandeFatte === 0 && <span style={{ color: '#f59e0b' }}> (mai studiata)</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fase Corrente */}
          <div style={{
            background: `linear-gradient(135deg, ${faseInfo.color}10 0%, var(--bg-card) 100%)`,
            borderRadius: '20px',
            padding: '1.5rem',
            border: `1px solid ${faseInfo.color}25`,
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>
              Fase di Preparazione
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <FaseIcon size={28} color={faseInfo.color} />
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: faseInfo.color }}>{faseInfo.label}</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
              {piano.faseCorrente === 'fondamenta' && 'Concentrati sulle basi di tutte le materie. Copri il più possibile.'}
              {piano.faseCorrente === 'consolidamento' && 'Rinforza le materie deboli e porta tutte sopra il 70%.'}
              {piano.faseCorrente === 'simulazioni' && 'Alternanza tra simulazioni d\'esame e ripasso mirato.'}
              {piano.faseCorrente === 'sprint_finale' && 'Simulazioni intensive e ripasso rapido dei punti critici!'}
            </p>
            {piano.giorniRimanenti !== undefined && (
              <div style={{
                marginTop: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: piano.giorniRimanenti <= 7 ? '#ef4444' : '#f59e0b',
              }}>
                <Timer size={16} />
                {piano.giorniRimanenti} giorni al concorso
              </div>
            )}
          </div>

          {/* Prossima Sessione (CTA) */}
          {piano.prossimaSessione && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, var(--bg-card) 100%)',
              borderRadius: '20px',
              padding: '1.5rem',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--elite-accent)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>
                  Consigliato Ora
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{piano.prossimaSessione.icona}</span>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{piano.prossimaSessione.categoriaLabel}</h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.4, margin: 0 }}>
                  {piano.prossimaSessione.motivazione}
                </p>
              </div>
              <button
                onClick={() => handleStartSession(piano.prossimaSessione!)}
                style={{
                  marginTop: '1rem',
                  background: 'linear-gradient(135deg, var(--elite-primary) 0%, var(--elite-accent) 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '0.8rem 1.5rem',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                  transition: 'transform 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <BrainCircuit size={18} />
                Inizia Sessione
              </button>
            </div>
          )}
        </section>

        {/* Heatmap Materie */}
        <section style={{
          background: 'var(--bg-card)',
          borderRadius: '24px',
          padding: '2rem',
          border: '1px solid var(--border-elite)',
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={20} color="var(--elite-primary)" />
            Mappa delle Competenze
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {categorie.map(cat => {
              const getColor = (pct: number) => {
                if (pct === 0) return '#1e293b';
                if (pct >= 80) return '#22c55e';
                if (pct >= 60) return '#f59e0b';
                if (pct >= 40) return '#f97316';
                return '#ef4444';
              };
              const bgColor = getColor(cat.accuratezza);

              return (
                <div
                  key={cat.id}
                  style={{
                    background: `${bgColor}15`,
                    border: `1px solid ${bgColor}30`,
                    borderRadius: '12px',
                    padding: '0.75rem',
                    transition: 'transform 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1' }}>{cat.label}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: bgColor }}>
                      {cat.domandeFatte > 0 ? `${cat.accuratezza}%` : '—'}
                    </span>
                  </div>
                  <div style={{ height: '4px', background: 'var(--bg-deep)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${cat.accuratezza}%`,
                      height: '100%',
                      background: bgColor,
                      borderRadius: '2px',
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem', display: 'block' }}>
                    {cat.domandeFatte > 0 ? `${cat.domandeFatte} risposte` : 'Non iniziata'}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Timeline Settimanale */}
        <section style={{
          background: 'var(--bg-card)',
          borderRadius: '24px',
          padding: '2rem',
          border: '1px solid var(--border-elite)',
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} color="#f59e0b" />
            Piano Settimanale
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {piano.pianificazione.map((giorno, idx) => {
              const data = new Date(giorno.data);
              const isOggi = giorno.data === oggiStr;
              const nomeGiorno = giorniNomi[data.getDay()];
              const dataFormatted = data.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });

              return (
                <motion.div
                  key={giorno.data}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  {/* Day header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.75rem',
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isOggi ? 'var(--elite-primary)' : 'var(--bg-deep)',
                      border: isOggi ? 'none' : '1px solid var(--border-elite)',
                      flexShrink: 0,
                    }}>
                      <span style={{ fontSize: '0.6rem', fontWeight: 700, color: isOggi ? '#e0e7ff' : '#64748b', lineHeight: 1 }}>
                        {nomeGiorno}
                      </span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: isOggi ? '#fff' : '#94a3b8', lineHeight: 1.2 }}>
                        {data.getDate()}
                      </span>
                    </div>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '0.9rem',
                        fontWeight: isOggi ? 800 : 600,
                        color: isOggi ? '#f8fafc' : '#cbd5e1',
                      }}>
                        {isOggi ? 'Oggi' : dataFormatted}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} /> {giorno.minutiTotali} min
                      </span>
                    </div>
                  </div>

                  {/* Sessions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '3.25rem' }}>
                    {giorno.sessioni.map(sessione => (
                      <SessioneCard
                        key={sessione.id}
                        sessione={sessione}
                        onStart={() => handleStartSession(sessione)}
                      />
                    ))}
                    {giorno.sessioni.length === 0 && (
                      <p style={{ fontSize: '0.85rem', color: '#475569', fontStyle: 'italic' }}>
                        Giorno di riposo o sessione libera.
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
