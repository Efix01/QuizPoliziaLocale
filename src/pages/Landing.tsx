import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  MapPin,
  BookOpen,
  TrendingUp,
  FileText,
  Scale,
  Timer,
  ArrowRight,
  Menu,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: 'easeOut' as const },
});

export default function Landing() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const steps = [
    {
      number: '01',
      icon: MapPin,
      iconColor: '#3b82f6',
      title: 'Scegli la tua zona',
      description: 'Seleziona Regione e Comune per ricevere i quiz calibrati esattamente sul tuo bando di concorso.',
    },
    {
      number: '02',
      icon: BookOpen,
      iconColor: '#6366f1',
      title: 'Studia ed esercitati',
      description: 'Affronta i quiz per materia, per capitolo o lancia una simulazione d\'esame con timer ufficiale.',
    },
    {
      number: '03',
      icon: TrendingUp,
      iconColor: '#10b981',
      title: 'Monitora i progressi',
      description: 'Identifica i tuoi punti deboli e colmali in tempo reale, prima che diventino un problema all\'esame.',
    },
  ];

  const features = [
    {
      icon: FileText,
      iconBg: 'rgba(59,130,246,0.12)',
      iconColor: '#3b82f6',
      title: 'Quiz Sempre Aggiornati',
      description: 'Migliaia di domande certificate, basate sui bandi reali e aggiornate costantemente alle ultime normative.',
    },
    {
      icon: Scale,
      iconBg: 'rgba(99,102,241,0.12)',
      iconColor: '#818cf8',
      title: 'Normative Locali Incluse',
      description: "L'unica app che integra le leggi regionali e i regolamenti comunali specifici del tuo Comune.",
    },
    {
      icon: Timer,
      iconBg: 'rgba(16,185,129,0.12)',
      iconColor: '#10b981',
      title: 'Simulazioni Reali',
      description: 'Timer e criteri di valutazione identici all\'esame ufficiale, per non avere sorprese il giorno del concorso.',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#f8fafc', display: 'flex', flexDirection: 'column', fontFamily: '"Outfit", "Inter", sans-serif', overflowX: 'hidden' }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        padding: '1rem 1.5rem',
        background: scrolled ? 'rgba(2,6,23,0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : 'none',
        transition: 'all 0.4s ease',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Logo */}
          <div
            style={{ cursor: 'pointer', transition: 'opacity 0.2s, transform 0.2s' }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            onMouseOver={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseOut={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <img src="/logo_quiz_pol_locale.png" alt="Quiz Polizia Locale" style={{ height: '56px', objectFit: 'contain', display: 'block' }} />
          </div>

          {/* Desktop buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }} className="desktop-nav">
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
              style={{ padding: '0.6rem 1.4rem', borderRadius: '10px', background: '#3b82f6', color: '#fff', fontWeight: 700, fontSize: '0.9rem', border: 'none', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(59,130,246,0.35)' }}
              onMouseOver={e => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseOut={e => { e.currentTarget.style.background = '#3b82f6'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Registrati
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
          style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(2,6,23,0.97)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}
        >
          <button onClick={() => navigate('/login')} style={{ width: '200px', padding: '1rem', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', background: 'transparent', color: '#fff', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer' }}>
            Accedi
          </button>
          <button onClick={() => navigate('/register')} style={{ width: '200px', padding: '1rem', borderRadius: '12px', background: '#3b82f6', border: 'none', color: '#fff', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer' }}>
            Registrati
          </button>
          <button onClick={() => setIsMenuOpen(false)} style={{ marginTop: '2rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem' }}>
            Chiudi
          </button>
        </motion.div>
      )}

      <main style={{ flex: 1 }}>

        {/* ── HERO ── */}
        <section style={{ paddingTop: '9rem', paddingBottom: '6rem', paddingLeft: '1.5rem', paddingRight: '1.5rem', textAlign: 'center', position: 'relative' }}>
          {/* Subtle background glow */}
          <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 70%)', pointerEvents: 'none', borderRadius: '50%' }} />

          <div style={{ maxWidth: '760px', margin: '0 auto', position: 'relative' }}>
            <motion.div {...fadeUp(0)}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '100px', padding: '0.4rem 1rem', marginBottom: '2.5rem' }}>
                <ShieldCheck size={14} color="#3b82f6" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Preparazione concorsuale</span>
              </div>
            </motion.div>

            <motion.h1 {...fadeUp(0.1)} style={{ fontSize: 'clamp(2.4rem, 6vw, 4.2rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', color: '#fff', marginBottom: '1.5rem' }}>
              Preparati al concorso<br />
              <span style={{ background: 'linear-gradient(135deg, #60a5fa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                di Polizia Locale.
              </span>{' '}
              <span style={{ color: '#94a3b8' }}>Sul serio.</span>
            </motion.h1>

            <motion.p {...fadeUp(0.2)} style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: '#94a3b8', lineHeight: 1.7, marginBottom: '3rem', maxWidth: '560px', margin: '0 auto 3rem' }}>
              Quiz aggiornati, normative regionali e comunali, tutto in un'unica app pensata per chi vuole arrivare preparato — non solo sperare di farcela.
            </motion.p>

            <motion.div {...fadeUp(0.3)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => navigate('/register')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 2.5rem', borderRadius: '14px', background: '#3b82f6', color: '#fff', fontWeight: 800, fontSize: '1.05rem', border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(59,130,246,0.4)', transition: 'all 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(59,130,246,0.5)'; }}
                onMouseOut={e => { e.currentTarget.style.background = '#3b82f6'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(59,130,246,0.4)'; }}
              >
                Inizia Gratis
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate('/login')}
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 500, transition: 'color 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.color = '#94a3b8'; }}
                onMouseOut={e => { e.currentTarget.style.color = '#64748b'; }}
              >
                Hai già un account? <span style={{ textDecoration: 'underline' }}>Accedi</span>
              </button>
            </motion.div>
          </div>
        </section>

        {/* ── COME FUNZIONA ── */}
        <section style={{ padding: '5rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(15,23,42,0.4)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              style={{ textAlign: 'center', marginBottom: '4rem' }}
            >
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Come funziona</p>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Tre passi per arrivare al traguardo
              </h2>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '2rem', position: 'relative', overflow: 'hidden' }}
                >
                  <div style={{ position: 'absolute', top: '1.25rem', right: '1.5rem', fontSize: '2.5rem', fontWeight: 900, color: 'rgba(255,255,255,0.04)', lineHeight: 1, userSelect: 'none' }}>
                    {step.number}
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: `rgba(${step.iconColor === '#3b82f6' ? '59,130,246' : step.iconColor === '#6366f1' ? '99,102,241' : '16,185,129'},0.12)`, borderRadius: '12px', padding: '0.75rem', marginBottom: '1.25rem' }}>
                    <step.icon size={22} color={step.iconColor} />
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff', marginBottom: '0.6rem', letterSpacing: '-0.01em' }}>{step.title}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.65 }}>{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PERCHÉ NOI ── */}
        <section style={{ padding: '6rem 1.5rem' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              style={{ textAlign: 'center', marginBottom: '4rem' }}
            >
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Perché Elite</p>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Tutto ciò che serve. Niente di inutile.
              </h2>
              <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '1rem', maxWidth: '480px', margin: '1rem auto 0' }}>
                I concorsi di Polizia Locale sono tra i più complessi. Noi abbiamo costruito l'unico strumento che lo sa davvero.
              </p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.5 }}
                  style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '20px', padding: '2rem', transition: 'border-color 0.2s, transform 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#334155'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#1e293b'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: feature.iconBg, borderRadius: '12px', padding: '0.75rem', marginBottom: '1.25rem' }}>
                    <feature.icon size={22} color={feature.iconColor} />
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff', marginBottom: '0.6rem', letterSpacing: '-0.01em' }}>{feature.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.65 }}>{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FINALE ── */}
        <section style={{ padding: '5rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center', background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 3rem)' }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(59,130,246,0.12)', borderRadius: '50%', padding: '1rem', marginBottom: '1.75rem' }}>
              <ShieldCheck size={32} color="#3b82f6" />
            </div>
            <h2 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '1rem' }}>
              Il tuo posto in divisa<br />ti aspetta.
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: '420px', margin: '0 auto 2.5rem' }}>
              Ogni giorno che passa è un giorno in meno per prepararti. Inizia adesso, è gratis.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => navigate('/register')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 2.5rem', borderRadius: '14px', background: '#3b82f6', color: '#fff', fontWeight: 800, fontSize: '1rem', border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(59,130,246,0.4)', transition: 'all 0.2s', width: '100%', justifyContent: 'center', maxWidth: '320px' }}
                onMouseOver={e => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseOut={e => { e.currentTarget.style.background = '#3b82f6'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Registrati Ora
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate('/login')}
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.88rem', cursor: 'pointer', fontWeight: 500, transition: 'color 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.color = '#94a3b8'; }}
                onMouseOut={e => { e.currentTarget.style.color = '#64748b'; }}
              >
                Oppure accedi al tuo account
              </button>
            </div>
          </motion.div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <Footer />

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
      `}</style>

    </div>
  );
}
