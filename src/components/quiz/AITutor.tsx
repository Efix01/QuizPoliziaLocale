import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, BookOpen, Landmark, Lightbulb, Send, User } from 'lucide-react';
import type { DomandaPL } from '../../types/pl';

interface AITutorProps {
  question: DomandaPL;
  selectedOptionIndex: number | null;
  isCorrect: boolean;
}

interface Message {
  id: string;
  sender: 'student' | 'tutor';
  text: string;
  type?: 'default' | 'example' | 'law' | 'mnemonic';
}

const CATEGORIA_NOMENCLATURA: Record<string, string> = {
  cds: 'Codice della Strada (CdS)',
  penale: 'Diritto e Procedura Penale',
  l689: 'Legge 689/81 (Sanzioni Amministrative)',
  l241: 'Legge 241/90 (Procedimento Amministrativo)',
  tuel: 'TUEL (Ordinamento Enti Locali)',
  enti_locali: 'Ordinamento Enti Locali',
  costituzionale: 'Diritto Costituzionale',
  amministrativo: 'Diritto Amministrativo',
  reg_generale: 'Normativa Regionale',
  com_generale: 'Regolamento Comunale',
};

// Generatore di risposte locali, deterministico, gratuito e personalizzato
function generaRispostaTutor(
  question: DomandaPL,
  wrongOptionText: string | null,
  type: 'initial' | 'example' | 'law' | 'mnemonic'
): string {
  const cat = question.categoriaId;
  const correctOptionText = question.opzioni[question.rispostaCorretta];
  
  if (type === 'initial') {
    if (wrongOptionText) {
      return `Ciao! Capisco perfettamente il tuo dubbio. Hai risposto *"${wrongOptionText}"*, ma la risposta corretta è **"${correctOptionText}"**.\n\nEcco la spiegazione tecnica:\n${question.spiegazione}\n\nCosa preferisci approfondire ora? Clicca su uno dei suggerimenti qui sotto! 👇`;
    } else {
      return `Ottimo lavoro! Hai risposto correttamente **"${correctOptionText}"**.\n\nRipassiamo la spiegazione tecnica per consolidare:\n${question.spiegazione}\n\nVuoi vedere un esempio pratico o un trucco mnemonico per fissarlo in mente?`;
    }
  }

  if (type === 'example') {
    switch (cat) {
      case 'cds':
        return `📖 **Scenario Pratico (Codice della Strada):**\nImmagina una pattuglia che ferma un conducente per un normale controllo. Se l'infrazione contestata comporta una sanzione accessoria (es. sospensione patente), gli agenti procedono al ritiro fisico del documento redigendo l'apposito verbale. Ricorda che la sanzione accessoria serve a tutelare la sicurezza stradale nell'immediato.`;
      case 'penale':
        return `📖 **Scenario Pratico (Diritto Penale):**\nImmagina di essere in servizio e assistere a un soggetto che scippa una borsa a un passante (furto con strappo, art. 624-bis c.p.). Trattandosi di un delitto grave, gli agenti di Polizia Giudiziaria procedono all'arresto obbligatorio in flagranza (art. 380 c.p.p.), bloccando il colpevole nell'atto o subito dopo il fatto con la refurtiva.`;
      case 'tuel':
      case 'enti_locali':
        return `📖 **Scenario Pratico (TUEL & Enti Locali):**\nSe il Consiglio Comunale deve approvare il Bilancio di Previsione, si tratta di un atto programmatorio fondamentale (competenza esclusiva del Consiglio ex art. 42). Se invece c'è da firmare un'ordinanza urgente per mettere in sicurezza un edificio pericolante, la firma spetta al Sindaco in qualità di Ufficiale di Governo (art. 54).`;
      case 'l241':
        return `📖 **Scenario Pratico (L. 241/90):**\nUn cittadino presenta una SCIA per aprire un negozio. Trascorsi i termini di legge (di norma 30 giorni) senza che il Comune abbia notificato motivi ostativi, opera il principio del Silenzio-Assenso. Tuttavia, se l'attività riguarda interessi sensibili (es. tutela dell'ambiente o beni culturali), il silenzio non equivale ad assenso e serve un provvedimento espresso.`;
      case 'l689':
        return `📖 **Scenario Pratico (Legge 689/81):**\nUn minore di 18 anni viene sorpreso alla guida di un ciclomotore senza assicurazione. Poiché ha meno di 18 anni, l'agente non può contestare l'illecito direttamente a lui (mancanza di imputabilità amministrativa). Il verbale viene quindi intestato e notificato ai genitori (o tutori) per omessa vigilanza, i quali risponderanno in solido.`;
      default:
        return `📖 **Scenario Pratico:**\nImmagina l'applicazione di questa regola durante il servizio quotidiano sul territorio. Saper distinguere la competenza dell'organo o la qualificazione del fatto (se illecito penale o amministrativo) garantisce la piena legittimità dell'atto ed evita che venga successivamente annullato in sede di ricorso.`;
    }
  }

  if (type === 'law') {
    const legge = question.riferimentoNormativo?.legge || question.fonte || 'Normativa di riferimento';
    const articolo = question.riferimentoNormativo?.articolo 
      ? `Articolo ${question.riferimentoNormativo.articolo}` 
      : 'Riferimento specifico';
    const comma = question.riferimentoNormativo?.comma ? `, comma ${question.riferimentoNormativo.comma}` : '';

    return `⚖️ **Focus Normativo:**\n\n- **Fonte**: *${legge}*\n- **Riferimento**: **${articolo}${comma}**\n\nQuesta disposizione stabilisce in modo chiaro i confini e le modalità di applicazione. Nei concorsi di Polizia Locale, ricordare l'esatto articolo (come l'art. 186 per la guida in stato di ebbrezza, o l'art. 380 c.p.p. per l'arresto in flagranza) fornisce un punteggio aggiuntivo enorme nelle prove scritte ed orali.`;
  }

  if (type === 'mnemonic') {
    switch (cat) {
      case 'cds':
        return `💡 **Trucco Mnemonico (CdS):**\nRicorda la scala di gravità del documento di guida:\n1. **Ritiro**: Provvedimento materiale immediato (la patente scade, la prendo).\n2. **Sospensione**: Sanzione a tempo (ti fermi per un po' perché hai sbagliato).\n3. **Revoca**: Cancellazione definitiva (hai esagerato, devi rifare l'esame).`;
      case 'penale':
        return `💡 **Trucco Mnemonico (Diritto Penale):**\nPer non confondere mai le sanzioni:\n- **Delitti** = **M**ulta o **R**eclusione (pensa a **M**edici e **R**icette, o la sigla **MD**).\n- **Contravvenzioni** = **A**rresto o **A**mmenda (pensa all'acronimo **AA** — Doppia A per i reati minori).`;
      case 'tuel':
      case 'enti_locali':
        return `💡 **Trucco Mnemonico (Organi Comunali):**\n- **Consiglio** = *Il Cervello* (pensa, legifera, approva regolamenti e bilanci. Fa le regole del gioco).\n- **Giunta** = *Il Motore* (esegue, delibera su tutto il resto, ha competenza residuale).\n- **Sindaco** = *Il Volto* (rappresenta l'ente ed emana ordinanze d'urgenza).`;
      case 'l241':
        return `💡 **Trucco Mnemonico (L. 241/90):**\nAssocia i termini alla parola **"TRENTA"**:\n30 giorni è il termine generale di conclusione del procedimento amministrativo. Solo i procedimenti statali più complessi possono arrivare a 90 o massimo 180 giorni. Se hai un dubbio sul termine base, rispondi sempre **30 giorni**.`;
      case 'l689':
        return `💡 **Trucco Mnemonico (Legge 689):**\nPer calcolare il "Pagamento in misura ridotta" (art. 16), ricordati la frazione **1/3** ed il moltiplicatore **2**:\nSi paga la cifra più favorevole tra **un terzo** (1/3) del massimo ed il **doppio** (2x) del minimo.`;
      default:
        return `💡 **Trucco Mnemonico Generale:**\nNelle domande a risposta multipla:\n- Diffida dalle opzioni che contengono parole assolute come *"sempre"*, *"mai"*, o *"in ogni caso"*. Le leggi italiane contengono quasi sempre eccezioni o deroghe.\n- Cerca la risposta che cita espressamente un articolo o che si esprime con terminologia burocratica formale.`;
    }
  }

  return '';
}

