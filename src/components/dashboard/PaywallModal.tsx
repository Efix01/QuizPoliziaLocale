import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, Sparkles, CheckCircle2, Award } from 'lucide-react';
import { useProgress } from '../../context/ProgressContext';
import { useToast } from '../../context/ToastContext';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: 'simulation' | 'locale' | 'ai' | 'general';
}

export default function PaywallModal({ isOpen, onClose, reason = 'general' }: PaywallModalProps) {
  const { setPremiumStatus } = useProgress();
  const { showToast } = useToast();

  const handleUnlock = async () => {
    try {
      await setPremiumStatus(true);
      showToast("👑 Licenza Elite Attivata! Benvenuto nell'Accademia.", "success");
      onClose();
    } catch (e) {
      showToast("Errore durante l'attivazione della licenza Elite.", "error");
    }
  };

  const getReasonText = () => {
    switch (reason) {
      case 'simulation':
        return "Hai superato il limite di 3 simulazioni gratuite. La preparazione intensiva richiede prove d'esame illimitate.";
      case 'locale':
        return "Le normative Regionali e Comunali sono contenuti ad alta specificità riservati ai membri Elite.";
      case 'ai':
        return "Hai esaurito il limite di spiegazioni AI gratuite per oggi.";
      default:
        return "Sblocca tutti gli strumenti avanzati di preparazione ai concorsi di Polizia Locale.";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(9, 13, 22, 0.8)',
              backdropFilter: 'blur(12px)',
            }}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '540px',
              background: '#0f172a',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              boxShadow: '0 25px 50px -12px rgba(245, 158, 11, 0.15)',
              borderRadius: '24px',
              padding: '2rem',
              color: '#f8fafc',
              overflow: 'hidden',
            }}
          >
            {/* Ambient gold glow */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.6rem', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <Award color="#f59e0b" size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Accademia Elite <span style={{ background: '#f59e0b', color: '#090d16', fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '99px', fontWeight: 'bold' }}>PRO</span>
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Preparazione Concorsi Polizia Locale</span>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid #334155',
                  color: '#94a3b8',
                  padding: '0.4rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
              >
                <X size={18} />
              </button>
            </div>

            {/* Context Warning Badge */}
            <div style={{
              background: 'rgba(245, 158, 11, 0.06)',
              border: '1px solid rgba(245, 158, 11, 0.15)',
              borderRadius: '16px',
              padding: '1rem',
              marginBottom: '1.5rem',
              fontSize: '0.92rem',
              lineHeight: '1.5',
              color: '#fef3c7',
              display: 'flex',
              gap: '0.75rem',
            }}>
              <ShieldAlert size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{getReasonText()}</div>
            </div>

            {/* Benefits List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <CheckCircle2 color="#22c55e" size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#fff', fontSize: '0.95rem' }}>Simulazioni Ministeriali Illimitate</strong>
                  <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>Esegui simulazioni con le esatte logiche del bando e la griglia di penalità ufficiale.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <CheckCircle2 color="#22c55e" size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#fff', fontSize: '0.95rem' }}>Leggi Regionali & Regolamenti Comunali</strong>
                  <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>Normativa specifica aggiornata e ponderata per il Comune e la Regione che hai scelto.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <CheckCircle2 color="#22c55e" size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#fff', fontSize: '0.95rem' }}>Tutor AI & Quaderno Errori Illimitati</strong>
                  <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>Ricevi spiegazioni dettagliate dal tutor virtuale e ripeti i quiz mirati sui tuoi punti deboli.</p>
                </div>
              </div>
            </div>

            {/* Price Options / CTA Box */}
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '18px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>ABBONAMENTO ELITE PASS</span>
                  <h4 style={{ margin: '0.2rem 0 0 0', fontSize: '1.5rem', fontWeight: '800' }}>€ 14,99 / mese</h4>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ textDecoration: 'line-through', color: '#64748b', fontSize: '0.85rem' }}>€ 29,99</span>
                  <span style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', fontSize: '0.75rem', padding: '0.15rem 0.4rem', borderRadius: '6px', fontWeight: 'bold', marginLeft: '0.4rem' }}>-50%</span>
                </div>
              </div>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: '1.4' }}>
                Disdici in qualsiasi momento con 1 clic. Nessun vincolo di durata. Fatturazione sicura Stripe.
              </p>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={handleUnlock}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#090d16',
                  border: 'none',
                  padding: '1.1rem',
                  borderRadius: '14px',
                  fontWeight: '800',
                  fontSize: '1.05rem',
                  cursor: 'pointer',
                  boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.3)',
                  transition: 'transform 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Sparkles size={18} />
                ATTIVA ACCADEMIA ELITE 👑
              </button>

              <button
                onClick={onClose}
                style={{
                  width: '100%',
                  background: 'transparent',
                  color: '#94a3b8',
                  border: '1px solid #334155',
                  padding: '0.9rem',
                  borderRadius: '14px',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#1e293b';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#94a3b8';
                }}
              >
                Continua con la versione limitata
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
