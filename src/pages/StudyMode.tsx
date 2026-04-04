import { Navigate, useNavigate } from 'react-router-dom';
import { useQuizSession } from '../hooks/useQuizSession';
import { QuizView, ResultsView } from '../components/quiz';

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
    risultati
  } = useQuizSession();

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
          // Naviga alla dashboard o implementa logic di revisione specifica
          navigate('/dashboard');
        }}
        onNuovoQuiz={() => {
          // Naviga al builder per configurare un nuovo test
          navigate('/quiz-builder');
        }}
      />
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
      onAbandon={() => navigate('/dashboard')}
    />
  );
}
