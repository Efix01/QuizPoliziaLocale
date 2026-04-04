import { Navigate, useNavigate } from 'react-router-dom';
import { useQuizSession } from '../hooks/useQuizSession';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, HelpCircle } from 'lucide-react';

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
  } = useQuizSession();

  // 1. Guardia di sicurezza (Se l'utente ricarica la pagina perde lo stato)
  if (!hasValidSession) {
    return <Navigate to="/dashboard" replace />;
  }

  // 2. Schermata di fine sessione
  if (isFinished) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f8fafc' }}>
        <div style={{ textAlign: 'center', background: '#1e293b', padding: '3rem', borderRadius: '24px', border: '1px solid #334155' }}>
          <CheckCircle color="#22c55e" size={64} style={{ margin: '0 auto 1rem auto' }} />
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Sessione Completata!</h1>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>I tuoi progressi sono stati salvati.</p>
          <button onClick={() => navigate('/dashboard')} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '1rem 2rem', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            Torna alla Dashboard
          </button>
        </div>
      </div>
    );
  }

  // 3. Render Domanda Corrente
  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', padding: '1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header e Progresso */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={20} /> Abbandona
          </button>
          <div style={{ color: '#cbd5e1', fontWeight: '600' }}>
            Domanda {currentIndex + 1} di {sessionQuestions.length}
          </div>
        </header>

        <div style={{ height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden', marginBottom: '2rem' }}>
          <div style={{ width: `${progressPercentage}%`, height: '100%', background: '#3b82f6', transition: 'width 0.3s ease' }} />
        </div>

        {/* Domanda */}
        <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '24px', border: '1px solid #334155', marginBottom: '2rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'inline-block', background: '#334155', color: '#cbd5e1', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            {currentQuestion.categoriaId.toUpperCase()}
          </div>
          <h2 style={{ fontSize: '1.3rem', lineHeight: '1.6', margin: 0 }}>{currentQuestion.testo}</h2>
        </div>

        {/* Opzioni */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          {currentQuestion.opzioni.map((opzione, index) => {
            const isSelected = selectedOption === index;
            const isExcluded = excludedOptions.includes(index);
            const isCorrect = showAnswer && index === currentQuestion.rispostaCorretta;
            const isWrong = showAnswer && isSelected && index !== currentQuestion.rispostaCorretta;

            let bgColor = '#1e293b';
            let borderColor = '#334155';
            if (isSelected && !showAnswer) { bgColor = '#1e40af'; borderColor = '#3b82f6'; }
            if (isCorrect) { bgColor = '#14532d'; borderColor = '#22c55e'; }
            if (isWrong) { bgColor = '#7f1d1d'; borderColor = '#ef4444'; }

            return (
              <div key={index} style={{ display: 'flex', gap: '0.5rem', opacity: (isExcluded && !showAnswer) ? 0.4 : 1 }}>
                
                {/* Bottone Esclusione (X) */}
                {!showAnswer && (
                  <button 
                    onClick={(e) => toggleExclusion(e, index)}
                    style={{ background: isExcluded ? '#ef4444' : '#334155', border: 'none', borderRadius: '12px', width: '50px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}
                  >
                    ×
                  </button>
                )}

                {/* Bottone Opzione */}
                <button
                  onClick={() => handleOptionSelect(index)}
                  disabled={showAnswer || isExcluded}
                  style={{ flex: 1, textAlign: 'left', padding: '1.25rem', borderRadius: '12px', background: bgColor, border: `2px solid ${borderColor}`, color: '#f8fafc', fontSize: '1.1rem', cursor: (showAnswer || isExcluded) ? 'default' : 'pointer', transition: 'all 0.2s' }}
                >
                  {opzione}
                </button>
              </div>
            );
          })}
        </div>

        {/* Azioni: Conferma o Feedback */}
        {!showAnswer ? (
          <button 
            onClick={handleCheck}
            disabled={selectedOption === null}
            style={{ width: '100%', background: selectedOption !== null ? '#3b82f6' : '#334155', color: '#fff', border: 'none', padding: '1.25rem', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', cursor: selectedOption !== null ? 'pointer' : 'not-allowed' }}
          >
            CONFERMA RISPOSTA
          </button>
        ) : (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: selectedOption === currentQuestion.rispostaCorretta ? '#22c55e' : '#ef4444', fontSize: '1.2rem' }}>
              {selectedOption === currentQuestion.rispostaCorretta ? <CheckCircle /> : <XCircle />}
              {selectedOption === currentQuestion.rispostaCorretta ? 'Risposta Esatta!' : 'Risposta Errata'}
            </h3>
            <p style={{ color: '#cbd5e1', lineHeight: '1.6', marginBottom: '1.5rem', fontSize: '1.05rem' }}>
              {currentQuestion.spiegazione}
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => handleFeedback(false)} style={{ flex: 1, background: '#ef4444', color: '#fff', border: 'none', padding: '1rem', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'opacity 0.2s' }}>Non lo sapevo</button>
              <button onClick={() => handleFeedback(true)} style={{ flex: 1, background: '#22c55e', color: '#fff', border: 'none', padding: '1rem', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'opacity 0.2s' }}>Lo sapevo!</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
