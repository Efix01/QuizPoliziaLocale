import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  TrendingUp,
  Timer,
  ArrowRight,
  Menu,
  X,
  Zap,
  CheckCircle,
  Bot,
  AlertTriangle,
  BrainCircuit,
  Award,
  Flame,
  Scale,
  Play,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../components/Footer';

// Varianti di animazione per scorrimento e fade-in
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay, ease: 'easeOut' as const },
});

const DEMO_QUESTION = {
  testo: "Ai sensi dell'art. 193 del Codice della Strada, chiunque circola con un veicolo senza la copertura dell'assicurazione obbligatoria per la responsabilità civile verso terzi è soggetto alla sanzione amministrativa del pagamento di una somma:",
  opzioni: [
    "Da € 168 a € 674 ed è sempre disposta la confisca immediata del veicolo",
    "Da € 866 a € 3.464 e al sequestro amministrativo del veicolo ai fini della confisca",
    "Da € 42 ed è prevista la sola decurtazione di 5 punti sulla patente di guida",
    "Da € 500 a € 2.000, fermo restando il fermo amministrativo per 30 giorni"
  ],
  rispostaCorretta: 1, // Seconda opzione (0-indexed)
  spiegazione: "L'art. 193, comma 2, del Codice della Strada (D.Lgs. 285/1992) stabilisce che chiunque circola senza la copertura assicurativa R.C.Auto è soggetto alla sanzione amministrativa del pagamento di una somma da euro 866 a euro 3.464, oltre alla sanzione accessoria del sequestro del veicolo ai fini della confisca.",
  normativa: "Art. 193 CdS — Obbligo dell'assicurazione di responsabilità civile"
};

