import { Navigate, useNavigate } from 'react-router-dom';
import { useQuizSession } from '../hooks/useQuizSession';
import { QuizView, ResultsView } from '../components/quiz';
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export default function StudyMode() {
  const navigate = useNavigate();

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
    isSimulationMode
  } = useQuizSession();

  const [hasAcceptedWarning, setHasAcceptedWarning] = useState(false);

  // 1. Guardia di sicurezza (Se l'utente ricarica la pagina perde lo stato)
  if (!hasValidSession) {
    return <Navigate to="/dashboard" replace />;
  }

  // 2. Schermata di fine sessione (Elite Results)
  if (isFinished && risultati) {
    return (
      <ResultsView
        risultati={risultati}
        onRevisione={() => {
          navigate('/dashboard');
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

  // 3. Schermata Quiz Attiva
  return (
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
      onAbandon={() => navigate('/dashboard')}
    />
  );
}
