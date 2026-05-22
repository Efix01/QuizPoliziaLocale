import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Star, Type, Maximize, Minimize, Landmark, Bot, Clock } from 'lucide-react';
import type { DomandaPL } from '../../types/pl';
import { useProgress } from '../../context/ProgressContext';
import LogicRenderer from './graphics/LogicRenderer';
import AITutor from './AITutor';

interface QuizViewProps {
  currentQuestion: DomandaPL;
  currentIndex: number;
  totalQuestions: number;
  showAnswer: boolean;
  selectedOption: number | null;
  excludedOptions: number[];
  progressPercentage: number;
  handleOptionSelect: (index: number) => void;
  toggleExclusion: (e: React.MouseEvent, index: number) => void;
  handleCheck: () => void;
  handleFeedback: (isSelfDeclaredCorrect: boolean, rating?: 'difficile' | 'medio' | 'facile') => void;
  onAbandon: () => void;
  isSimulationMode?: boolean; // 🆕 Flag per modalità esame
  timeLeft?: number;           // 🆕 Tempo residuo in secondi
  totalDurationSeconds?: number; // 🆕 Durata totale in secondi
  consecutiveWrong?: number;   // 🆕 Per Rage Quit Prevention
  antiAnxietyMode?: boolean;   // 🧘 Per Studio Calmo
  risposteDate?: any[];
  // 🆕 Nuovi per navigazione e consegna griglia simulazione
  setCurrentIndex?: (index: number) => void;
  visitedIndexes?: number[];
  consegnaSimulazione?: () => Promise<void>;
}