export default function Landing() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Stati per il Demo Quiz
  const [selectedDemoOption, setSelectedDemoOption] = useState<number | null>(null);
  const [isDemoChecked, setIsDemoChecked] = useState(false);
  const [showXpAnim, setShowXpAnim] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDemoOptionSelect = (idx: number) => {
    if (isDemoChecked) return;
    setSelectedDemoOption(idx);
  };

  const handleDemoCheck = () => {
    if (selectedDemoOption === null || isDemoChecked) return;
    setIsDemoChecked(true);
    if (selectedDemoOption === DEMO_QUESTION.rispostaCorretta) {
      setShowXpAnim(true);
    }
  };

  const handleDemoReset = () => {
    setSelectedDemoOption(null);
    setIsDemoChecked(false);
    setShowXpAnim(false);
  };

  const scrollToDemo = () => {
    const el = document.getElementById('demo-quiz-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    {
      icon: Timer,
      iconBg: 'rgba(59,130,246,0.12)',
      iconColor: '#3b82f6',
      title: 'Simulazioni Concorsuali Reali',
      description: 'Navigazione a griglia delle domande, timer mono-spazio e penalità di -0.25 punti per risposte errate identici ai concorsi ufficiali.',
    },
    {
      icon: Bot,
      iconBg: 'rgba(168,85,247,0.12)',
      iconColor: '#a855f7',
      title: 'Copilota Didattico AI',
      description: 'Chiarimenti immediati in-app sulle domande errate. Analizza gli articoli di legge con un tutor virtuale specializzato.',
    },
    {
      icon: AlertTriangle,
      iconBg: 'rgba(239,68,68,0.12)',
      iconColor: '#ef4444',
      title: 'Ripasso Errori Intelligente',
      description: 'Algoritmo Spaced Repetition (SRS) che raccoglie i tuoi fallimenti in tre livelli critici per risolverli definitivamente.',
    },
    {
      icon: TrendingUp,
      iconBg: 'rgba(16,185,129,0.12)',
      iconColor: '#10b981',
      title: 'Statistiche e Stima Esame',
      description: 'Heatmap per categorie di legge e stima in tempo reale della tua probabilità di superare le prove reali in base ai trend storici.',
    },
    {
      icon: BrainCircuit,
      iconBg: 'rgba(245,158,11,0.12)',
      iconColor: '#f59e0b',
      title: 'Database Adattivo',
      description: 'Oltre 10.000 domande strutturate per concorsi regionali e comunali. I quiz si adattano live al tuo livello di studio.',
    },
    {
      icon: Zap,
      iconBg: 'rgba(236,72,153,0.12)',
      iconColor: '#ec4899',
      title: 'Mobile-First UX ad Una Mano',
      description: 'Ottimizzato per essere comodo su smartphone. Avvia mini-sessioni da 5 minuti in mobilità e non perdere mai la tua streak.',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Seleziona Bando',
      description: 'Configura la tua Regione e Comune per caricare le leggi locali associate al bando ufficiale.',
    },
    {
      number: '02',
      title: 'Esegui i Quiz',
      description: 'Allenati con le modalità pratica, studio anti-ansia o affronta simulazioni d\'esame temporizzate.',
    },
    {
      number: '03',
      title: 'Allena i Punti Deboli',
      description: 'Colma le lacune con il tutor AI e la dashboard degli errori prima della prova reale.',
    },
    {
      number: '04',
      title: 'Supera il Concorso',
      description: 'Raggiungi una probabilità di superamento stimata dell\'85% ed indossa la tua divisa.',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#090d16', color: '#f8fafc', display: 'flex', flexDirection: 'column', fontFamily: '"Outfit", "Inter", sans-serif', overflowX: 'hidden' }}>
      
      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '1rem 1.5rem',
        background: scrolled ? 'rgba(9,13,22,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : 'none',
        transition: 'all 0.4s ease',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Logo */}
          <div
            style={{ cursor: 'pointer', transition: 'opacity 0.2s, transform 0.2s', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            onMouseOver={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'scale(1.02)'; }}
            onMouseOut={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <img src="/logo_quiz_pol_locale.png" alt="Quiz Polizia Locale" style={{ height: '44px', objectFit: 'contain', display: 'block' }} />
            <div>
              <span style={{ fontSize: '1rem', fontWeight: '800', background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'block' }}>
                ELITE POLIZIA
              </span>
              <span style={{ display: 'block', fontSize: '0.6rem', color: '#6366f1', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase' }}>
                Academy
              </span>
            </div>
          </div>

          {/* Desktop buttons */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }} className="desktop-nav">
            <button
              onClick={() => navigate('/concorsi')}
              style={{ padding: '0.6rem 1rem', background: 'transparent', border: 'none', color: '#cbd5e1', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.color = '#fff'; }}
              onMouseOut={e => { e.currentTarget.style.color = '#cbd5e1'; }}
            >
              Monitor Concorsi
            </button>
            <button
              onClick={() => navigate('/login')}
              style={{ padding: '0.6rem 1.4rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#cbd5e1', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.color = '#fff'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#cbd5e1'; }}
            >
              Accedi
            </button>
            <button
              onClick={() => navigate('/register')}
              style={{ padding: '0.6rem 1.4rem', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)', color: '#fff', fontWeight: 700, fontSize: '0.9rem', border: 'none', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(99,102,241,0.35)' }}
              onMouseOver={e => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseOut={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Registrati Gratis
            </button>
          </div>

          {/* Mobile toggle */}
          <button style={{ display: 'none', background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '0.25rem' }} className="mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(9,13,22,0.98)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}
        >
          <button onClick={() => { setIsMenuOpen(false); navigate('/concorsi'); }} style={{ width: '220px', padding: '1rem', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', background: 'transparent', color: '#fff', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer' }}>
            Monitor Concorsi
          </button>
          <button onClick={() => { setIsMenuOpen(false); navigate('/login'); }} style={{ width: '220px', padding: '1rem', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', background: 'transparent', color: '#fff', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer' }}>
            Accedi
          </button>
          <button onClick={() => { setIsMenuOpen(false); navigate('/register'); }} style={{ width: '220px', padding: '1rem', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)', border: 'none', color: '#fff', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer' }}>
            Registrati Gratis
          </button>
          <button onClick={() => setIsMenuOpen(false)} style={{ marginTop: '2rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.88rem' }}>
            Chiudi Menu
          </button>
        </motion.div>
      )}

      <main style={{ flex: 1 }}>

        {/* ── HERO SECTION 2 COLONNE ── */}
        <section style={{ paddingTop: '8rem', paddingBottom: '5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '500px', background: 'radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)', pointerEvents: 'none', borderRadius: '50%' }} />

          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', alignItems: 'center' }} className="hero-grid">
            
            {/* COLUMN LEFT: Info e CTA */}
            <motion.div {...fadeUp(0)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', zIndex: 10 }}>
              
              {/* Badge Premium styling */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '100px', padding: '0.4rem 1rem', width: 'fit-content' }}>
                <ShieldCheck size={14} color="#6366f1" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Academy Specializzata Polizia Locale
                </span>
              </div>

              <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.02em', color: '#fff', margin: 0 }}>
                Supera il concorso.<br />
                <span style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Con precisione scientifica.
                </span>
              </h1>

              <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.125rem)', color: '#94a3b8', lineHeight: 1.7, margin: 0 }}>
                L'unica piattaforma di quiz con database intelligente tarato sui bandi regionali e comunali italiani. Studia con il supporto del Copilota AI, allena i tuoi errori con l'algoritmo SRS e abbatti l'ansia da esame.
              </p>

              {/* Bottoni CTA */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
                <button
                  onClick={() => navigate('/register')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.9rem 2.2rem', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)', color: '#fff', fontWeight: 800, fontSize: '1rem', border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(99,102,241,0.4)', transition: 'all 0.2s' }}
                  onMouseOver={e => { e.currentTarget.style.filter = 'brightness(1.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseOut={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  Inizia Gratis
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={scrollToDemo}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.9rem 1.8rem', borderRadius: '12px', background: 'rgba(30, 41, 59, 0.5)', color: '#f8fafc', fontWeight: 700, fontSize: '0.95rem', border: '1px solid #334155', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseOver={e => { e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)'; e.currentTarget.style.borderColor = '#475569'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'rgba(30, 41, 59, 0.5)'; e.currentTarget.style.borderColor = '#334155'; }}
                >
                  Prova un Quiz Demo ✍️
                </button>
              </div>

              {/* Badges di fiducia */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginTop: '1.5rem', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle size={14} color="#10b981" /> +10.000 Quiz Aggiornati
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Scale size={14} color="#6366f1" /> Spiegazioni Legge 24/7
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Zap size={14} color="#ec4899" /> UX Mobile-First
                </span>
              </div>
            </motion.div>

            {/* COLUMN RIGHT: Mockup CSS Piattaforma */}
            <motion.div
              {...fadeUp(0.2)}
              style={{ display: 'flex', justifyContent: 'center', zIndex: 10 }}
            >
              <div 
                className="app-mockup"
                style={{
                  width: '100%',
                  maxWidth: '430px',
                  background: '#0c1322',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  borderRadius: '24px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.1)',
                  overflow: 'hidden',
                  fontFamily: '"Outfit", sans-serif',
                }}
              >
                {/* Header Finestra macOS-like */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.25rem', background: '#0e1726', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'block' }} />
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#eab308', display: 'block' }} />
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'block' }} />
                  </div>
                  <div style={{ margin: '0 auto', fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', letterSpacing: '1px' }}>
                    ELITE ACADEMY DASHBOARD
                  </div>
                </div>

                {/* Contenuto Interno del Mockup */}
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  {/* Profilo & Streak */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: '800' }}>
                        CS
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#f8fafc' }}>Candidato Scelto</span>
                        <span style={{ display: 'block', fontSize: '0.62rem', color: '#64748b', fontWeight: '700' }}>Grado: Agente Scelto 👮</span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.2)', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.72rem', color: '#f97316', fontWeight: '800' }}>
                      <Flame size={12} fill="#f97316" />
                      <span>5 GG DI FILA!</span>
                    </div>
                  </div>

                  {/* ASCII Progress Bar Materie */}
                  <div style={{ background: '#131c2e', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: '800', marginBottom: '0.3rem' }}>
                      <span style={{ color: '#cbd5e1' }}>Codice della Strada (CdS)</span>
                      <span style={{ color: '#34d399' }}>82%</span>
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#3b82f6', letterSpacing: '2px', lineHeight: 1 }}>
                      ████████░░ <span style={{ fontSize: '0.6rem', color: '#64748b' }}>(Dominate)</span>
                    </div>
                  </div>

                  {/* SVG Progress Ring ed Esame Stima */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    
                    {/* Ring 1 */}
                    <div style={{ background: '#131c2e', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Superamento Stimato</span>
                      <div style={{ position: 'relative', width: '56px', height: '56px' }}>
                        <svg width="56" height="56" viewBox="0 0 36 36">
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1e293b" strokeWidth="3" />
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeDasharray="76, 100" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.85rem', fontWeight: '900', color: '#10b981' }}>
                          76%
                        </div>
                      </div>
                    </div>

                    {/* Ring 2 */}
                    <div style={{ background: '#131c2e', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Precisione Media</span>
                      <div style={{ position: 'relative', width: '56px', height: '56px' }}>
                        <svg width="56" height="56" viewBox="0 0 36 36">
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1e293b" strokeWidth="3" />
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#6366f1" strokeDasharray="82, 100" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.85rem', fontWeight: '900', color: '#818cf8' }}>
                          82%
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Card Quick Resume */}
                  <div style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.03) 100%)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '14px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#cbd5e1', letterSpacing: '0.5px' }}>
                        CONTINUA STUDIO ⚡
                      </span>
                      <span style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: '700' }}>
                        ⏱️ Est. 12 min
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#fff' }}>
                      Procedura Penale: Atti di Polizia Giudiziaria
                    </div>
                    <button 
                      onClick={() => navigate('/register')}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.5rem',
                        fontSize: '0.78rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.3rem',
                        marginTop: '0.2rem'
                      }}
                    >
                      <Play size={10} fill="#fff" />
                      Riprendi Sessione
                    </button>
                  </div>

                </div>
              </div>
            </motion.div>

          </div>
        </section>

        {/* ── FEATURES GRID 2x3 ── */}
        <section style={{ padding: '6rem 1.5rem', background: '#0c1322', borderTop: '1px solid rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              style={{ textAlign: 'center', marginBottom: '4rem' }}
            >
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Perché Sceglierci</p>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Tutto ciò che serve per superare il bando
              </h2>
              <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '1rem', maxWidth: '520px', margin: '1rem auto 0' }}>
                Elite Polizia è nata per offrire l'esperienza didattica ottimale per il concorso, focalizzandosi sul rigore normativo e la fluidità UX.
              </p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }} className="features-grid">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="glass-card"
                  style={{
                    background: '#131c2e',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '20px',
                    padding: '2rem',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: feature.iconBg, borderRadius: '12px', padding: '0.75rem', marginBottom: '1.25rem' }}>
                    <feature.icon size={22} color={feature.iconColor} />
                  </div>
                  <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff', marginBottom: '0.6rem', letterSpacing: '-0.01em' }}>{feature.title}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.65, margin: 0 }}>{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TIMELINE COME FUNZIONA ORIZZONTALE ── */}
        <section style={{ padding: '6rem 1.5rem', background: '#090d16' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              style={{ textAlign: 'center', marginBottom: '5rem' }}
            >
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Il Metodo</p>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Il percorso ideale verso la divisa
              </h2>
            </motion.div>

            {/* Timeline Wrapper */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', position: 'relative' }} className="timeline-container-custom">
              
              {/* Connettori Orizzontali in CSS per desktop */}
              <div className="timeline-connector-bar" />

              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.5 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    position: 'relative',
                    zIndex: 10,
                  }}
                >
                  {/* Cerchio del Numero */}
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: '#0c1322',
                    border: '2px solid rgba(99, 102, 241, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    fontWeight: '900',
                    color: '#818cf8',
                    marginBottom: '1.25rem',
                    boxShadow: '0 0 15px rgba(99, 102, 241, 0.25)',
                    backgroundClip: 'padding-box'
                  }}>
                    {step.number}
                  </div>

                  <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff', marginBottom: '0.5rem' }}>{step.title}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6, margin: 0, maxWidth: '220px' }}>{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DEMO QUIZ INTERATTIVO ── */}
        <section id="demo-quiz-section" style={{ padding: '6rem 1.5rem', background: '#0c1322', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              style={{ textAlign: 'center', marginBottom: '3rem' }}
            >
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Modulo Interattivo</p>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                Mettiti alla prova ora ✍️
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
                Seleziona una risposta per provare all'istante l'esperienza didattica di Elite Polizia.
              </p>
            </motion.div>

            {/* Card del Quiz */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              style={{
                background: '#131c2e',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '24px',
                padding: '2rem',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                position: 'relative'
              }}
            >
              {/* Floating XP Animation */}
              <AnimatePresence>
                {showXpAnim && (
                  <motion.div
                    initial={{ opacity: 0, y: 0, scale: 0.8 }}
                    animate={{ opacity: 1, y: -40, scale: 1.2 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{
                      position: 'absolute',
                      top: '20px',
                      right: '30px',
                      color: '#10b981',
                      fontWeight: '900',
                      fontSize: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      textShadow: '0 0 10px rgba(16,185,129,0.4)',
                      zIndex: 50
                    }}
                  >
                    <span>+15 XP 🌟</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tag Categoria */}
              <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.15)', color: '#818cf8', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.78rem', fontWeight: '800', marginBottom: '1.25rem' }}>
                CODICE DELLA STRADA
              </div>

              {/* Testo Domanda */}
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#fff', lineHeight: '1.5', margin: '0 0 1.5rem 0' }}>
                {DEMO_QUESTION.testo}
              </h3>

              {/* Elenco Opzioni */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
                {DEMO_QUESTION.opzioni.map((opzione, idx) => {
                  const isSelected = selectedDemoOption === idx;
                  const isCorrect = idx === DEMO_QUESTION.rispostaCorretta;

                  // Definizione classi di stile interattive 3D
                  let optionClass = "btn-3d-demo";
                  if (isDemoChecked) {
                    if (isCorrect) {
                      optionClass += " btn-3d-demo-correct";
                    } else if (isSelected) {
                      optionClass += " btn-3d-demo-wrong";
                    } else {
                      optionClass += " btn-3d-demo-disabled";
                    }
                  } else if (isSelected) {
                    optionClass += " btn-3d-demo-selected";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleDemoOptionSelect(idx)}
                      disabled={isDemoChecked}
                      className={optionClass}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '1.1rem 1.25rem',
                        borderRadius: '14px',
                        fontSize: '0.92rem',
                        fontWeight: '600',
                        lineHeight: '1.4',
                        cursor: isDemoChecked ? 'default' : 'pointer',
                        transition: 'all 0.15s ease',
                        border: '2px solid transparent',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <span style={{ 
                          width: '22px', 
                          height: '22px', 
                          borderRadius: '6px', 
                          background: isSelected ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)', 
                          border: '1px solid rgba(255,255,255,0.1)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontSize: '0.78rem',
                          fontWeight: '800',
                          flexShrink: 0,
                          marginTop: '2px'
                        }}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opzione}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Area di Controllo */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem' }}>
                <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                  {!isDemoChecked ? "Scegli una risposta per verificare" : (
                    selectedDemoOption === DEMO_QUESTION.rispostaCorretta ? (
                      <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CheckCircle size={16} /> Ottimo lavoro! Risposta corretta.
                      </span>
                    ) : (
                      <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <X size={16} /> Risposta errata. Rivedi la spiegazione.
                      </span>
                    )
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginLeft: 'auto' }}>
                  {isDemoChecked && (
                    <button
                      onClick={handleDemoReset}
                      style={{
                        background: 'transparent',
                        border: '1px solid #334155',
                        color: '#94a3b8',
                        padding: '0.65rem 1rem',
                        borderRadius: '10px',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#475569'; }}
                      onMouseOut={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#334155'; }}
                    >
                      <RotateCcw size={14} /> Riprova
                    </button>
                  )}
                  
                  <button
                    onClick={handleDemoCheck}
                    disabled={selectedDemoOption === null || isDemoChecked}
                    style={{
                      background: selectedDemoOption !== null && !isDemoChecked ? 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)' : '#1e293b',
                      color: selectedDemoOption !== null && !isDemoChecked ? '#white' : '#64748b',
                      border: 'none',
                      padding: '0.65rem 1.5rem',
                      borderRadius: '10px',
                      fontWeight: '800',
                      fontSize: '0.88rem',
                      cursor: selectedDemoOption !== null && !isDemoChecked ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={e => {
                      if (selectedDemoOption !== null && !isDemoChecked) {
                        e.currentTarget.style.filter = 'brightness(1.15)';
                      }
                    }}
                    onMouseOut={e => { e.currentTarget.style.filter = 'none'; }}
                  >
                    Verifica Risposta
                  </button>
                </div>
              </div>

              {/* Box Spiegazione Normativa */}
              {isDemoChecked && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: '#1a2436',
                    borderLeft: '4px solid #6366f1',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    marginTop: '1.5rem',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#818cf8', fontWeight: '800', fontSize: '0.82rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    <Scale size={14} />
                    <span>Focus Normativo: {DEMO_QUESTION.normativa}</span>
                  </div>
                  <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: '1.5', margin: 0 }}>
                    {DEMO_QUESTION.spiegazione}
                  </p>
                </motion.div>
              )}

            </motion.div>

            {/* Registrazione CTA sotto il Quiz */}
            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <button
                onClick={() => navigate('/register')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#818cf8',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  textDecoration: 'underline',
                  transition: 'color 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.color = '#a5b4fc'}
                onMouseOut={e => e.currentTarget.style.color = '#818cf8'}
              >
                Registrati gratis per sbloccare le altre 10.000+ domande <ArrowRight size={16} />
              </button>
            </div>

          </div>
        </section>

        {/* ── CTA FINALE ── */}
        <section style={{ padding: '6rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center', background: '#0c1322', border: '1px solid rgba(99, 102, 241, 0.15)', borderRadius: '28px', padding: '3.5rem 2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', padding: '1rem', marginBottom: '1.5rem' }}>
              <Award size={32} color="#6366f1" />
            </div>
            <h2 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '1rem' }}>
              Il tuo futuro in Polizia Locale<br />inizia oggi.
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.65, marginBottom: '2.5rem', maxWidth: '460px', margin: '0 auto 2.5rem' }}>
              Ogni giorno di studio in più è un vantaggio rispetto agli altri candidati. Attiva subito la tua preparazione d'eccellenza.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => navigate('/register')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 2.5rem', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)', color: '#fff', fontWeight: 800, fontSize: '1rem', border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(99,102,241,0.4)', transition: 'all 0.2s', width: '100%', justifyContent: 'center', maxWidth: '320px' }}
                onMouseOver={e => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseOut={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Crea Account Gratuito
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate('/login')}
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.88rem', cursor: 'pointer', fontWeight: 500, transition: 'color 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.color = '#94a3b8'; }}
                onMouseOut={e => { e.currentTarget.style.color = '#64748b'; }}
              >
                Hai già un profilo? <span style={{ textDecoration: 'underline' }}>Accedi</span>
              </button>
            </div>
          </motion.div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <Footer />

      {/* Styles per i pulsanti 3D interattivi del Demo Quiz e la Timeline */}
      <style>{`
        /* Demo quiz button styles */
        .btn-3d-demo {
          background-color: #1e293b;
          border: 2px solid #334155 !important;
          color: #f8fafc;
          box-shadow: 0 4px 0 #0f172a;
          transform: translateY(0);
        }
        .btn-3d-demo:hover:not(:disabled) {
          background-color: #243147;
          border-color: #475569 !important;
        }
        .btn-3d-demo:active:not(:disabled) {
          transform: translateY(3px);
          box-shadow: 0 1px 0 #0f172a;
        }

        .btn-3d-demo-selected {
          background-color: rgba(99, 102, 241, 0.15);
          border-color: #6366f1 !important;
          box-shadow: 0 4px 0 #4f46e5;
          color: #fff;
        }
        .btn-3d-demo-selected:active:not(:disabled) {
          transform: translateY(3px);
          box-shadow: 0 1px 0 #4f46e5;
        }

        .btn-3d-demo-correct {
          background-color: rgba(16, 185, 129, 0.12) !important;
          border-color: #10b981 !important;
          box-shadow: 0 4px 0 #059669 !important;
          color: #ffffff !important;
        }

        .btn-3d-demo-wrong {
          background-color: rgba(239, 68, 68, 0.12) !important;
          border-color: #ef4444 !important;
          box-shadow: 0 4px 0 #dc2626 !important;
          color: #ffffff !important;
        }

        .btn-3d-demo-disabled {
          opacity: 0.4;
          background-color: #0f172a !important;
          border-color: #1e293b !important;
          box-shadow: none !important;
          cursor: not-allowed !important;
        }

        /* Timeline Connector Bar on Desktop */
        .timeline-connector-bar {
          display: none;
        }

        @media (min-width: 768px) {
          .timeline-connector-bar {
            display: block;
            position: absolute;
            top: 28px;
            left: 10%;
            right: 10%;
            height: 2px;
            background: linear-gradient(90deg, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.5) 50%, rgba(99,102,241,0.1) 100%);
            z-index: 1;
          }
        }

        /* Grid Responsive Override */
        @media (min-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1.2fr 1fr !important;
          }
        }
        
        @media (max-width: 1023px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          .hero-grid div {
            align-items: center !important;
            justify-content: center !important;
          }
          .app-mockup {
            margin-top: 2rem;
          }
        }

        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: flex !important; }
          
          .timeline-container-custom {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
        }
      `}</style>

    </div>
  );
}
