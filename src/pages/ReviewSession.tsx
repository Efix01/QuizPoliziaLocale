import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';

import { useQuizPL } from '../hooks/useQuizPL';
import QuizView from '../components/quiz/QuizView';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReviewSession() {
  const location = useLocation();
  const navigate = useNavigate();
  const { progressiGlobali, erroriLog, srsData } = useProgress();
  const { generaQuizId } = useQuizPL();

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

  // 1. Estrai gli ID rilevanti
  const targetIds = useMemo(() => {
    if (isMistakes) {
      if (!erroriLog) return [];
      return Object.entries(erroriLog)
        .filter(([_, log]) => log && log.count > 0)
        .sort(([_, a], [__, b]) => b.count - a.count) 
        .map(([id]) => id);
    } else if (isSrs) {
      if (!srsData) return [];
      const now = new Date();
      return Object.entries(srsData)
        .filter(([_, log]) => log && new Date(log.nextReview) <= now)
        .sort(([_, a], [__, b]) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime())
        .map(([id]) => id);
    } else {
      return progressiGlobali?.domandeSalvate || [];
    }
  }, [isMistakes, isSrs, progressiGlobali, erroriLog, srsData]);

  // 2. Genera il quiz basandosi sugli ID
  const sessionQuestions = useMemo(() => {
    return generaQuizId(targetIds);
  }, [targetIds, generaQuizId]);

  // Stato UI del quiz
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [excludedOptions, setExcludedOptions] = useState<number[]>([]);
  const [sessionScore, setSessionScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Azioni di Ripasso
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

  const handleFeedback = (isSelfDeclaredCorrect: boolean) => {
    // In modalità ripasso, se risponde giusto potremmo voler scalare gli errori/rimuovere segnalibro?
    // Per ora teniamolo essenziale: prosegui e vai alla prossima.
    if (isSelfDeclaredCorrect) {
      setSessionScore(s => s + 1);
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

  // Se vuoto
  if (sessionQuestions.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#020617', color: '#f8fafc', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{title}</h2>
        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>{emptyMessage}</p>
        <button 
          onClick={() => navigate('/dashboard')}
          style={{ background: '#3b82f6', color: 'white', padding: '1rem 2rem', borderRadius: '12px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
        >
          Torna alla Dashboard
        </button>
      </div>
    );
  }

  // Risultato Fine Review
  if (isCompleted) {
    const accuracy = Math.round((sessionScore / sessionQuestions.length) * 100);
    return (
      <div style={{ minHeight: '100vh', background: '#020617', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ background: '#0f172a', padding: '3rem', borderRadius: '24px', border: '1px solid #1e293b', textAlign: 'center', maxWidth: '500px', width: '100%' }}
        >
          {accuracy >= 80 ? (
            <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 1.5rem' }} />
          ) : (
            <XCircle size={64} color="#ef4444" style={{ margin: '0 auto 1.5rem' }} />
          )}
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Ripasso Completato!</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '1.2rem' }}>
            Hai risposto correttamente al <strong>{accuracy}%</strong> delle domande.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={() => navigate('/dashboard')}
              style={{ padding: '1rem 2rem', background: '#1e293b', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
            >
              Dashboard
            </button>
            <button 
              onClick={() => window.location.reload()}
              style={{ padding: '1rem 2rem', background: '#3b82f6', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
            >
              Ripeti
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Sessione Quiz
  const progressPercentage = ((currentIndex + 1) / sessionQuestions.length) * 100;

  return (
    <div style={{ minHeight: '100vh', background: '#020617', display: 'flex', flexDirection: 'column' }}>
      {/* Header compatto personalizzato per Review */}
      <div style={{ padding: '1rem 2rem', background: '#0f172a', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={20} /> Dashboard
        </button>
        <span style={{ marginLeft: 'auto', fontWeight: 600, color: isMistakes ? '#ef4444' : '#f59e0b', fontSize: '1.2rem' }}>
          {title}
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
          onAbandon={() => navigate('/dashboard')}
          isSimulationMode={false} // È un ripasso libero, simile alla pratica
        />
      </div>
    </div>
  );
}
