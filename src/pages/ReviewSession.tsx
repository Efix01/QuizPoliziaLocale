import React, { useMemo, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { usePL } from '../context/PLContext';
import type { RisultatoRisposta } from '../types/progressi';
import type { DomandaPL } from '../types/pl';

import { useQuizPL } from '../hooks/useQuizPL';
import QuizView from '../components/quiz/QuizView';
import { useToast } from '../context/ToastContext';
import { 
  ArrowLeft, CheckCircle, XCircle, AlertTriangle, 
  BookOpen, Play
} from 'lucide-react';
import { motion } from 'framer-motion';

// Nomi leggibili per i categoriaId
const CATEGORIA_LABELS: Record<string, string> = {
  cds:              'Codice della Strada (CdS)',
  penale:           'Diritto e Proc. Penale',
  l689:             'Legge 689/81 — Sanzioni Amm.',
  l241:             'Legge 241/90 — Proc. Amministrativo',
  tuel:             'TUEL — Enti Locali',
  enti_locali:      'Ordinamento Enti Locali',
  costituzionale:   'Diritto Costituzionale',
  amministrativo:   'Diritto Amministrativo',
  reg_generale:     'Normativa Regionale',
  com_generale:     'Regolamento Comunale',
};

export default function ReviewSession() {
  const location = useLocation();
  const navigate = useNavigate();
  const { progressiGlobali, erroriLog, srsData, salvaRisultatoQuiz } = useProgress();
  const { tutteLeDomande } = usePL();
  const { generaQuizId } = useQuizPL();
  const { showToast } = useToast();

  const mode = location.pathname.includes('mistakes') 
    ? 'mistakes' 
    : location.pathname.includes('srs') 
      ? 'srs' 
      : 'bookmarks';

  const isMistakes = mode === 'mistakes';
  const isSrs = mode === 'srs';

  const title = isMistakes ? 'Ripasso Errori' : isSrs ? 'Ripasso Intelligente' : 'Domande Salvate';
  const emptyMessage = isMistakes 
    ? 'Nessun errore da ripassare. Ottimo lavoro!' 
    : isSrs 
      ? 'Nessuna domanda in scadenza oggi. Goditi il riposo!'
      : 'Nessuna domanda nei segnalibri. Clicca sulla stella durante lo studio per salvarne una.';

  // Stati per la selezione del livello e singola domanda critica
  const [selectedErrorLevel, setSelectedErrorLevel] = useState<1 | 2 | 3 | 'all' | null>(null);
  const [singleQuestionToReview, setSingleQuestionToReview] = useState<DomandaPL | null>(null);

  // Calcolo dei conteggi per i livelli di errore
  const errorCountsByLevel = useMemo(() => {
    let critici = 0;
    let inStudio = 0;
    let consolidati = 0;
    if (erroriLog) {
      Object.values(erroriLog).forEach(log => {
        if (log && log.count > 0) {
          const lvl = log.livelloErrore ?? 1;
          if (lvl === 1) critici++;
          else if (lvl === 2) inStudio++;
          else if (lvl === 3) consolidati++;
        }
      });
    }
    return { critici, inStudio, consolidati, total: critici + inStudio + consolidati };
  }, [erroriLog]);

  // Aggregazione errori per categoria per la Heatmap
  const errorsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.keys(CATEGORIA_LABELS).forEach(catId => {
      counts[catId] = 0;
    });

    if (erroriLog && tutteLeDomande) {
      Object.entries(erroriLog).forEach(([domandaId, log]) => {
        if (log && log.count > 0) {
          const domanda = tutteLeDomande.find(d => d.id === domandaId);
          if (domanda) {
            const catId = domanda.categoriaId || 'cds';
            counts[catId] = (counts[catId] || 0) + log.count;
          }
        }
      });
    }
    return counts;
  }, [erroriLog, tutteLeDomande]);

  // Trova le top 3 domande più fallite (Domande Critiche)
  const domandeCritiche = useMemo(() => {
    if (!erroriLog || !tutteLeDomande || tutteLeDomande.length === 0) return [];
    
    const ordinati = Object.entries(erroriLog)
      .filter(([, log]) => log && log.count > 0)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 3);
      
    const result: { domanda: DomandaPL; count: number; livelloErrore: 1 | 2 | 3 }[] = [];
    ordinati.forEach(([id, log]) => {
      const domanda = tutteLeDomande.find(d => d.id === id);
      if (domanda) {
        result.push({
          domanda,
          count: log.count,
          livelloErrore: (log.livelloErrore || 1) as 1 | 2 | 3
        });
      }
    });
    return result;
  }, [erroriLog, tutteLeDomande]);

  // Estrai gli ID rilevanti per la sessione quiz attiva
  const targetIds = useMemo(() => {
    if (isMistakes) {
      if (!erroriLog) return [];
      return Object.entries(erroriLog)
        .filter(([, log]) => {
          if (!log || log.count <= 0) return false;
          if (selectedErrorLevel === null) return false; // Non caricare se siamo in dashboard
          if (selectedErrorLevel === 'all') return true;
          const lvl = log.livelloErrore ?? 1;
          return lvl === selectedErrorLevel;
        })
        .sort(([, a], [, b]) => b.count - a.count) 
        .map(([id]) => id);
    } else if (isSrs) {
      if (!srsData) return [];
      const now = new Date();
      return Object.entries(srsData)
        .filter(([, log]) => log && new Date(log.nextReview) <= now)
        .sort(([, a], [, b]) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime())
        .map(([id]) => id);
    } else {
      return progressiGlobali?.domandeSalvate || [];
    }
  }, [isMistakes, isSrs, progressiGlobali, erroriLog, srsData, selectedErrorLevel]);

  // Genera il quiz basandosi sugli ID (o singola domanda)
  const sessionQuestions = useMemo(() => {
    if (singleQuestionToReview) {
      return [singleQuestionToReview];
    }
    return generaQuizId(targetIds);
  }, [singleQuestionToReview, targetIds, generaQuizId]);

  // Stato UI del quiz
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [excludedOptions, setExcludedOptions] = useState<number[]>([]);
  const [sessionScore, setSessionScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);

  // Registro risposte sessione
  const risposteRef = useRef<RisultatoRisposta[]>([]);
  const currentQuestion = sessionQuestions[currentIndex];

  const handleOptionSelect = (index: number) => {
    if (showAnswer) return;
    setSelectedOption(index);
  };

  const toggleExclusion = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (showAnswer) return;
    setExcludedOptions(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleCheck = () => {
    if (selectedOption === null || showAnswer) return;
    setShowAnswer(true);
  };

  const handleFeedback = async (isSelfDeclaredCorrect: boolean, rating?: 'difficile' | 'medio' | 'facile') => {
    const isActuallyCorrect = (selectedOption === currentQuestion.rispostaCorretta) && isSelfDeclaredCorrect;

    const nuovoRisultato: RisultatoRisposta = {
      domandaId: currentQuestion.id,
      categoriaId: currentQuestion.categoriaId,
      corretta: isActuallyCorrect,
      indiceRispostaScelta: selectedOption !== null ? selectedOption : -1,
      timestamp: new Date().toISOString(),
      srsDifficulty: rating,
    };

    risposteRef.current = [...risposteRef.current, nuovoRisultato];

    if (isActuallyCorrect) {
      setSessionScore(s => s + 1);
      setConsecutiveWrong(0);
    } else {
      setConsecutiveWrong(cw => cw + 1);
    }

    // Salva immediatamente
    try {
      await salvaRisultatoQuiz([nuovoRisultato]);
      
      // Se era una revisione singola domanda, usciamo subito
      if (singleQuestionToReview) {
        showToast(
          isActuallyCorrect 
            ? "Ottimo! Risposta corretta e salvata. 🎯" 
            : "Risposta errata. La domanda rimane critica! ❌", 
          isActuallyCorrect ? "success" : "error"
        );
        setSingleQuestionToReview(null);
        setSelectedOption(null);
        setShowAnswer(false);
        setExcludedOptions([]);
        setConsecutiveWrong(0);
        risposteRef.current = [];
        return;
      }
    } catch (e) {
      console.error('Errore durante il salvataggio dei risultati:', e);
    }

    if (currentIndex < sessionQuestions.length - 1) {
      setCurrentIndex(i => i + 1);
      setShowAnswer(false);
      setSelectedOption(null);
      setExcludedOptions([]);
    } else {
      setIsCompleted(true);
    }
  };

  // Se l'utente non ha errori da ripassare
  if (isMistakes && errorCountsByLevel.total === 0) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle size={40} color="#10b981" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0 }}>Nessun Errore Attivo!</h2>
          <p style={{ color: '#94a3b8', marginTop: '0.5rem', maxWidth: '400px' }}>
            Hai risposto correttamente a tutte le domande studiate finora. Continua così!
          </p>
        </div>
        <button 
          onClick={() => navigate('/dashboard')}
          style={{ background: 'var(--elite-primary)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '10px', border: 'none', fontWeight: '600', cursor: 'pointer' }}
        >
          Vai alla Dashboard
        </button>
      </div>
    );
  }

  // Se non ci sono domande nella coda (SRS o Segnalibri vuoti)
  if (!isMistakes && sessionQuestions.length === 0 && !singleQuestionToReview) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BookOpen size={40} color="var(--elite-primary)" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0 }}>{title} Vuoto</h2>
          <p style={{ color: '#94a3b8', marginTop: '0.5rem', maxWidth: '400px' }}>{emptyMessage}</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard')}
          style={{ background: 'var(--elite-primary)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '10px', border: 'none', fontWeight: '600', cursor: 'pointer' }}
        >
          Vai alla Dashboard
        </button>
      </div>
    );
  }

  // === RENDER DASHBOARD ERRORI INITIAL PAGE ===
  if (isMistakes && selectedErrorLevel === null && !singleQuestionToReview) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <style>{`
          .grid-responsive-layout {
            grid-template-columns: 1fr;
          }
          @media (min-width: 1024px) {
            .grid-responsive-layout {
              grid-template-columns: 3fr 2fr;
            }
          }
        `}</style>
        
        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={24} color="#ef4444" />
              Centro Ripasso Errori
            </h1>
            <p style={{ color: '#94a3b8', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
              Analizza e allena le tue aree deboli per consolidare le risposte corrette.
            </p>
          </div>
          
          <button
            onClick={() => setSelectedErrorLevel('all')}
            style={{
              marginLeft: 'auto',
              background: 'linear-gradient(135deg, var(--elite-primary) 0%, var(--elite-accent) 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '0.65rem 1.25rem',
              fontWeight: '700',
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(99,102,241,0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Play size={14} fill="#fff" /> Genera Allenamento Totale
          </button>
        </header>

        {/* STATS RAPIDE */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
        }}>
          {[
            { label: "Errori Attivi", value: errorCountsByLevel.total, color: "#cbd5e1" },
            { label: "Livello 1: Critici", value: errorCountsByLevel.critici, color: "#ef4444" },
            { label: "Livello 2: In Studio", value: errorCountsByLevel.inStudio, color: "#eab308" },
            { label: "Livello 3: Consolidati", value: errorCountsByLevel.consolidati, color: "#10b981" },
          ].map((stat, i) => (
            <div key={i} className="glass-card" style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-elite)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>{stat.label}</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '900', color: stat.color, marginTop: '0.25rem' }}>{stat.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gap: '2rem' }} className="grid-responsive-layout">
          
          {/* LEFT COLUMN: HEATMAP & CRITICAL QUESTIONS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', flex: 2 }}>
            
            {/* SEZIONE 1: HEATMAP ERRORI */}
            <section className="glass-card" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-elite)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1rem', color: '#fff' }}>
                Densità Errori per Categoria
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '0.75rem',
              }}>
                {Object.entries(errorsByCategory).map(([catId, count]) => {
                  const label = CATEGORIA_LABELS[catId] || catId;
                  
                  // Assegna colori in base alla densità
                  let bgColor = 'rgba(16, 185, 129, 0.03)';
                  let borderColor = 'rgba(16, 185, 129, 0.15)';
                  let textColor = '#10b981';
                  
                  if (count > 0 && count <= 3) {
                    bgColor = 'rgba(245, 158, 11, 0.05)';
                    borderColor = 'rgba(245, 158, 11, 0.2)';
                    textColor = '#f59e0b';
                  } else if (count > 3) {
                    bgColor = 'rgba(239, 68, 68, 0.06)';
                    borderColor = 'rgba(239, 68, 68, 0.25)';
                    textColor = '#ef4444';
                  }

                  return (
                    <div
                      key={catId}
                      style={{
                        background: bgColor,
                        border: `1px solid ${borderColor}`,
                        borderRadius: '12px',
                        padding: '0.85rem 1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                      }}
                    >
                      <span style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '600', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={label}>
                        {label}
                      </span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700' }}>STATO:</span>
                        <span style={{ fontSize: '1rem', fontWeight: '800', color: textColor }}>
                          {count === 0 ? 'OK ✓' : `${count} errori`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SEZIONE 2: DOMANDE CRITICHE */}
            <section className="glass-card" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-elite)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.25rem', color: '#fff' }}>
                Domande Critiche (Top Aree Rosse)
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                Questi quiz hanno registrato il maggior numero di risposte errate. Ripassali singolarmente.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {domandeCritiche.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
                    Nessuna domanda critica trovata. Ottimo lavoro!
                  </div>
                ) : (
                  domandeCritiche.map((item) => {
                    const labelMateria = CATEGORIA_LABELS[item.domanda.categoriaId] || item.domanda.categoriaId;
                    return (
                      <div
                        key={item.domanda.id}
                        style={{
                          background: '#131c2e',
                          border: '1px solid #1e293b',
                          borderRadius: '16px',
                          padding: '1.25rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.75rem',
                          position: 'relative',
                        }}
                      >
                        {/* Header card domanda */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <span style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--elite-accent)', fontSize: '0.68rem', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: '700' }}>
                            {labelMateria}
                          </span>
                          <span style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <AlertTriangle size={12} /> Sbagliata {item.count} volte
                          </span>
                        </div>

                        {/* Testo Domanda */}
                        <p style={{ fontSize: '0.88rem', fontWeight: '700', color: '#f8fafc', margin: 0, lineHeight: '1.4' }}>
                          {item.domanda.testo}
                        </p>

                        {/* Preview Spiegazione */}
                        {item.domanda.spiegazione && (
                          <div style={{ background: 'rgba(255,255,255,0.02)', borderLeft: '3px solid #64748b', padding: '0.5rem 0.75rem', borderRadius: '4px', fontSize: '0.78rem', color: '#94a3b8', lineHeight: '1.4' }}>
                            <strong>Focus Normativo:</strong> {item.domanda.spiegazione}
                          </div>
                        )}

                        {/* Pulsante Riprova Singola */}
                        <button
                          onClick={() => setSingleQuestionToReview(item.domanda)}
                          style={{
                            alignSelf: 'flex-end',
                            background: 'transparent',
                            border: '1px solid var(--border-elite)',
                            color: '#3b82f6',
                            borderRadius: '8px',
                            padding: '0.4rem 0.85rem',
                            fontSize: '0.78rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            transition: 'all 0.2s',
                          }}
                          onMouseOver={e => {
                            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)';
                            e.currentTarget.style.borderColor = '#3b82f6';
                          }}
                          onMouseOut={e => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = 'var(--border-elite)';
                          }}
                        >
                          <Play size={12} fill="#3b82f6" /> Riprova Singola Domanda
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN: SRS LEVELS PROGRESS SELECTOR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
            
            <section className="glass-card" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-elite)', height: '100%' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.25rem', color: '#fff' }}>
                Allena per Livello SRS
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
                Seleziona un livello specifico per lanciare una sessione di ripasso mirata.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  {
                    id: 1 as const,
                    title: '🔴 Livello 1: Critici',
                    desc: 'Errori recenti. Richiedono attenzione immediata.',
                    count: errorCountsByLevel.critici,
                    color: '#ef4444',
                    bg: 'rgba(239, 68, 68, 0.05)',
                  },
                  {
                    id: 2 as const,
                    title: '🟡 Livello 2: In Studio',
                    desc: 'Sulla buona strada. Consolidali ripassando.',
                    count: errorCountsByLevel.inStudio,
                    color: '#eab308',
                    bg: 'rgba(234, 179, 8, 0.05)',
                  },
                  {
                    id: 3 as const,
                    title: '🟢 Livello 3: Consolidati',
                    desc: 'Quasi risolti. Un\'ultima risposta esatta.',
                    count: errorCountsByLevel.consolidati,
                    color: '#10b981',
                    bg: 'rgba(16, 185, 129, 0.05)',
                  },
                  {
                    id: 'all' as const,
                    title: '📚 Tutti gli Errori',
                    desc: 'Allena l\'intero database degli errori.',
                    count: errorCountsByLevel.total,
                    color: '#3b82f6',
                    bg: 'rgba(59, 130, 246, 0.05)',
                  }
                ].map((levelCard) => {
                  const isDisabled = levelCard.count === 0;
                  return (
                    <button
                      key={levelCard.id}
                      disabled={isDisabled}
                      onClick={() => setSelectedErrorLevel(levelCard.id)}
                      style={{
                        background: levelCard.bg,
                        border: '1px solid var(--border-elite)',
                        borderRadius: '16px',
                        padding: '1.25rem',
                        textAlign: 'left',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        opacity: isDisabled ? 0.35 : 1,
                        width: '100%',
                        transition: 'all 0.25s',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                      onMouseOver={e => {
                        if (!isDisabled) {
                          e.currentTarget.style.borderColor = levelCard.color;
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseOut={e => {
                        if (!isDisabled) {
                          e.currentTarget.style.borderColor = 'var(--border-elite)';
                          e.currentTarget.style.transform = 'none';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: 0, paddingRight: '1rem' }}>
                        <div style={{ fontWeight: '800', fontSize: '0.92rem', color: levelCard.color }}>
                          {levelCard.title}
                        </div>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.3 }}>
                          {levelCard.desc}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#fff' }}>
                          {levelCard.count}
                        </div>
                        <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 'bold' }}>QUIZ</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

          </div>

        </div>

      </div>
    );
  }

  // Risultato Fine Sessione
  if (isCompleted) {
    const accuracy = Math.round((sessionScore / sessionQuestions.length) * 100);
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ background: '#131c2e', padding: '3rem 2rem', borderRadius: '24px', border: '1px solid var(--border-elite)', textAlign: 'center', maxWidth: '480px', width: '100%', boxShadow: '0 15px 35px rgba(0,0,0,0.3)' }}
        >
          {accuracy >= 80 ? (
            <CheckCircle size={56} color="#10b981" style={{ margin: '0 auto 1rem' }} />
          ) : (
            <XCircle size={56} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
          )}
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: '800', color: '#fff' }}>Ripasso Completato!</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '1.05rem', lineHeight: 1.4 }}>
            Hai risposto correttamente al <strong>{accuracy}%</strong> delle domande della sessione ({sessionScore} su {sessionQuestions.length}).
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={() => navigate('/dashboard')}
              style={{ flex: 1, padding: '0.8rem 1.2rem', background: '#090d16', border: '1px solid var(--border-elite)', color: 'white', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseOver={e => e.currentTarget.style.borderColor = 'var(--elite-primary)'}
              onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-elite)'}
            >
              Dashboard
            </button>
            <button 
              onClick={() => {
                setSelectedErrorLevel(null);
                setCurrentIndex(0);
                setShowAnswer(false);
                setSelectedOption(null);
                setExcludedOptions([]);
                setSessionScore(0);
                setIsCompleted(false);
                setConsecutiveWrong(0);
                risposteRef.current = [];
              }}
              style={{ flex: 1, padding: '0.8rem 1.2rem', background: 'var(--elite-primary)', color: 'white', borderRadius: '10px', border: 'none', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--elite-accent)'}
              onMouseOut={e => e.currentTarget.style.background = 'var(--elite-primary)'}
            >
              Ripeti o Esci
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Sessione Quiz Attiva
  const progressPercentage = ((currentIndex + 1) / sessionQuestions.length) * 100;

  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Active Session Header */}
      <div style={{ padding: '0.75rem 1rem', background: '#131c2e', borderBottom: '1px solid var(--border-elite)', borderRadius: '12px', display: 'flex', alignItems: 'center', marginBottom: '1.5rem', justifyContent: 'space-between' }}>
        <button 
          onClick={() => {
            if (singleQuestionToReview) {
              setSingleQuestionToReview(null);
            } else {
              setSelectedErrorLevel(null);
            }
            setCurrentIndex(0);
            setShowAnswer(false);
            setSelectedOption(null);
            setExcludedOptions([]);
            setConsecutiveWrong(0);
            risposteRef.current = [];
          }} 
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', fontWeight: '700' }}
        >
          <ArrowLeft size={16} /> Dashboard Centro Errori
        </button>
        <span style={{ fontWeight: '700', color: isMistakes ? '#ef4444' : '#f59e0b', fontSize: '0.95rem' }}>
          {singleQuestionToReview ? 'Focus Singola Domanda' : `${title} (${currentIndex + 1}/${sessionQuestions.length})`}
        </span>
      </div>

      <div style={{ flex: 1 }}>
        <QuizView
          currentQuestion={currentQuestion}
          currentIndex={currentIndex}
          totalQuestions={sessionQuestions.length}
          showAnswer={showAnswer}
          selectedOption={selectedOption}
          excludedOptions={excludedOptions}
          progressPercentage={progressPercentage}
          handleOptionSelect={handleOptionSelect}
          toggleExclusion={toggleExclusion}
          handleCheck={handleCheck}
          handleFeedback={handleFeedback}
          onAbandon={() => {
            if (singleQuestionToReview) {
              setSingleQuestionToReview(null);
            } else {
              setSelectedErrorLevel(null);
            }
            setCurrentIndex(0);
            setShowAnswer(false);
            setSelectedOption(null);
            setExcludedOptions([]);
            setConsecutiveWrong(0);
            risposteRef.current = [];
          }}
          isSimulationMode={false}
          consecutiveWrong={consecutiveWrong}
        />
      </div>
    </div>
  );
}