export default function QuizView({
  currentQuestion,
  currentIndex,
  totalQuestions,
  showAnswer,
  selectedOption,
  excludedOptions,
  progressPercentage,
  handleOptionSelect,
  toggleExclusion,
  handleCheck,
  handleFeedback,
  onAbandon,
  isSimulationMode = false, // Default: modalità pratica
  timeLeft = 0,
  totalDurationSeconds = 0,
  consecutiveWrong = 0,
  antiAnxietyMode = false,
  risposteDate = [],
  setCurrentIndex = () => {},
  visitedIndexes = [],
  consegnaSimulazione = async () => {},
}: QuizViewProps) {
  
  const { progressiGlobali, toggleSegnalibro } = useProgress();
  const [zenMode, setZenMode] = useState(() => {
    try {
      return localStorage.getItem('zenMode') === 'true';
    } catch {
      return false;
    }
  });
  const [copilotaEnabled, setCopilotaEnabled] = useState(() => {
    try {
      return localStorage.getItem('copilotaEnabled') !== 'false';
    } catch {
      return true;
    }
  });
  const [fontLevel, setFontLevel] = useState(1); // 0 = piccolo, 1 = medio, 2 = grande

  useEffect(() => {
    try {
      localStorage.setItem('zenMode', String(zenMode));
    } catch (e) {
      console.warn("Impossibile salvare la Zen Mode in localStorage:", e);
    }
  }, [zenMode]);

  useEffect(() => {
    try {
      localStorage.setItem('copilotaEnabled', String(copilotaEnabled));
    } catch (e) {
      console.warn("Impossibile salvare lo stato del Copilota in localStorage:", e);
    }
  }, [copilotaEnabled]);

  const fontSizes = ['1.1rem', '1.3rem', '1.6rem'];
  const currentFontSize = fontSizes[fontLevel];
  
  const isSaved = progressiGlobali.domandeSalvate?.includes(currentQuestion.id);
  const [isTutorOpen, setIsTutorOpen] = useState(false);

  // 🆕 Stati per Modalità Concorso Reale
  const [secondsOnQuestion, setSecondsOnQuestion] = useState(0);
  const [activeAnnouncement, setActiveAnnouncement] = useState<string | null>(null);

  const simulatedMessages = [
    "📢 Commissione: Si ricorda che non è ammesso l'uso di dizionari o testi di legge.",
    "⚠️ Aula: Diversi candidati hanno già consegnato l'elaborato. Mantieni il ritmo.",
    "📢 Commissione: Mancano meno di 30 minuti. Controllate le risposte date.",
    "📢 Avviso: Un candidato è stato allontanato dall'aula per aver utilizzato un dispositivo elettronico.",
    "📢 Commissione: Ricordiamo che le risposte errate sottraggono 0.25 punti.",
    "⏱️ Ritmo: Stai mantenendo una buona andatura, continua così.",
    "📢 Commissione: La prova si intenderà conclusa improrogabilmente al termine del countdown.",
    "⚠️ Aula: Si prega di mantenere il silenzio assoluto per rispetto dei colleghi.",
  ];

  // Reset del timer della singola domanda al cambio domanda
  useEffect(() => {
    setSecondsOnQuestion(0);
  }, [currentQuestion.id]);

  // Incremento timer singola domanda
  useEffect(() => {
    if (showAnswer || !isSimulationMode) return;
    const interval = setInterval(() => {
      setSecondsOnQuestion(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [currentQuestion.id, showAnswer, isSimulationMode]);

  // Gestione messaggi di disturbo casuali
  useEffect(() => {
    if (!isSimulationMode) return;
    
    const triggerRandomAnnouncement = () => {
      const randomMsg = simulatedMessages[Math.floor(Math.random() * simulatedMessages.length)];
      setActiveAnnouncement(randomMsg);
      // Scompare dopo 6 secondi
      setTimeout(() => {
        setActiveAnnouncement(null);
      }, 6000);
    };

    const initialTimeout = setTimeout(triggerRandomAnnouncement, 40000);
    const interval = setInterval(triggerRandomAnnouncement, 70000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [isSimulationMode]);

  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const isTimerLow = timeLeft > 0 && timeLeft < 300;
  const showTimeWarning = isSimulationMode && !showAnswer && secondsOnQuestion > 50;

  useEffect(() => {
    if (showAnswer && copilotaEnabled) {
      setIsTutorOpen(selectedOption !== currentQuestion.rispostaCorretta);
    } else {
      setIsTutorOpen(false);
    }
  }, [showAnswer, selectedOption, currentQuestion.rispostaCorretta, copilotaEnabled]);

  // Handler per modalità simulazione (avanzamento senza feedback)
  const handleNextInSimulation = () => {
    handleFeedback(true); // Registra la risposta ma non mostra feedback
  };

  const handleSkipInSimulation = () => {
    handleFeedback(true); // Registra risposta non data (-1) e procede
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      // Tasti 1, 2, 3, 4 per selezionare le risposte
      if (['1', '2', '3', '4'].includes(event.key)) {
        const optionIndex = parseInt(event.key, 10) - 1;
        if (
          optionIndex < currentQuestion.opzioni.length &&
          !excludedOptions.includes(optionIndex) &&
          (!showAnswer || isSimulationMode)
        ) {
          handleOptionSelect(optionIndex);
        }
      }

      // Tasto Invio per confermare o procedere
      if (event.key === 'Enter') {
        if (isSimulationMode) {
          if (selectedOption !== null) {
            handleNextInSimulation();
          }
        } else {
          if (!showAnswer) {
            if (selectedOption !== null) {
              handleCheck();
            }
          } else {
            // Invio come fallback: 'medio' se corretta, errore se errata
            if (selectedOption === currentQuestion.rispostaCorretta) {
              handleFeedback(true, 'medio');
            } else {
              handleFeedback(false);
            }
          }
        }
      }

      // Tasti in modalità feedback pratica (SRS Anki-style)
      if (showAnswer && !isSimulationMode) {
        if (selectedOption === currentQuestion.rispostaCorretta) {
          if (event.key === '1' || event.key.toLowerCase() === 'd') {
            handleFeedback(true, 'difficile');
          } else if (event.key === '2' || event.key.toLowerCase() === 'm') {
            handleFeedback(true, 'medio');
          } else if (event.key === '3' || event.key.toLowerCase() === 'f') {
            handleFeedback(true, 'facile');
          } else if (event.key.toLowerCase() === 'n') {
            handleFeedback(false); // segna come a caso / errore
          }
        } else {
          if (event.key.toLowerCase() === 'n' || event.key.toLowerCase() === 's' || event.key.toLowerCase() === 'd') {
            handleFeedback(false);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    currentQuestion.opzioni.length,
    selectedOption,
    showAnswer,
    excludedOptions,
    isSimulationMode,
  ]);

  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', padding: '1rem' }}>
      <div style={{ maxWidth: isSimulationMode ? '1200px' : '800px', margin: '0 auto' }}>
        
        {/* Header e Progresso (nascosti in Zen Mode per ridurre le distrazioni) */}
        {!zenMode && (
          <>
            <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <button 
                onClick={onAbandon} 
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: '#94a3b8', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                }}
              >
                <ArrowLeft size={20} /> {isSimulationMode ? 'Abbandona Esame' : 'Abbandona'}
              </button>

              {!antiAnxietyMode && (isSimulationMode || timeLeft > 0) && (
                <div 
                  className={isTimerLow ? 'pulse-warning' : ''}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    background: isTimerLow ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    border: `1px solid ${isTimerLow ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                    color: isTimerLow ? '#f87171' : '#34d399',
                    padding: '0.4rem 1.2rem',
                    borderRadius: '12px',
                    fontFamily: 'monospace',
                    fontSize: '1.25rem',
                    fontWeight: '700',
                  }}
                >
                  <Clock size={18} />
                  <span>{formatTime(timeLeft)}</span>
                </div>
              )}

              <div style={{ color: '#cbd5e1', fontWeight: '600' }}>
                Domanda {currentIndex + 1} di {totalQuestions}
              </div>
            </header>

            {/* Banner Modalità Esame */}
            {isSimulationMode && (
              <div style={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '16px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                marginBottom: '2rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Clock size={22} color="#94a3b8" />
                  <strong style={{ color: '#f8fafc', fontSize: '1.05rem' }}>Modalità Esame Ufficiale</strong>
                </div>
                <div style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: '1.5', marginLeft: '2.25rem' }}>
                  Nessuna correzione istantanea, timer rigido ({Math.round(totalDurationSeconds / 60)} minuti) con auto-consegna. Puoi navigare liberamente tra le domande usando la griglia laterale. Premi <strong>"Salta Domanda"</strong> per lasciarla in bianco senza penalità.
                </div>
              </div>
            )}

            <div style={{ height: '8px', background: '#131c2e', borderRadius: '4px', overflow: 'hidden', marginBottom: '2rem', border: '1px solid #233554' }}>
              <div style={{ 
                width: `${progressPercentage}%`, 
                height: '100%', 
                background: isSimulationMode ? '#475569' : 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)', 
                boxShadow: isSimulationMode ? 'none' : '0 0 10px rgba(99, 102, 241, 0.4)',
                borderRadius: '4px',
                transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' 
              }} />
            </div>

            {/* Banner Modalità Anti-Ansia */}
            {antiAnxietyMode && (
              <div style={{
                background: 'linear-gradient(90deg, #1e1b4b 0%, #312e81 100%)',
                border: '1px solid #4338ca',
                borderRadius: '16px',
                padding: '1rem 1.25rem',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: '0 4px 15px rgba(67, 56, 202, 0.25)'
              }}>
                <span style={{ fontSize: '1.5rem' }}>🧘</span>
                <div style={{ flex: 1 }}>
                  <strong style={{ color: '#c7d2fe', fontSize: '1rem', display: 'block' }}>🧘 Modalità Anti-Ansia Attiva</strong>
                  <span style={{ color: '#a5b4fc', fontSize: '0.85rem' }}>Studio Calmo &amp; Protetto. Nessun timer, nessun giudizio. Concentrati sull'apprendimento.</span>
                </div>
              </div>
            )}
          </>
        )}

        {/* Annuncio Commissione */}
        {activeAnnouncement && (
          <div 
            style={{
              background: 'rgba(59, 130, 246, 0.15)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              borderRadius: '16px',
              padding: '1rem 1.5rem',
              marginBottom: '1.5rem',
              color: '#93c5fd',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.2)',
            }}
          >
            <Bot size={20} />
            <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>{activeAnnouncement}</div>
          </div>
        )}

        {/* Warning Tempo Consigliato Superato */}
        {!antiAnxietyMode && showTimeWarning && (
          <div 
            className="pulse-warning"
            style={{
              background: 'rgba(245, 158, 11, 0.15)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: '16px',
              padding: '1rem 1.5rem',
              marginBottom: '1.5rem',
              color: '#fde047',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.2)',
            }}
          >
            <AlertTriangle size={20} />
            <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>
              ⏱️ Hai superato i 50 secondi su questa domanda. Attenzione al tempo totale!
            </div>
          </div>
        )}

        {/* Griglia Contenuto Principale */}
        {isSimulationMode ? (
          <div className="simulation-layout-grid">
            
            {/* Sinistra: Area Domanda & Risposte */}
            <div style={{ flex: 1, minWidth: 0 }}>
              
              {/* Domanda Card */}
              <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '24px', border: '1px solid #334155', marginBottom: '2rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div />
                  <div style={{ 
                    display: 'flex', 
                    gap: '0.4rem', 
                    background: 'rgba(15, 23, 42, 0.6)', 
                    backdropFilter: 'blur(8px)', 
                    padding: '0.4rem', 
                    borderRadius: '14px', 
                    border: '1px solid rgba(51, 65, 85, 0.8)' 
                  }}>
                    <button 
                      onClick={() => setFontLevel((f) => (f + 1) % 3)} 
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        color: '#94a3b8', 
                        cursor: 'pointer', 
                        padding: '0.3rem', 
                        borderRadius: '8px',
                        display: 'flex', 
                        alignItems: 'center',
                        transition: 'all 0.2s'
                      }} 
                      onMouseOver={e => e.currentTarget.style.color = '#f8fafc'}
                      onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}
                      title="Cambia Dimensione Testo"
                    >
                      <Type size={18} />
                    </button>
                    <button 
                      onClick={() => setZenMode(!zenMode)} 
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        color: zenMode ? '#3b82f6' : '#94a3b8', 
                        cursor: 'pointer', 
                        padding: '0.3rem', 
                        borderRadius: '8px',
                        display: 'flex', 
                        alignItems: 'center',
                        transition: 'all 0.2s'
                      }} 
                      onMouseOver={e => e.currentTarget.style.color = zenMode ? '#3b82f6' : '#f8fafc'}
                      onMouseOut={e => e.currentTarget.style.color = zenMode ? '#3b82f6' : '#94a3b8'}
                      title="Toggle Zen Mode"
                    >
                      {zenMode ? <Minimize size={18} /> : <Maximize size={18} />}
                    </button>
                  </div>
                </div>

                <h2 style={{ fontSize: currentFontSize, lineHeight: '1.6', margin: 0, transition: 'font-size 0.2s ease', whiteSpace: 'pre-wrap' }}>{currentQuestion.testo}</h2>

                {currentQuestion.layoutGrafico && (
                  <LogicRenderer layout={currentQuestion.layoutGrafico} />
                )}
              </div>

              {/* Opzioni */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                {currentQuestion.opzioni.map((opzione, index) => {
                  const isSelected = selectedOption === index;
                  return (
                    <div key={index} style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className={`btn-simulation-option ${isSelected ? 'btn-simulation-option-selected' : ''}`}
                        onClick={() => handleOptionSelect(index)}
                        style={{ flex: 1 }}
                      >
                        {opzione}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Suggerimenti tastiera */}
              {!zenMode && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span><kbd style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '4px', padding: '2px 6px', marginRight: '4px', fontFamily: 'monospace' }}>1-4</kbd> Seleziona risposte</span>
                    {selectedOption !== null && (
                      <span><kbd style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '4px', padding: '2px 6px', marginRight: '4px', fontFamily: 'monospace' }}>Invio</kbd> Avanza</span>
                    )}
                  </div>
                </div>
              )}

              {/* Pulsanti Bottom */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button
                  onClick={handleSkipInSimulation}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    padding: '1.25rem',
                    borderRadius: '12px',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                  }}
                >
                  Salta Domanda (0 pt)
                </button>
                <button
                  onClick={handleNextInSimulation}
                  disabled={selectedOption === null}
                  style={{
                    background: selectedOption !== null ? '#3b82f6' : '#1e293b',
                    color: selectedOption !== null ? '#fff' : '#64748b',
                    border: selectedOption !== null ? 'none' : '1px solid #334155',
                    padding: '1.25rem',
                    borderRadius: '12px',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    cursor: selectedOption !== null ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                  onMouseOver={(e) => {
                    if (selectedOption !== null) {
                      e.currentTarget.style.background = '#2563eb';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (selectedOption !== null) {
                      e.currentTarget.style.background = '#3b82f6';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {isLastQuestion ? '✅ TERMINA ESAME' : '➡️ CONFERMA E PROCEDI'}
                </button>
              </div>
            </div>

            {/* Destra: Sidebar Navigazione Domande */}
            <div className="simulation-sidebar">
              <div style={{ 
                background: '#1e293b', 
                border: '1px solid #334155', 
                borderRadius: '24px', 
                padding: '1.5rem', 
                position: 'sticky', 
                top: '2rem' 
              }}>
                <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.1rem', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🧭 Navigazione Domande
                </h3>
                
                {/* Quadratini griglia */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(5, 1fr)', 
                  gap: '0.6rem', 
                  marginBottom: '1.5rem' 
                }}>
                  {Array.from({ length: totalQuestions }).map((_, idx) => {
                    const isCurrent = idx === currentIndex;
                    const isAnswered = risposteDate[idx] && risposteDate[idx].indiceRispostaScelta !== -1;
                    const isVisited = visitedIndexes.includes(idx);
                    
                    let squareBg = '#0f172a';
                    let squareBorder = '1px solid #334155';
                    let squareColor = '#64748b';
                    
                    if (isCurrent) {
                      squareBg = '#1e3a8a';
                      squareBorder = '2px solid #3b82f6';
                      squareColor = '#3b82f6';
                    } else if (isAnswered) {
                      squareBg = '#065f46';
                      squareBorder = '1px solid #059669';
                      squareColor = '#34d399';
                    } else if (isVisited) {
                      squareBg = '#7f1d1d';
                      squareBorder = '1px solid #b91c1c';
                      squareColor = '#f87171';
                    }
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex && setCurrentIndex(idx)}
                        style={{
                          background: squareBg,
                          border: squareBorder,
                          borderRadius: '8px',
                          height: '42px',
                          fontWeight: '700',
                          fontSize: '0.95rem',
                          color: isCurrent || isAnswered || isVisited ? '#fff' : squareColor,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseOver={e => {
                          if (!isCurrent) {
                            e.currentTarget.style.borderColor = '#475569';
                            e.currentTarget.style.background = isAnswered ? '#047857' : isVisited ? '#991b1b' : '#1e293b';
                          }
                        }}
                        onMouseOut={e => {
                          if (!isCurrent) {
                            e.currentTarget.style.borderColor = isAnswered ? '#059669' : isVisited ? '#b91c1c' : '#334155';
                            e.currentTarget.style.background = isAnswered ? '#065f46' : isVisited ? '#7f1d1d' : '#0f172a';
                          }
                        }}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
                
                {/* Legenda */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem', color: '#94a3b8', borderBottom: '1px solid #334155', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{ width: '12px', height: '12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '3px' }} />
                    <span>Da fare</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{ width: '12px', height: '12px', background: '#1e3a8a', border: '1px solid #3b82f6', borderRadius: '3px' }} />
                    <span>Corrente</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{ width: '12px', height: '12px', background: '#065f46', border: '1px solid #059669', borderRadius: '3px' }} />
                    <span>Risposta</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{ width: '12px', height: '12px', background: '#7f1d1d', border: '1px solid #b91c1c', borderRadius: '3px' }} />
                    <span>Saltata</span>
                  </div>
                </div>
                
                {/* Consegna Esame */}
                <button
                  onClick={consegnaSimulazione}
                  style={{
                    width: '100%',
                    background: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    padding: '1rem',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.background = '#dc2626';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = '#ef4444';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  🚩 TERMINA E CONSEGNA
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* MODALITÀ PRATICA standard */
          <div>
            {/* Domanda Card */}
            <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '24px', border: '1px solid #334155', marginBottom: '2rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
              
              {/* Toolbar UX Intensiva: Categoria, Font, Zen Mode, Segnalibro */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                {!zenMode ? (
                  <div style={{ display: 'inline-block', background: '#334155', color: '#cbd5e1', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    {currentQuestion.categoriaId.toUpperCase()}
                  </div>
                ) : <div />}

                <div style={{ 
                  display: 'flex', 
                  gap: '0.4rem', 
                  background: 'rgba(15, 23, 42, 0.6)', 
                  backdropFilter: 'blur(8px)', 
                  padding: '0.4rem', 
                  borderRadius: '14px', 
                  border: '1px solid rgba(51, 65, 85, 0.8)' 
                }}>
                  <button 
                    onClick={() => setFontLevel((f) => (f + 1) % 3)} 
                    style={{ 
                      background: 'transparent', 
                      border: 'none', 
                      color: '#94a3b8', 
                      cursor: 'pointer', 
                      padding: '0.3rem', 
                      borderRadius: '8px',
                      display: 'flex', 
                      alignItems: 'center',
                      transition: 'all 0.2s'
                    }} 
                    onMouseOver={e => e.currentTarget.style.color = '#f8fafc'}
                    onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}
                    title="Cambia Dimensione Testo"
                  >
                    <Type size={18} />
                  </button>
                  <button 
                    onClick={() => setZenMode(!zenMode)} 
                    style={{ 
                      background: 'transparent', 
                      border: 'none', 
                      color: zenMode ? '#3b82f6' : '#94a3b8', 
                      cursor: 'pointer', 
                      padding: '0.3rem', 
                      borderRadius: '8px',
                      display: 'flex', 
                      alignItems: 'center',
                      transition: 'all 0.2s'
                    }} 
                    onMouseOver={e => e.currentTarget.style.color = zenMode ? '#3b82f6' : '#f8fafc'}
                    onMouseOut={e => e.currentTarget.style.color = zenMode ? '#3b82f6' : '#94a3b8'}
                    title="Toggle Zen Mode"
                  >
                    {zenMode ? <Minimize size={18} /> : <Maximize size={18} />}
                  </button>
                  <button 
                    onClick={() => setCopilotaEnabled(!copilotaEnabled)} 
                    style={{ 
                      background: 'transparent', 
                      border: 'none', 
                      color: copilotaEnabled ? '#a78bfa' : '#64748b', 
                      cursor: 'pointer', 
                      padding: '0.3rem', 
                      borderRadius: '8px',
                      display: 'flex', 
                      alignItems: 'center',
                      transition: 'all 0.2s'
                    }} 
                    onMouseOver={e => e.currentTarget.style.color = '#cbd5e1'}
                    onMouseOut={e => e.currentTarget.style.color = copilotaEnabled ? '#a78bfa' : '#64748b'}
                    title={copilotaEnabled ? "Disattiva Copilota Didattico AI" : "Attiva Copilota Didattico AI"}
                  >
                    <Bot size={18} style={{ opacity: copilotaEnabled ? 1 : 0.6 }} />
                  </button>
                  <button 
                    onClick={async () => await toggleSegnalibro(currentQuestion.id)} 
                    style={{ 
                      background: 'transparent', 
                      border: 'none', 
                      color: isSaved ? '#d4af37' : '#94a3b8', 
                      cursor: 'pointer', 
                      padding: '0.3rem', 
                      borderRadius: '8px',
                      display: 'flex', 
                      alignItems: 'center', 
                      transition: 'all 0.2s' 
                    }} 
                    onMouseOver={e => e.currentTarget.style.color = isSaved ? '#d4af37' : '#f8fafc'}
                    onMouseOut={e => e.currentTarget.style.color = isSaved ? '#d4af37' : '#94a3b8'}
                    title="Salva nei Segnalibri"
                  >
                    <Star size={20} fill={isSaved ? '#d4af37' : 'none'} />
                  </button>
                </div>
              </div>

              <h2 style={{ fontSize: currentFontSize, lineHeight: '1.6', margin: 0, transition: 'font-size 0.2s ease', whiteSpace: 'pre-wrap' }}>{currentQuestion.testo}</h2>

              {currentQuestion.layoutGrafico && (
                <LogicRenderer layout={currentQuestion.layoutGrafico} />
              )}

              {currentQuestion.fonte && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '1.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                  <Landmark size={14} />
                  <span>Fonte: {currentQuestion.fonte}</span>
                </div>
              )}
            </div>

            {/* Opzioni */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              {currentQuestion.opzioni.map((opzione, index) => {
                const isSelected = selectedOption === index;
                const isExcluded = excludedOptions.includes(index);
                const isCorrect = showAnswer && index === currentQuestion.rispostaCorretta;
                const isWrong = showAnswer && isSelected && index !== currentQuestion.rispostaCorretta;

                let btnClass = 'btn-3d';
                if (isExcluded) {
                  btnClass += ' btn-3d-excluded';
                } else {
                  if (isCorrect) {
                    btnClass += ' btn-3d-correct';
                    if (isSelected) {
                      btnClass += ' animate-bounce-in';
                    }
                  } else if (isWrong) {
                    btnClass += ' btn-3d-wrong';
                    if (isSelected) {
                      btnClass += ' animate-shake';
                    }
                  } else if (isSelected && !showAnswer) {
                    btnClass += ' btn-3d-selected';
                  }
                }

                return (
                  <div key={index} style={{ display: 'flex', gap: '0.5rem', opacity: (isExcluded && !showAnswer) ? 0.4 : 1 }}>
                    
                    {/* Bottone Esclusione (X) - Solo in modalità pratica */}
                    {!showAnswer && (
                      <button 
                        onClick={(e) => toggleExclusion(e, index)}
                        style={{ 
                          background: isExcluded ? '#ef4444' : '#334155', 
                          border: 'none', 
                          borderRadius: '12px', 
                          width: '50px', 
                          cursor: 'pointer', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          color: '#fff', 
                          fontSize: '1.2rem', 
                          fontWeight: 'bold',
                          boxShadow: isExcluded ? 'none' : '0 3px 0 #1e293b',
                          transform: isExcluded ? 'translateY(2px)' : 'none',
                          transition: 'all 0.1s'
                        }}
                      >
                        ×
                      </button>
                    )}

                    {/* Bottone Opzione */}
                    <button
                      className={btnClass}
                      onClick={() => handleOptionSelect(index)}
                      disabled={showAnswer || isExcluded}
                      style={{ flex: 1 }}
                    >
                      {opzione}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Suggerimenti tastiera */}
            {!zenMode && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                {!showAnswer ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span><kbd style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '4px', padding: '2px 6px', marginRight: '4px', fontFamily: 'monospace' }}>1-4</kbd> Seleziona risposte</span>
                    {selectedOption !== null && (
                      <span><kbd style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '4px', padding: '2px 6px', marginRight: '4px', fontFamily: 'monospace' }}>Invio</kbd> Conferma</span>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span><kbd style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '4px', padding: '2px 6px', marginRight: '4px', fontFamily: 'monospace' }}>S</kbd> Lo sapevo</span>
                    <span><kbd style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '4px', padding: '2px 6px', marginRight: '4px', fontFamily: 'monospace' }}>N</kbd> Non lo sapevo</span>
                  </div>
                )}
              </div>
            )}

            {/* Azioni Bottom */}
            {!showAnswer ? (
              <button 
                onClick={handleCheck}
                disabled={selectedOption === null}
                style={{ 
                  width: '100%', 
                  background: selectedOption !== null ? '#3b82f6' : '#334155', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '1.25rem', 
                  borderRadius: '12px', 
                  fontSize: '1.1rem', 
                  fontWeight: 'bold', 
                  cursor: selectedOption !== null ? 'pointer' : 'not-allowed' 
                }}
              >
                CONFERMA RISPOSTA
              </button>
            ) : (
              <div className="animate-fade-in" style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '1.5rem' }}>
                {/* Header con risultato */}
                <h3 style={{ 
                  margin: '0 0 1rem 0', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  color: selectedOption === currentQuestion.rispostaCorretta ? '#22c55e' : '#ef4444', 
                  fontSize: '1.2rem' 
                }}>
                  {selectedOption === currentQuestion.rispostaCorretta ? <CheckCircle /> : <XCircle />}
                  {antiAnxietyMode
                    ? (selectedOption === currentQuestion.rispostaCorretta
                      ? (() => { const msgs = ['Fantastico! Un passo più vicino alla divisa 👮‍♂️✨', 'Esatto! La costanza premia sempre! 💪', 'Perfetto! Stai costruendo una preparazione solida 📚']; return msgs[currentIndex % msgs.length]; })()
                      : (() => { const msgs = ['Nessun problema, sbagliare fa parte dell\'apprendimento! 🧘📚', 'Non scoraggiarti! Ogni errore è un\'opportunità per imparare 🌱', 'Va bene così! Leggi la spiegazione con calma e riprova 💡']; return msgs[currentIndex % msgs.length]; })()
                    )
                    : (selectedOption === currentQuestion.rispostaCorretta ? 'Risposta Esatta!' : 'Risposta Errata')
                  }
                </h3>

                {/* XP Reward Badge */}
                {selectedOption === currentQuestion.rispostaCorretta && (
                  <div 
                    className="animate-bounce-in"
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '0.4rem', 
                      background: 'rgba(34, 197, 94, 0.12)', 
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      color: '#4ade80', 
                      padding: '0.4rem 0.9rem', 
                      borderRadius: '99px', 
                      fontSize: '0.9rem', 
                      fontWeight: '700',
                      marginBottom: '1rem',
                    }}
                  >
                    ✨ +10 XP Guadagnati!
                  </div>
                )}

                {/* Errore → Aggiunto agli errori */}
                {selectedOption !== currentQuestion.rispostaCorretta && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#fca5a5',
                    padding: '0.4rem 0.9rem',
                    borderRadius: '99px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    marginBottom: '1rem',
                  }}>
                    🩹 Aggiunto ai tuoi errori — ripassalo per recuperare XP!
                  </div>
                )}

                {/* Riferimento Normativo Badge */}
                {currentQuestion.riferimentoNormativo && (
                  <div style={{
                    background: 'rgba(99, 102, 241, 0.08)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    borderRadius: '12px',
                    padding: '0.75rem 1rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                    color: '#a5b4fc',
                    fontWeight: '600',
                  }}>
                    <span style={{ fontSize: '1.1rem' }}>⚖️</span>
                    <span>
                      {currentQuestion.riferimentoNormativo.legge}
                      {currentQuestion.riferimentoNormativo.articolo ? `, Art. ${currentQuestion.riferimentoNormativo.articolo}` : ''}
                      {currentQuestion.riferimentoNormativo.comma ? `, Comma ${currentQuestion.riferimentoNormativo.comma}` : ''}
                    </span>
                  </div>
                )}

                {/* Live stats */}
                {risposteDate.length > 0 && (
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: '#4ade80' }}>
                      <CheckCircle size={14} /> {risposteDate.filter(r => r?.corretta).length} corrette
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: '#f87171' }}>
                      <XCircle size={14} /> {risposteDate.filter(r => r && !r.corretta).length} errate
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                      📊 {Math.round((risposteDate.filter(r => r?.corretta).length / risposteDate.length) * 100)}% precisione
                    </div>
                  </div>
                )}

                {!isTutorOpen ? (
                  <>
                    <p style={{ color: '#cbd5e1', lineHeight: '1.6', marginBottom: '1.5rem', fontSize: '1.05rem' }}>
                      {currentQuestion.spiegazione}
                    </p>
                    {copilotaEnabled && (
                      <button 
                        onClick={() => setIsTutorOpen(true)}
                        style={{
                          marginBottom: '1.5rem',
                          background: 'rgba(99, 102, 241, 0.1)',
                          color: 'var(--elite-primary)',
                          border: '1px solid rgba(99, 102, 241, 0.2)',
                          padding: '0.6rem 1.2rem',
                          borderRadius: '12px',
                          fontSize: '0.85rem',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          transition: 'all 0.2s',
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'; }}
                      >
                        <Bot size={16} /> Chiedi approfondimento al Tutor AI 🤖
                      </button>
                    )}
                  </>
                ) : (
                  <AITutor 
                    question={currentQuestion}
                    selectedOptionIndex={selectedOption}
                    isCorrect={selectedOption === currentQuestion.rispostaCorretta}
                  />
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {selectedOption === currentQuestion.rispostaCorretta ? (
                    <div>
                      <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.75rem', textAlign: 'center', fontWeight: '500' }}>
                        Come valuti questa domanda per il prossimo ripasso?
                      </p>
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <button 
                          onClick={() => handleFeedback(false)} 
                          style={{ 
                            flex: '1 1 100%', 
                            background: '#334155', 
                            color: '#94a3b8', 
                            border: '1px solid #475569', 
                            padding: '0.75rem', 
                            borderRadius: '12px', 
                            fontWeight: 'bold', 
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s',
                            textAlign: 'center'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = '#475569';
                            e.currentTarget.style.color = '#fff';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = '#334155';
                            e.currentTarget.style.color = '#94a3b8';
                          }}
                        >
                          🎲 L'ho indovinata a caso (Ripeti)
                        </button>
                        <button 
                          onClick={() => handleFeedback(true, 'difficile')} 
                          style={{ 
                            flex: '1 1 30%', 
                            background: '#ef4444', 
                            color: '#fff', 
                            border: 'none', 
                            padding: '1rem 0.5rem', 
                            borderRadius: '12px', 
                            fontWeight: 'bold', 
                            cursor: 'pointer', 
                            transition: 'transform 0.15s, background-color 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.25rem',
                            minWidth: '90px'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          <span style={{ fontSize: '1rem' }}>🔴 Difficile</span>
                          <span style={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: 'normal' }}>Rivedi presto</span>
                        </button>
                        <button 
                          onClick={() => handleFeedback(true, 'medio')} 
                          style={{ 
                            flex: '1 1 30%', 
                            background: '#eab308', 
                            color: '#0f172a', 
                            border: 'none', 
                            padding: '1rem 0.5rem', 
                            borderRadius: '12px', 
                            fontWeight: 'bold', 
                            cursor: 'pointer', 
                            transition: 'transform 0.15s, background-color 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.25rem',
                            minWidth: '90px'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          <span style={{ fontSize: '1rem' }}>🟡 Medio</span>
                          <span style={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: 'normal' }}>Rivedi con calma</span>
                        </button>
                        <button 
                          onClick={() => handleFeedback(true, 'facile')} 
                          style={{ 
                            flex: '1 1 30%', 
                            background: '#22c55e', 
                            color: '#fff', 
                            border: 'none', 
                            padding: '1rem 0.5rem', 
                            borderRadius: '12px', 
                            fontWeight: 'bold', 
                            cursor: 'pointer', 
                            transition: 'transform 0.15s, background-color 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.25rem',
                            minWidth: '90px'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          <span style={{ fontSize: '1rem' }}>🟢 Facile</span>
                          <span style={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: 'normal' }}>Rivedi tra molto</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {consecutiveWrong >= 3 && (
                        <div style={{
                          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(245, 158, 11, 0.2)',
                          borderRadius: '16px',
                          padding: '1.25rem',
                          marginBottom: '1rem',
                          color: '#fef3c7',
                          fontSize: '0.95rem',
                          lineHeight: '1.5',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.1)',
                        }}>
                          <div style={{ fontSize: '1.75rem' }}>🧘</div>
                          <div>
                            <strong style={{ color: '#fff', display: 'block', marginBottom: '0.25rem' }}>Respira e rallenta il ritmo</strong>
                            Hai risposto in modo errato a 3 domande consecutive. Per aiutarti a ripartire con slancio, <strong>la difficoltà delle domande è stata temporaneamente ridotta</strong>. Fai un respiro profondo e riprova: ogni errore fa parte del percorso!
                          </div>
                        </div>
                      )}
                      <button 
                        onClick={() => handleFeedback(false)} 
                        style={{ 
                          width: '100%', 
                          background: '#ef4444', 
                          color: '#fff', 
                          border: 'none', 
                          padding: '1.25rem', 
                          borderRadius: '12px', 
                          fontWeight: 'bold', 
                          cursor: 'pointer', 
                          transition: 'transform 0.15s',
                          fontSize: '1.1rem'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.01)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        Capito, aggiungi ai miei errori ➡️
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* CSS Scoped per simulazione */}
        <style>{`
          .simulation-layout-grid {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }
          @media (min-width: 1024px) {
            .simulation-layout-grid {
              display: grid;
              grid-template-columns: 1fr 340px;
              gap: 2rem;
              align-items: start;
            }
          }
          .btn-simulation-option {
            background: #1e293b;
            border: 1px solid #334155;
            color: #cbd5e1;
            padding: 1.25rem;
            border-radius: 12px;
            font-weight: 600;
            text-align: left;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 1.05rem;
            width: 100%;
          }
          .btn-simulation-option:hover {
            background: #334155;
            border-color: #475569;
            color: #fff;
          }
          .btn-simulation-option-selected {
            background: #2563eb !important;
            border-color: #3b82f6 !important;
            color: #fff !important;
            box-shadow: 0 0 12px rgba(59, 130, 246, 0.4);
          }
          .pulse-warning {
            animation: warningPulse 2s infinite alternate;
          }
          @keyframes warningPulse {
            0% { box-shadow: 0 0 4px rgba(245, 158, 11, 0.2); }
            100% { box-shadow: 0 0 12px rgba(245, 158, 11, 0.6); }
          }
        `}</style>
      </div>
    </div>
  );
}