export default function AITutor({ question, selectedOptionIndex, isCorrect }: AITutorProps) {
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [visiblePrompts, setVisiblePrompts] = useState<('example' | 'law' | 'mnemonic')[]>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const wrongOptionText = selectedOptionIndex !== null && !isCorrect 
    ? question.opzioni[selectedOptionIndex] 
    : null;

  // Inizializza la chat al caricamento della domanda
  useEffect(() => {
    setChatHistory([]);
    setIsTyping(true);
    setVisiblePrompts([]);

    // 1. Studente esprime il dubbio
    const studentMsgText = wrongOptionText
      ? `Tutor, ho risposto "${wrongOptionText}" ma il sistema mi dice che è errata. Perché la risposta esatta è "${question.opzioni[question.rispostaCorretta]}"?`
      : `Tutor, ho risposto correttamente "${question.opzioni[question.rispostaCorretta]}". Mi faresti un riassunto dei concetti chiave?`;

    const studentMessage: Message = {
      id: `student-init-${question.id}`,
      sender: 'student',
      text: studentMsgText,
    };

    const initialTimer = setTimeout(() => {
      setChatHistory([studentMessage]);
      
      // 2. Il tutor risponde dopo 800ms
      const tutorTimer = setTimeout(() => {
        const initialResponse = generaRispostaTutor(question, wrongOptionText, 'initial');
        setChatHistory(prev => [...prev, {
          id: `tutor-init-${question.id}`,
          sender: 'tutor',
          text: initialResponse,
          type: 'default'
        }]);
        setIsTyping(false);
        // Mostra i bottoni per approfondire
        setVisiblePrompts(['example', 'law', 'mnemonic']);
      }, 1000);

      return () => clearTimeout(tutorTimer);
    }, 400);

    return () => clearTimeout(initialTimer);
  }, [question, selectedOptionIndex, isCorrect, wrongOptionText]);

  // Scroll automatico alla fine dei messaggi
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  const handlePromptClick = (type: 'example' | 'law' | 'mnemonic') => {
    // Rimuove l'opzione cliccata per evitare duplicazioni
    setVisiblePrompts(prev => prev.filter(p => p !== type));
    
    // 1. Aggiungi messaggio studente
    let studentText = '';
    if (type === 'example') studentText = '📖 Mostrami un esempio pratico per capire meglio.';
    if (type === 'law') studentText = '⚖️ Qual è il riferimento di legge preciso?';
    if (type === 'mnemonic') studentText = '💡 Dammi un trucco mnemonico per ricordarlo.';

    const studentMessage: Message = {
      id: `student-${type}-${Date.now()}`,
      sender: 'student',
      text: studentText
    };

    setChatHistory(prev => [...prev, studentMessage]);
    setIsTyping(true);

    // 2. Risposta del tutor dopo 800ms
    setTimeout(() => {
      const tutorText = generaRispostaTutor(question, wrongOptionText, type);
      const tutorMessage: Message = {
        id: `tutor-${type}-${Date.now()}`,
        sender: 'tutor',
        text: tutorText,
        type
      };
      setChatHistory(prev => [...prev, tutorMessage]);
      setIsTyping(false);
    }, 800);
  };

  const materiaNomenclatura = CATEGORIA_NOMENCLATURA[question.categoriaId] || question.categoriaId.toUpperCase();

  return (
    <div style={{
      background: 'rgba(30, 41, 59, 0.45)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '24px',
      padding: '1.5rem',
      marginTop: '1.5rem',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.25)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
    }}>
      {/* Header del Tutor */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(99, 102, 241, 0.4)'
          }}>
            <Bot size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              Copilota Didattico AI
              <Sparkles size={14} color="#f59e0b" fill="#f59e0b" />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Tutor Personalizzato per {materiaNomenclatura}</div>
          </div>
        </div>
        <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--elite-primary)', padding: '3px 9px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold' }}>
          ATTIVO
        </div>
      </div>

      {/* Finestra Chat */}
      <div style={{
        maxHeight: '380px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        paddingRight: '0.5rem',
        scrollbarWidth: 'thin',
      }}>
        <AnimatePresence initial={false}>
          {chatHistory.map((msg) => {
            const isTutor = msg.sender === 'tutor';
            
            // Stile differenziato per tipi di spiegazioni
            let bubbleBg = isTutor ? 'rgba(30, 41, 59, 0.8)' : 'rgba(99, 102, 241, 0.15)';
            let bubbleBorder = isTutor ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(99, 102, 241, 0.3)';
            
            if (isTutor) {
              if (msg.type === 'example') {
                bubbleBg = 'rgba(16, 185, 129, 0.06)';
                bubbleBorder = '1px solid rgba(16, 185, 129, 0.2)';
              } else if (msg.type === 'law') {
                bubbleBg = 'rgba(56, 189, 248, 0.06)';
                bubbleBorder = '1px solid rgba(56, 189, 248, 0.2)';
              } else if (msg.type === 'mnemonic') {
                bubbleBg = 'rgba(245, 158, 11, 0.06)';
                bubbleBorder = '1px solid rgba(245, 158, 11, 0.2)';
              }
            }

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25 }}
                style={{
                  display: 'flex',
                  justifyContent: isTutor ? 'flex-start' : 'flex-end',
                  gap: '0.75rem',
                  alignItems: 'flex-start',
                  maxWidth: '90%',
                  alignSelf: isTutor ? 'flex-start' : 'flex-end',
                }}
              >
                {isTutor && (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '2px',
                    flexShrink: 0,
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <Bot size={15} color="#cbd5e1" />
                  </div>
                )}
                
                <div style={{
                  background: bubbleBg,
                  border: bubbleBorder,
                  borderRadius: isTutor ? '0px 16px 16px 16px' : '16px 0px 16px 16px',
                  padding: '0.85rem 1.1rem',
                  color: isTutor ? '#cbd5e1' : '#f8fafc',
                  fontSize: '0.92rem',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  {msg.text}
                </div>

                {!isTutor && (
                  <div style={{
                    background: 'rgba(99, 102, 241, 0.2)',
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '2px',
                    flexShrink: 0,
                    border: '1px solid rgba(99, 102, 241, 0.4)'
                  }}>
                    <User size={15} color="var(--elite-primary)" />
                  </div>
                )}
              </motion.div>
            );
          })}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', alignSelf: 'flex-start' }}
            >
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <Bot size={15} color="#cbd5e1" />
              </div>
              <div style={{
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '0px 16px 16px 16px',
                padding: '0.75rem 1.1rem',
                display: 'flex',
                gap: '0.35rem',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 'bold', marginRight: '0.25rem' }}>Tutor sta scrivendo</span>
                <span style={{ display: 'inline-block', width: '6px', height: '6px', background: '#94a3b8', borderRadius: '50%', animation: 'pulse 1.2s infinite' }}></span>
                <span style={{ display: 'inline-block', width: '6px', height: '6px', background: '#94a3b8', borderRadius: '50%', animation: 'pulse 1.2s infinite 0.2s' }}></span>
                <span style={{ display: 'inline-block', width: '6px', height: '6px', background: '#94a3b8', borderRadius: '50%', animation: 'pulse 1.2s infinite 0.4s' }}></span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Pulsanti di Approfondimento (Quick Prompts) */}
      {visiblePrompts.length > 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          paddingTop: '1rem',
        }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
            <Send size={12} /> CHIEDI ALL'AI TUTOR:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {visiblePrompts.includes('example') && (
              <button
                onClick={() => handlePromptClick('example')}
                style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  color: '#a7f3d0',
                  padding: '0.6rem 1.1rem',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'rgba(16, 185, 129, 0.08)';
                }}
              >
                <BookOpen size={14} />
                📖 Esempio Pratico
              </button>
            )}

            {visiblePrompts.includes('law') && (
              <button
                onClick={() => handlePromptClick('law')}
                style={{
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  color: '#bae6fd',
                  padding: '0.6rem 1.1rem',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'rgba(56, 189, 248, 0.08)';
                }}
              >
                <Landmark size={14} />
                ⚖️ Riferimento Legge
              </button>
            )}

            {visiblePrompts.includes('mnemonic') && (
              <button
                onClick={() => handlePromptClick('mnemonic')}
                style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  color: '#fde68a',
                  padding: '0.6rem 1.1rem',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.background = 'rgba(245, 158, 11, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'rgba(245, 158, 11, 0.08)';
                }}
              >
                <Lightbulb size={14} />
                💡 Trucco Mnemonico
              </button>
            )}
          </div>
        </div>
      )}

      {/* Stili CSS di supporto per l'animazione di digitazione */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.3); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
