import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Star, Type, Maximize, Minimize, Landmark } from 'lucide-react';
import type { DomandaPL } from '../../types/pl';
import { useProgress } from '../../context/ProgressContext';

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
  handleFeedback: (isSelfDeclaredCorrect: boolean) => void;
  onAbandon: () => void;
  isSimulationMode?: boolean; // 🆕 Flag per modalità esame
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
}: QuizViewProps) {
  
  const { progressiGlobali, toggleSegnalibro } = useProgress();
  const [zenMode, setZenMode] = useState(false);
  const [fontLevel, setFontLevel] = useState(1); // 0 = piccolo, 1 = medio, 2 = grande

  const fontSizes = ['1.1rem', '1.3rem', '1.6rem'];
  const currentFontSize = fontSizes[fontLevel];
  
  const isSaved = progressiGlobali.domandeSalvate?.includes(currentQuestion.id);

  // Handler per modalità simulazione (avanzamento senza feedback)
  const handleNextInSimulation = () => {
    handleFeedback(true); // Registra la risposta ma non mostra feedback
  };

  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', padding: '1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
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
              <div style={{ color: '#cbd5e1', fontWeight: '600' }}>
                Domanda {currentIndex + 1} di {totalQuestions}
              </div>
            </header>

            {/* Banner Modalità Esame */}
            {isSimulationMode && (
              <div style={{
                background: '#92400e',
                border: '1px solid #c2410c',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '2rem',
              }}>
                <AlertTriangle size={20} color="#f59e0b" />
                <div style={{ fontSize: '0.95rem', color: '#fef3c7' }}>
                  <strong style={{ color: '#fde68a' }}>Modalità Esame:</strong> Non vedrai le correzioni fino alla fine.
                </div>
              </div>
            )}

            <div style={{ height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden', marginBottom: '2rem' }}>
              <div style={{ width: `${progressPercentage}%`, height: '100%', background: '#3b82f6', transition: 'width 0.3s ease' }} />
            </div>
          </>
        )}

        {/* Domanda */}
        <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '24px', border: '1px solid #334155', marginBottom: '2rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
          
          {/* Toolbar UX Intensiva: Categoria, Font, Zen Mode, Segnalibro */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            {!zenMode ? (
              <div style={{ display: 'inline-block', background: '#334155', color: '#cbd5e1', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                {currentQuestion.categoriaId.toUpperCase()}
              </div>
            ) : <div />}

            <div style={{ display: 'flex', gap: '0.5rem', background: '#0f172a', padding: '0.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
              <button onClick={() => setFontLevel((f) => (f + 1) % 3)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center' }} title="Cambia Dimensione Testo">
                <Type size={18} />
              </button>
              <button onClick={() => setZenMode(!zenMode)} style={{ background: 'transparent', border: 'none', color: zenMode ? '#3b82f6' : '#94a3b8', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center' }} title="Toggle Zen Mode">
                {zenMode ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
              <button onClick={async () => await toggleSegnalibro(currentQuestion.id)} style={{ background: 'transparent', border: 'none', color: isSaved ? '#d4af37' : '#94a3b8', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }} title="Salva nei Segnalibri">
                <Star size={20} fill={isSaved ? '#d4af37' : 'none'} />
              </button>
            </div>
          </div>

          <h2 style={{ fontSize: currentFontSize, lineHeight: '1.6', margin: 0, transition: 'font-size 0.2s ease' }}>{currentQuestion.testo}</h2>

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
            const isCorrect = showAnswer && !isSimulationMode && index === currentQuestion.rispostaCorretta;
            const isWrong = showAnswer && !isSimulationMode && isSelected && index !== currentQuestion.rispostaCorretta;

            let bgColor = '#1e293b';
            let borderColor = '#334155';
            
            // Solo in modalità pratica mostra i colori di feedback
            if (!isSimulationMode) {
              if (isSelected && !showAnswer) { bgColor = '#1e40af'; borderColor = '#3b82f6'; }
              if (isCorrect) { bgColor = '#14532d'; borderColor = '#22c55e'; }
              if (isWrong) { bgColor = '#7f1d1d'; borderColor = '#ef4444'; }
            } else {
              // In modalità esame, solo evidenzia la selezione corrente
              if (isSelected) { bgColor = '#1e40af'; borderColor = '#3b82f6'; }
            }

            return (
              <div key={index} style={{ display: 'flex', gap: '0.5rem', opacity: (isExcluded && !showAnswer) ? 0.4 : 1 }}>
                
                {/* Bottone Esclusione (X) - Solo in modalità pratica */}
                {!showAnswer && !isSimulationMode && (
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
                      fontWeight: 'bold' 
                    }}
                  >
                    ×
                  </button>
                )}

                {/* Bottone Opzione */}
                <button
                  onClick={() => handleOptionSelect(index)}
                  disabled={(showAnswer && !isSimulationMode) || isExcluded}
                  style={{ 
                    flex: 1, 
                    textAlign: 'left', 
                    padding: '1.25rem', 
                    borderRadius: '12px', 
                    background: bgColor, 
                    border: `2px solid ${borderColor}`, 
                    color: '#f8fafc', 
                    fontSize: '1.1rem', 
                    cursor: ((showAnswer && !isSimulationMode) || isExcluded) ? 'default' : 'pointer', 
                    transition: 'all 0.2s' 
                  }}
                >
                  {opzione}
                </button>
              </div>
            );
          })}
        </div>

        {/* Azioni: Modalità Pratica vs Simulazione */}
        {!isSimulationMode ? (
          /* MODALITÀ PRATICA: Mostra feedback e pulsanti "Lo sapevo" */
          !showAnswer ? (
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
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '1.5rem' }}>
              <h3 style={{ 
                margin: '0 0 1rem 0', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                color: selectedOption === currentQuestion.rispostaCorretta ? '#22c55e' : '#ef4444', 
                fontSize: '1.2rem' 
              }}>
                {selectedOption === currentQuestion.rispostaCorretta ? <CheckCircle /> : <XCircle />}
                {selectedOption === currentQuestion.rispostaCorretta ? 'Risposta Esatta!' : 'Risposta Errata'}
              </h3>
              <p style={{ color: '#cbd5e1', lineHeight: '1.6', marginBottom: '1.5rem', fontSize: '1.05rem' }}>
                {currentQuestion.spiegazione}
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => handleFeedback(false)} 
                  style={{ 
                    flex: 1, 
                    background: '#ef4444', 
                    color: '#fff', 
                    border: 'none', 
                    padding: '1rem', 
                    borderRadius: '12px', 
                    fontWeight: 'bold', 
                    cursor: 'pointer', 
                    transition: 'opacity 0.2s' 
                  }}
                >
                  Non lo sapevo
                </button>
                <button 
                  onClick={() => handleFeedback(true)} 
                  style={{ 
                    flex: 1, 
                    background: '#22c55e', 
                    color: '#fff', 
                    border: 'none', 
                    padding: '1rem', 
                    borderRadius: '12px', 
                    fontWeight: 'bold', 
                    cursor: 'pointer', 
                    transition: 'opacity 0.2s' 
                  }}
                >
                  Lo sapevo!
                </button>
              </div>
            </div>
          )
        ) : (
          /* MODALITÀ SIMULAZIONE: Solo avanzamento, nessun feedback */
          <button
            onClick={handleNextInSimulation}
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
              cursor: selectedOption !== null ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
            }}
          >
            {isLastQuestion ? '✅ TERMINA ESAME' : '➡️ PROSSIMA DOMANDA'}
          </button>
        )}
      </div>
    </div>
  );
}
