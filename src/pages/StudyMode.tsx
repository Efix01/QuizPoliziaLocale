import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useQuizSession } from '../hooks/useQuizSession';
import { QuizView, ResultsView } from '../components/quiz';
import { AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';

function StudyModeComponent() {
  const navigate = useNavigate();
  const [showExitModal, setShowExitModal] = useState(false);

  const {
    hasValidSession,
    currentQuestion,
    currentIndex,
    sessionQuestions,
    showAnswer,
    selectedOption,
    excludedOptions,
    isFinished,
    handleOptionSelect,
    toggleExclusion,
    handleCheck,
    handleFeedback,
    progressPercentage,
    risultati,
    risposteDate,
    isSimulationMode,
    isDailyChallenge,
    antiAnxietyMode,
    timeLeft,
    totalDurationSeconds,
    consecutiveWrong,
    // 🆕 Nuovi per navigazione e consegna griglia simulazione
    setCurrentIndex,
    visitedIndexes,
    consegnaSimulazione
  } = useQuizSession();

  const [hasAcceptedWarning, setHasAcceptedWarning] = useState(false);

  // Intercetta chiusura/ricaricamento del tab browser
  useEffect(() => {
    if (!hasValidSession || isFinished) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Sei sicuro di voler uscire? La sessione attiva verrà salvata localmente, ma i progressi parziali non salvati sul server potrebbero andare persi.';
      return e.returnValue;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasValidSession, isFinished]);

  // Guardia di sicurezza (Se l'utente ricarica la pagina perde lo stato)
  if (!hasValidSession) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isFinished && risultati) {
    return (
      <ResultsView
        risultati={risultati}
        isSimulationMode={isSimulationMode}
        isDailyChallenge={isDailyChallenge}
        onRevisione={() => {
          if (!risposteDate || risposteDate.length !== sessionQuestions.length) {
            navigate('/dashboard');
            return;
          }
          const erroriSessione = sessionQuestions.filter((_, idx) => !risposteDate[idx]?.corretta);
          
          if (erroriSessione.length === 0) {
            alert("Ottimo lavoro! Non ci sono errori da rivedere.");
            navigate('/dashboard');
            return;
          }
          
          navigate('/study', {
            state: {
              domande: erroriSessione,
              mode: 'review_session' // eviterà il modale della simulazione
            }
          });
        }}
        onNuovoQuiz={() => {
          navigate('/quiz-builder');
        }}
      />
    );
  }

  // 🆕 Warning Modal per Simulazione
  if (isSimulationMode && !hasAcceptedWarning) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
        <div style={{ maxWidth: '400px', width: '100%', padding: '2.5rem', background: '#1e293b', borderRadius: '32px', border: '1px solid #334155', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <AlertTriangle size={48} color="#ef4444" />
          </div>
          <h2 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: '900', marginBottom: '1rem' }}>⚠️ Attenzione</h2>
          <div style={{ color: '#cbd5e1', lineHeight: '1.6', fontSize: '1.05rem', marginBottom: '2rem' }}>
            <p style={{ margin: '0 0 1rem 0' }}>Stai per avviare una <strong>SIMULAZIONE UFFICIALE</strong>.</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, textAlign: 'left', display: 'grid', gap: '0.75rem' }}>
              <li style={{ display: 'flex', gap: '0.5rem' }}>❌ Nessuna correzione istantanea</li>
              <li style={{ display: 'flex', gap: '0.5rem' }}>❌ Nessuna spiegazione attiva</li>
              <li style={{ display: 'flex', gap: '0.5rem' }}>✅ Risultati completi solo alla fine</li>
            </ul>
          </div>
          <button 
            onClick={() => setHasAcceptedWarning(true)}
            style={{ width: '100%', padding: '1.25rem', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '1.1rem', fontWeight: '800', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 10px 15px -3px rgba(34, 197, 94, 0.3)' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            ACCETTO E INIZIO
          </button>
        </div>
      </div>
    );
  }

  const handleSaveAndPause = () => {
    navigate('/dashboard');
  };

  const handleQuitAndDiscard = () => {
    localStorage.removeItem('pl_active_session');
    navigate('/dashboard');
  };

  return (
    <>
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
        isSimulationMode={isSimulationMode}
        timeLeft={timeLeft}
        totalDurationSeconds={totalDurationSeconds}
        consecutiveWrong={consecutiveWrong}
        onAbandon={() => setShowExitModal(true)}
        antiAnxietyMode={antiAnxietyMode}
        risposteDate={risposteDate}
        // 🆕 Nuovi parametri passati a QuizView
        setCurrentIndex={setCurrentIndex}
        visitedIndexes={visitedIndexes}
        consegnaSimulazione={consegnaSimulazione}
      />

      {showExitModal && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(15, 23, 42, 0.85)', 
          backdropFilter: 'blur(10px)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000, 
          padding: '1rem' 
        }}>
          <div style={{ 
            maxWidth: '450px', 
            width: '100%', 
            padding: '2.5rem', 
            background: '#1e293b', 
            borderRadius: '24px', 
            border: '1px solid #334155', 
            textAlign: 'center', 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
          }}>
            <div style={{ 
              background: 'rgba(59, 130, 246, 0.1)', 
              width: '70px', 
              height: '70px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1.5rem' 
            }}>
              <AlertTriangle size={36} color={isSimulationMode ? "#ef4444" : "#3b82f6"} />
            </div>
            
            {isSimulationMode ? (
              <>
                <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.75rem' }}>
                  Abbandonare la Simulazione?
                </h3>
                <p style={{ color: '#fca5a5', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                  Attenzione! Se esci ora la simulazione verrà interrotta ed il tuo elaborato verrà consegnato automaticamente con le sole risposte salvate finora.
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button 
                    onClick={async () => {
                      await consegnaSimulazione();
                    }}
                    style={{ 
                      width: '100%', 
                      padding: '1rem', 
                      background: '#ef4444', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: '12px', 
                      fontSize: '1rem', 
                      fontWeight: '700', 
                      cursor: 'pointer', 
                      transition: 'transform 0.15s',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    🚩 Consegna elaborato ed esci
                  </button>
                  
                  <button 
                    onClick={() => setShowExitModal(false)}
                    style={{ 
                      width: '100%', 
                      padding: '1rem', 
                      background: '#334155', 
                      color: '#cbd5e1', 
                      border: '1px solid #475569', 
                      borderRadius: '12px', 
                      fontSize: '1rem', 
                      fontWeight: '700', 
                      cursor: 'pointer', 
                      transition: 'all 0.15s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    Torna alla simulazione
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.75rem' }}>
                  Vuoi mettere in pausa lo studio?
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                  La tua sessione attiva e il tempo di studio finora accumulato sono al sicuro. Puoi scegliere di congelare la sessione per riprenderla in un secondo momento.
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button 
                    onClick={handleSaveAndPause}
                    style={{ 
                      width: '100%', 
                      padding: '1rem', 
                      background: '#3b82f6', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: '12px', 
                      fontSize: '1rem', 
                      fontWeight: '700', 
                      cursor: 'pointer', 
                      transition: 'transform 0.15s',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    💾 Salva e Pausa (Consigliato)
                  </button>
                  
                  <button 
                    onClick={handleQuitAndDiscard}
                    style={{ 
                      width: '100%', 
                      padding: '1rem', 
                      background: 'rgba(239, 68, 68, 0.1)', 
                      color: '#ef4444', 
                      border: '1px solid rgba(239, 68, 68, 0.2)', 
                      borderRadius: '12px', 
                      fontSize: '1rem', 
                      fontWeight: '700', 
                      cursor: 'pointer', 
                      transition: 'all 0.15s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    🗑️ Elimina sessione ed esci
                  </button>
                  
                  <button 
                    onClick={() => setShowExitModal(false)}
                    style={{ 
                      width: '100%', 
                      padding: '1rem', 
                      background: 'transparent', 
                      color: '#94a3b8', 
                      border: 'none', 
                      borderRadius: '12px', 
                      fontSize: '0.95rem', 
                      fontWeight: '600', 
                      cursor: 'pointer', 
                      transition: 'color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                    onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
                  >
                    Annulla e continua il quiz
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function StudyMode() {
  const location = useLocation();
  return <StudyModeComponent key={location.key} />;
}
