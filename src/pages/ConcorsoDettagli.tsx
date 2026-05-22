import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePL } from '../context/PLContext';
import { useQuizPL } from '../hooks/useQuizPL';
import { CONCORSI_ATTIVI } from '../data/concorsi_attivi';
import { 
  MapPin, ArrowRight, ShieldCheck, Timer, BookOpen, ExternalLink, 
  ChevronLeft, FileText, CheckCircle, HelpCircle, ChevronDown, ChevronUp, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../components/Footer';

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div style={{ background: '#131c2e', border: '1px solid #233554', borderRadius: '16px', overflow: 'hidden', marginBottom: '1rem' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ width: '100%', padding: '1.25rem', background: 'transparent', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'left', color: '#fff' }}
      >
        <span style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <HelpCircle size={18} color="#3b82f6" />
          {question}
        </span>
        {isOpen ? <ChevronUp size={18} color="#94a3b8" /> : <ChevronDown size={18} color="#94a3b8" />}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{ padding: '0 1.25rem 1.25rem', color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.5, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function ConcorsoDettagli() {
  const { cittaId } = useParams<{ cittaId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cambiaRegione, cambiaComune, isLoading } = usePL();
  const { generaQuizCategoria } = useQuizPL();

  const [transitioningType, setTransitioningType] = useState<string | null>(null);
  const [showConversionModal, setShowConversionModal] = useState(false);

  // Trova il concorso corrispondente
  const concorso = useMemo(() => {
    return CONCORSI_ATTIVI.find(c => c.id === cittaId || c.comuneId === cittaId);
  }, [cittaId]);

  // Gestione SEO & JSON-LD
  useEffect(() => {
    if (!concorso) return;

    const prevTitle = document.title;
    document.title = `Concorso Polizia Locale ${concorso.citta} 2026 - Quiz e Bando Ufficiale`;

    let metaDesc = document.querySelector('meta[name="description"]');
    const originalDesc = metaDesc ? metaDesc.getAttribute('content') : '';
    const newDesc = `Preparati al Concorso Polizia Locale di ${concorso.citta} per ${concorso.posti} posti. Quiz ministeriali consigliati, simulazione d'esame ufficiale e FAQ aggiornate sul bando.`;
    
    if (metaDesc) {
      metaDesc.setAttribute('content', newDesc);
    } else {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      metaDesc.setAttribute('content', newDesc);
      document.head.appendChild(metaDesc);
    }

    // Iniezione structured data FAQ JSON-LD per Google SEO
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'json-ld-faq';
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": `Quando scade il bando di concorso Polizia Locale per il Comune di ${concorso.citta}?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `Il termine ultimo per presentare la domanda di partecipazione al concorso per il Comune di ${concorso.citta} è fissato al ${concorso.scadenza}.`
          }
        },
        {
          "@type": "Question",
          "name": `Quali sono le materie d'esame per il concorso Polizia Locale di ${concorso.citta}?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `Le materie su cui verte il bando includono: ${concorso.materie.join(', ')}.`
          }
        },
        {
          "@type": "Question",
          "name": `Quanti posti sono previsti per il bando Polizia Locale di ${concorso.citta}?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `Il concorso mette a bando un totale di ${concorso.posti} posti per il ruolo di Istruttore di Polizia Locale.`
          }
        }
      ]
    };
    script.innerHTML = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      document.title = prevTitle;
      if (metaDesc) {
        if (originalDesc) metaDesc.setAttribute('content', originalDesc);
        else metaDesc.remove();
      }
      const existingScript = document.getElementById('json-ld-faq');
      if (existingScript) existingScript.remove();
    };
  }, [concorso]);

  if (!concorso) {
    return (
      <div style={{ minHeight: '100vh', background: '#020617', color: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Bando non trovato</h2>
        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Il bando specificato potrebbe essere scaduto o rimosso.</p>
        <button 
          onClick={() => navigate('/concorsi')}
          style={{ background: '#3b82f6', color: 'white', padding: '1rem 2rem', borderRadius: '12px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
        >
          Torna ai Concorsi
        </button>
      </div>
    );
  }

  const handleAzioneConcorso = async (tipo: 'simulazione' | 'quiz', categoriaId?: string) => {
    if (!user) {
      setShowConversionModal(true);
      return;
    }

    try {
      setTransitioningType(`${tipo}-${categoriaId || ''}`);
      await cambiaRegione(concorso.regioneId, concorso.regione);
      await cambiaComune(concorso.comuneId, concorso.citta);

      if (tipo === 'simulazione') {
        navigate('/simulation');
      } else if (tipo === 'quiz' && categoriaId) {
        const domande = generaQuizCategoria(categoriaId, 20);
        navigate('/study', { 
          state: { 
            domande, 
            mode: 'categoria', 
            categoriaId 
          } 
        });
      }
    } catch (error) {
      console.error('Errore transizione concorso:', error);
      alert('Si è verificato un errore durante la preparazione della sessione.');
    } finally {
      setTransitioningType(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#090d16', color: '#f8fafc', fontFamily: '"Outfit", "Inter", sans-serif', display: 'flex', flexDirection: 'column' }}>
      
      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(9, 13, 22, 0.85)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)', padding: '0.75rem 1.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div onClick={() => navigate('/concorsi')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ChevronLeft size={20} color="#94a3b8" />
          <span style={{ fontWeight: 600, color: '#94a3b8', fontSize: '0.9rem' }}>Vedi tutti i concorsi</span>
        </div>
        <img src="/logo_quiz_pol_locale.png" alt="Logo" style={{ height: '35px', objectFit: 'contain' }} />
      </nav>

      {/* ── HERO BANNER DEDICATO ── */}
      <header style={{ padding: '3.5rem 1.5rem 2.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(180deg, #131c2e 0%, #090d16 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem' }}>
            <MapPin size={16} />
            <span>{concorso.citta} ({concorso.regione})</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 900, lineHeight: 1.2, letterSpacing: '-0.025em', color: '#fff', marginBottom: '1rem' }}>
            {concorso.titoloBando}
          </h1>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.4rem 1rem', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 700 }}>
              {concorso.posti} POSTI D'ORGANICO
            </span>
            <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.4rem 1rem', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 700 }}>
              SCADENZA BANDO: {concorso.scadenza}
            </span>
          </div>

          <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '750px', margin: 0 }}>
            Benvenuto nella pagina di preparazione ufficiale del comando di <strong>{concorso.citta}</strong>. Di seguito trovi i dettagli normativi del bando, i requisiti di partecipazione richiesti e gli strumenti mirati per superare le prove.
          </p>
        </div>
      </header>

      {/* ── CONTENUTO CORPO PAGINA ── */}
      <main style={{ flex: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
          
          {/* Colonna Sinistra: Informazioni Bando */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* Requisiti di Partecipazione */}
            <section style={{ background: 'rgba(30, 41, 59, 0.25)', border: '1px solid #233554', borderRadius: '24px', padding: '2rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', margin: '0 0 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={22} color="#10b981" />
                Requisiti di Partecipazione
              </h2>
              <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  'Cittadinanza italiana e godimento dei diritti civili e politici.',
                  'Età compresa tra i 18 e i 35 anni (salvo deroghe locali indicate nel bando).',
                  'Diploma di scuola secondaria di secondo grado (maturità).',
                  'Patente di guida di Categoria B ed idoneità alla guida di veicoli di servizio.',
                  'Patente A2 o A senza limiti (spesso richiesta per la guida di motoveicoli di servizio).',
                  'Assenza di condanne penali e procedimenti penali in corso.'
                ].map((req, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                    <CheckCircle size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Fasi delle Prove */}
            <section style={{ background: 'rgba(30, 41, 59, 0.25)', border: '1px solid #233554', borderRadius: '24px', padding: '2rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', margin: '0 0 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={22} color="#3b82f6" />
                Fasi d'Esame Previste
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  { fase: '1. Prova Preselettiva (Quiz)', desc: 'Test a risposta multipla su materie d\'esame, logica deduttiva e cultura generale. Superano la fase solo i candidati con i punteggi migliori.' },
                  { fase: '2. Prova Scritta', desc: 'Quesiti a risposta sintetica o aperta oppure redazione di un verbale di accertamento violazioni del Codice della Strada.' },
                  { fase: '3. Prova d\'Efficienza Fisica (Atletica)', desc: 'Corsa di 1000m, salto in alto e piegamenti sulle braccia per accertare le capacità fisiche minime di servizio.' },
                  { fase: '4. Prova Orale', desc: 'Colloquio orale sulle materie d\'esame, nozioni di informatica e accertamento della lingua inglese.' }
                ].map((p, idx) => (
                  <div key={idx} style={{ borderLeft: '2.5px solid #233554', paddingLeft: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.98rem', fontWeight: 800, color: '#fff' }}>{p.fase}</h4>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.4 }}>{p.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Colonna Destra: Preparazione & CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Simulazione Esame */}
            <div style={{ background: 'linear-gradient(135deg, #131c2e 0%, #0f172a 100%)', border: '1px solid #233554', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Timer size={22} color="#f59e0b" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>Simulazione Esame Dedicata</h3>
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                Accedi alla simulazione personalizzata con i parametri reali configurati per il concorso del Comune di {concorso.citta}:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#090d16', padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>DOMANDE:</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>{concorso.simulazione.domandeCount} quesiti</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>TEMPO MAX:</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>{concorso.simulazione.durataMinuti} min</div>
                </div>
              </div>

              <button
                onClick={() => handleAzioneConcorso('simulazione')}
                disabled={isLoading || transitioningType !== null}
                style={{
                  width: '100%', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: '#fff', border: 'none', borderRadius: '14px', padding: '1rem',
                  fontSize: '1rem', fontWeight: 700, cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  boxShadow: '0 8px 20px rgba(59, 130, 246, 0.25)', transition: 'all 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {transitioningType?.startsWith('simulazione') ? (
                  <div style={{ width: '20px', height: '20px', border: '2px solid #fff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                ) : (
                  <>
                    <Timer size={18} />
                    Avvia Simulazione d'Esame
                  </>
                )}
              </button>
            </div>

            {/* Allenamento Materie Consigliate */}
            <div style={{ background: '#131c2e', border: '1px solid #233554', borderRadius: '24px', padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <BookOpen size={22} color="#3b82f6" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>Quiz Consigliati</h3>
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                Concentrati sulle materie più importanti del bando di {concorso.citta}:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {concorso.quizConsigliati.map((quiz, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAzioneConcorso('quiz', quiz.categoriaId)}
                    disabled={isLoading || transitioningType !== null}
                    style={{
                      background: '#090d16', border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '12px', padding: '0.75rem 1rem', color: '#cbd5e1',
                      fontSize: '0.9rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', transition: 'all 0.2s', textAlign: 'left'
                    }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#fff'; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = '#cbd5e1'; }}
                  >
                    <span style={{ fontWeight: '700' }}>{quiz.nome}</span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      20 Domande <ArrowRight size={14} />
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Link Bando Esterno */}
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <a 
                href={concorso.linkUfficiale} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.88rem', textDecoration: 'none', fontWeight: 600 }}
              >
                Consulta il Bando Ufficiale su Portale InPA o Ente <ExternalLink size={14} />
              </a>
            </div>

          </div>
        </div>

        {/* ── SEZIONE FAQ DEDICATA SEO ── */}
        <section style={{ marginTop: '5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', margin: '0 0 2rem', textAlign: 'center', letterSpacing: '-0.02em' }}>
            Domande Frequenti (FAQ) sul Concorso di {concorso.citta}
          </h2>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <FAQItem 
              question={`Quando scade il bando per il concorso Polizia Locale di ${concorso.citta}?`}
              answer={`La scadenza ultima per l'invio delle domande di partecipazione è il ${concorso.scadenza}. L'iscrizione deve essere inviata telematicamente tramite il portale InPA o seguendo le indicazioni presenti sul sito ufficiale dell'ente.`}
            />
            <FAQItem 
              question="Quali patenti sono obbligatorie per essere assunti in Polizia Locale?"
              answer="È sempre richiesta la patente B in corso di validità. Molti comandi, tra cui quello di Milano, Roma e Torino, richiedono anche il possesso della patente di guida di Categoria A2 o A illimitata per poter guidare i motocicli di servizio in dotazione al Corpo."
            />
            <FAQItem 
              question="Cosa succede se vengo promosso nelle prove preselettive?"
              answer="I candidati inseriti in graduatoria utile accedono alla prova scritta. Il punteggio della preselezione di solito non concorre alla formazione della graduatoria finale di merito, ma serve solo come sbarramento per ridurre il numero dei partecipanti."
            />
            <FAQItem 
              question="Come ci si deve preparare per la prova di efficienza fisica (atletica)?"
              answer="La prova comprende solitamente prove di corsa campestre o su pista (1000m da completare entro un tempo massimo di circa 4-5 minuti, differenziato tra uomini e donne), salto in alto e piegamenti. Si consiglia un allenamento costante nei mesi precedenti."
            />
            <FAQItem 
              question={`Quali sono le materie regionali specifiche specifiche richieste per ${concorso.citta}?`}
              answer={`Per il concorso a ${concorso.citta} (${concorso.regione}), il bando richiede lo studio delle leggi regionali in materia di Polizia Locale e Sicurezza Urbana della Regione ${concorso.regione}. Nel nostro simulatore avrai a disposizione i quiz aggiornati anche su questa sezione.`}
            />
          </div>
        </section>

      </main>

      {/* ── MODAL CONVERSIONE OSPITI ── */}
      <AnimatePresence>
        {showConversionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{
                maxWidth: '500px', width: '100%',
                background: 'rgba(19, 28, 46, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '24px', padding: '2.5rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                position: 'relative'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'inline-flex', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', padding: '0.75rem', borderRadius: '16px', color: '#3b82f6', marginBottom: '1.25rem' }}>
                  <Sparkles size={28} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', margin: '0 0 0.5rem' }}>
                  Sblocca la Preparazione
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.92rem', margin: 0 }}>
                  Registra un account gratuito per salvare i tuoi progressi, sbloccare simulazioni illimitate e allenarti per il concorso di <strong>{concorso.citta}</strong>.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#090d16', border: '1px solid rgba(255,255,255,0.05)', padding: '1.25rem', borderRadius: '16px', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.88rem', color: '#cbd5e1' }}>
                  <CheckCircle size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                  <span>Accesso a <strong>+10.000 quiz ufficiali</strong>.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.88rem', color: '#cbd5e1' }}>
                  <CheckCircle size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                  <span><strong>AI Tutor</strong> per risposte spiegate passo-passo.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.88rem', color: '#cbd5e1' }}>
                  <CheckCircle size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                  <span>Statistiche avanzate ed <strong>errore intelligente (SRS)</strong>.</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  onClick={() => {
                    setShowConversionModal(false);
                    navigate('/register');
                  }}
                  style={{
                    background: '#3b82f6', color: '#fff', border: 'none',
                    padding: '1rem', borderRadius: '12px', fontSize: '1rem',
                    fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '0.5rem', boxShadow: '0 8px 20px rgba(59,130,246,0.3)',
                    transition: 'all 0.2s'
                  }}
                >
                  Registrati Gratis
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => {
                    setShowConversionModal(false);
                    navigate('/login');
                  }}
                  style={{
                    background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
                    color: '#cbd5e1', padding: '1rem', borderRadius: '12px', fontSize: '0.95rem',
                    fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '0.5rem'
                  }}
                >
                  Accedi al tuo Profilo
                </button>
                <button
                  onClick={() => setShowConversionModal(false)}
                  style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem', marginTop: '0.5rem' }}
                >
                  Annulla
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <Footer />
    </div>
  );
}
