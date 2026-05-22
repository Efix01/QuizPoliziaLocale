import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePL } from '../context/PLContext';
import { useQuizPL } from '../hooks/useQuizPL';
import { 
  MapPin, Search, BookOpen, Clock, ArrowRight, ShieldCheck, 
  Timer, ExternalLink, Lock, LogIn, User, Sparkles, AlertCircle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../components/Footer';
import { CONCORSI_ATTIVI, type ConcorsoAttivo } from '../data/concorsi_attivi';

const ConcorsiMonitor: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cambiaRegione, cambiaComune, isLoading } = usePL();
  const { generaQuizCategoria } = useQuizPL();

  // Stati per filtri
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegione, setSelectedRegione] = useState('tutte');

  // Stato per caricamento transizione concorso
  const [transitioningId, setTransitioningId] = useState<string | null>(null);

  // Stato per il modal di conversione ospiti
  const [showConversionModal, setShowConversionModal] = useState(false);
  const [selectedConcorsoForModal, setSelectedConcorsoForModal] = useState<ConcorsoAttivo | null>(null);

  // Lista delle regioni uniche per il dropdown
  const regioniDisponibili = useMemo(() => {
    const reg = new Set<string>();
    CONCORSI_ATTIVI.forEach(c => reg.add(c.regione));
    return ['tutte', ...Array.from(reg)];
  }, []);

  // Filtra i concorsi in base alla ricerca e alla regione
  const concorsiFiltrati = useMemo(() => {
    return CONCORSI_ATTIVI.filter(c => {
      const matchSearch = c.citta.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.titoloBando.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.materie.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchRegione = selectedRegione === 'tutte' || c.regione === selectedRegione;
      return matchSearch && matchRegione;
    });
  }, [searchQuery, selectedRegione]);

  // Gestione delle azioni (avvio simulazione o quiz consigliato)
  const handleAzioneConcorso = async (concorso: ConcorsoAttivo, tipo: 'simulazione' | 'quiz', categoriaId?: string) => {
    if (!user) {
      setSelectedConcorsoForModal(concorso);
      setShowConversionModal(true);
      return;
    }

    try {
      setTransitioningId(`${concorso.id}-${tipo}-${categoriaId || ''}`);

      // Configura il profilo dell'utente loggato per questo concorso
      await cambiaRegione(concorso.regioneId, concorso.regione);
      await cambiaComune(concorso.comuneId, concorso.citta);

      if (tipo === 'simulazione') {
        // Naviga verso la sessione di simulazione
        navigate('/simulation');
      } else if (tipo === 'quiz' && categoriaId) {
        // Genera il quiz consigliato
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
      console.error('Errore durante la transizione del concorso:', error);
      alert('Si è verificato un errore durante la preparazione della sessione.');
    } finally {
      setTransitioningId(null);
    }
  };

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay },
  });

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#f8fafc', fontFamily: '"Outfit", "Inter", sans-serif', display: 'flex', flexDirection: 'column' }}>
      
      {/* ── NAVBAR FLUIDA ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)', padding: '0.75rem 1.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div 
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <img src="/logo_quiz_pol_locale.png" alt="Quiz Polizia Locale" style={{ height: '40px', objectFit: 'contain' }} />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {user ? (
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                background: 'linear-gradient(135deg, var(--elite-primary) 0%, var(--elite-accent) 100%)',
                color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px',
                cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
              }}
            >
              <User size={16} />
              La mia Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                style={{
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
                  color: '#cbd5e1', padding: '0.5rem 1rem', borderRadius: '8px',
                  cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem'
                }}
              >
                <LogIn size={16} />
                Accedi
              </button>
              <button
                onClick={() => navigate('/register')}
                style={{
                  background: '#3b82f6', color: '#fff', border: 'none',
                  padding: '0.5rem 1.1rem', borderRadius: '8px',
                  cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
              >
                Registrati
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ── HEADER PRINCIPALE (SEO HERO) ── */}
      <header style={{ padding: '4rem 1.5rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '500px', height: '300px', background: 'radial-gradient(ellipse, rgba(99,102,241,0.06) 0%, transparent 70%)', pointerEvents: 'none', borderRadius: '50%' }} />
        
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
          <motion.div {...fadeUp(0)}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '100px', padding: '0.4rem 1rem', marginBottom: '1.5rem' }}>
              <ShieldCheck size={14} color="#818cf8" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Bandi Polizia Locale</span>
            </div>
          </motion.div>

          <motion.h1 {...fadeUp(0.1)} style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#fff', marginBottom: '1.25rem' }}>
            Monitor Concorsi Attivi<br />
            <span style={{ background: 'linear-gradient(135deg, #60a5fa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Polizia Locale per Città
            </span>
          </motion.h1>

          <motion.p {...fadeUp(0.2)} style={{ fontSize: 'clamp(0.95rem, 1.8vw, 1.15rem)', color: '#94a3b8', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto 2.5rem' }}>
            Resta sempre aggiornato sui bandi attivi nei comandi di tutta Italia. Scopri le materie d'esame richieste e inizia ad esercitarti con quiz e simulazioni specifiche.
          </motion.p>
        </div>
      </header>

      {/* ── SEZIONE FILTRI E CONTENUTI ── */}
      <main style={{ flex: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '0 1.5rem 6rem' }}>
        
        {/* Barra dei Filtri */}
        <motion.div 
          {...fadeUp(0.25)}
          style={{
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '1.25rem',
            marginBottom: '3rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            backdropFilter: 'blur(8px)'
          }}
        >
          {/* Cerca per Città */}
          <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <Search size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Cerca città, materie o parole chiave..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', background: '#090d16', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px', padding: '0.75rem 1rem 0.75rem 2.8rem',
                color: '#fff', fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#3b82f6'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>

          {/* Filtro per Regione */}
          <div style={{ minWidth: '200px' }}>
            <select
              value={selectedRegione}
              onChange={e => setSelectedRegione(e.target.value)}
              style={{
                width: '100%', background: '#090d16', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px', padding: '0.75rem 1rem',
                color: '#fff', fontSize: '0.95rem', outline: 'none', cursor: 'pointer'
              }}
            >
              <option value="tutte">Tutte le Regioni</option>
              {regioniDisponibili.filter(r => r !== 'tutte').map(reg => (
                <option key={reg} value={reg}>{reg}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Elenco Concorsi */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          {concorsiFiltrati.length > 0 ? (
            concorsiFiltrati.map((concorso, index) => {
              const isSelectedTransitioning = transitioningId?.startsWith(concorso.id);
              
              return (
                <motion.article
                  key={concorso.id}
                  {...fadeUp(0.1 + index * 0.05)}
                  className="glass-card"
                  style={{
                    background: 'rgba(30, 41, 59, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '24px',
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Glowing header border on hover */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #3b82f6, #6366f1)', opacity: 0 }} />

                  {/* Header Card */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#818cf8', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                        <MapPin size={14} />
                        <span>{concorso.citta} ({concorso.regione})</span>
                      </div>
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0, lineHeight: '1.3' }}>
                        {concorso.titoloBando}
                      </h2>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.35rem 0.75rem', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 700 }}>
                        {concorso.posti} POSTI
                      </span>
                      <span style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.35rem 0.75rem', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 700 }}>
                        Scadenza: {concorso.scadenza}
                      </span>
                    </div>
                  </div>

                  {/* Materie Richieste */}
                  <div>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
                      Materie Richieste nel Bando:
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {concorso.materie.map((materia, idx) => (
                        <span 
                          key={idx}
                          style={{
                            background: '#0f172a',
                            border: '1px solid rgba(255,255,255,0.06)',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            color: '#cbd5e1'
                          }}
                        >
                          {materia}
                        </span>
                      ))}
                    </div>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.08)', margin: '0.5rem 0' }} />

                  {/* Sezione Esercitazione e Preparazione */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    
                    {/* Quiz Consigliati */}
                    <div style={{ background: '#090d16', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BookOpen size={18} color="#3b82f6" />
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>Quiz Consigliati</h4>
                      </div>
                      <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0 }}>
                        Esercitati in modo mirato sugli argomenti centrali del bando.
                      </p>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto' }}>
                        {concorso.quizConsigliati.map((quiz, qIdx) => (
                          <button
                            key={qIdx}
                            onClick={() => handleAzioneConcorso(concorso, 'quiz', quiz.categoriaId)}
                            disabled={isLoading || isSelectedTransitioning}
                            style={{
                              background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.08)',
                              borderRadius: '10px', padding: '0.6rem 0.85rem', color: '#cbd5e1',
                              fontSize: '0.85rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                              alignItems: 'center', transition: 'all 0.2s', textAlign: 'left'
                            }}
                            onMouseOver={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#fff'; }}
                            onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.color = '#cbd5e1'; }}
                          >
                            <span style={{ fontWeight: '600' }}>{quiz.nome}</span>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              {quiz.domandeCount} domande <ArrowRight size={12} />
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Simulazione Dedicata */}
                    <div style={{ background: '#090d16', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Timer size={18} color="#f59e0b" />
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>Simulazione Dedicata</h4>
                      </div>
                      <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0 }}>
                        Simula la prova d'esame ufficiale con i parametri esatti di durata e penalizzazione.
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.5rem 0' }}>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <BookOpen size={12} /> {concorso.simulazione.domandeCount} quesiti
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock size={12} /> {concorso.simulazione.durataMinuti} min
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAzioneConcorso(concorso, 'simulazione')}
                        disabled={isLoading || isSelectedTransitioning}
                        style={{
                          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
                          color: '#fff', border: '1px solid rgba(59,130,246,0.3)',
                          borderRadius: '10px', padding: '0.75rem', fontSize: '0.88rem',
                          fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s', marginTop: 'auto'
                        }}
                        onMouseOver={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)'; }}
                      >
                        {transitioningId?.startsWith(`${concorso.id}-simulazione`) ? (
                          <div style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        ) : (
                          <>
                            <Timer size={16} />
                            Avvia Simulazione Dedicata
                          </>
                        )}
                      </button>
                    </div>

                  </div>

                  {/* Link al Bando Ufficiale */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <a 
                      href={concorso.linkUfficiale} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                        color: '#64748b', fontSize: '0.8rem', textDecoration: 'none',
                        transition: 'color 0.2s'
                      }}
                      onMouseOver={e => e.currentTarget.style.color = '#cbd5e1'}
                      onMouseOut={e => e.currentTarget.style.color = '#64748b'}
                    >
                      Bando Ufficiale del Comune <ExternalLink size={12} />
                    </a>
                  </div>
                </motion.article>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(30, 41, 59, 0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px' }}>
              <AlertCircle size={40} color="#64748b" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem' }}>Nessun concorso trovato</h3>
              <p style={{ color: '#64748b', margin: 0 }}>Prova a modificare il testo di ricerca o seleziona un'altra regione.</p>
            </div>
          )}
        </div>

      </main>

      {/* ── MODAL DI CONVERSIONE PER OSPITI ── */}
      <AnimatePresence>
        {showConversionModal && selectedConcorsoForModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{
                maxWidth: '520px', width: '100%',
                background: 'rgba(30, 41, 59, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                padding: '2.5rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                position: 'relative'
              }}
            >
              <button 
                onClick={() => { setShowConversionModal(false); setSelectedConcorsoForModal(null); }}
                style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>

              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'inline-flex', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', padding: '0.75rem', borderRadius: '16px', color: '#3b82f6', marginBottom: '1.25rem' }}>
                  <Sparkles size={28} />
                </div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', margin: '0 0 0.5rem', lineHeight: '1.2' }}>
                  Sblocca la Preparazione Elite
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.92rem', margin: 0 }}>
                  Per avviare la preparazione per il concorso di <strong>{selectedConcorsoForModal.citta}</strong> devi registrare un account gratuito.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#090d16', border: '1px solid rgba(255,255,255,0.05)', padding: '1.25rem', borderRadius: '16px', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <ShieldCheck size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                  <span style={{ fontSize: '0.88rem', color: '#cbd5e1' }}><strong>+10.000 quiz ufficiali</strong> aggiornati alle normative vigenti.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <Timer size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                  <span style={{ fontSize: '0.88rem', color: '#cbd5e1' }}><strong>AI Tutor personalizzato</strong> per spiegare ogni errore commesso.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <Lock size={18} color="#818cf8" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                  <span style={{ fontSize: '0.88rem', color: '#cbd5e1' }}><strong>Statistiche e andamento settimanale</strong> per colmare le tue lacune.</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  onClick={() => {
                    setShowConversionModal(false);
                    setSelectedConcorsoForModal(null);
                    navigate('/register');
                  }}
                  style={{
                    background: '#3b82f6', color: '#fff', border: 'none',
                    padding: '1rem', borderRadius: '12px', fontSize: '1rem',
                    fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '0.5rem', boxShadow: '0 8px 20px rgba(59,130,246,0.3)'
                  }}
                >
                  Registrati Gratis
                  <ArrowRight size={18} />
                </button>
                
                <button
                  onClick={() => {
                    setShowConversionModal(false);
                    setSelectedConcorsoForModal(null);
                    navigate('/login');
                  }}
                  style={{
                    background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
                    color: '#cbd5e1', padding: '1rem', borderRadius: '12px', fontSize: '0.95rem',
                    fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '0.5rem'
                  }}
                >
                  Ho già un account, Accedi
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
};

export default ConcorsiMonitor;
