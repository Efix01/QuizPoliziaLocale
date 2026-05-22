import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePL } from '../context/PLContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { 
  MapPin, Building2, CalendarDays, ChevronRight, ArrowLeft,
  Shield, Check, Target, Clock, Award 
} from 'lucide-react';
import dataRegioni from '../data/regioni_pl.json';
import { motion, AnimatePresence } from 'framer-motion';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cambiaRegione, cambiaComune, setProfilo } = usePL();

  const [step, setStep] = useState(1);
  const [selectedRegioneId, setSelectedRegioneId] = useState<string>('');
  const [selectedComuneId, setSelectedComuneId] = useState<string>('');
  
  const [obiettivoStudio, setObiettivoStudio] = useState<'agente' | 'ufficiale' | 'professionale' | ''>('');
  const [tempoStudioGiornaliero, setTempoStudioGiornaliero] = useState<10 | 20 | 45 | null>(null);
  const [livelloIniziale, setLivelloIniziale] = useState<'base' | 'intermedio' | 'avanzato' | ''>('');
  
  const [dataEsame, setDataEsame] = useState('');
  const [saving, setSaving] = useState(false);

  const regioni = dataRegioni?.regioni || [];
  const comuniDisponibili = selectedRegioneId
    ? regioni.find((r) => r.id === selectedRegioneId)?.citta || []
    : [];

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Cambia regione
      if (selectedRegioneId) {
        const nomeRegione = regioni.find(r => r.id === selectedRegioneId)?.nome || '';
        await cambiaRegione(selectedRegioneId, nomeRegione);
      }
      
      // 2. Cambia comune
      let nomeComune = '';
      if (selectedComuneId && selectedComuneId !== 'nessuno') {
        nomeComune = comuniDisponibili.find(c => c.id === selectedComuneId)?.nome || '';
        await cambiaComune(selectedComuneId, nomeComune);
      } else {
        await cambiaComune('', '');
      }

      // 3. Salva gli altri dati su Firestore
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          dataEsamePrevista: dataEsame || null,
          obiettivoStudio: obiettivoStudio || null,
          tempoStudioGiornaliero: tempoStudioGiornaliero || null,
          livelloIniziale: livelloIniziale || null,
        });
      }

      // 4. Aggiorna il profilo locale
      setProfilo(prev => {
        if (!prev) return null;
        return {
          ...prev,
          obiettivoStudio: obiettivoStudio || undefined,
          tempoStudioGiornaliero: tempoStudioGiornaliero || undefined,
          livelloIniziale: livelloIniziale || undefined,
        };
      });
    } catch (e) {
      console.error('Errore salvataggio onboarding:', e);
    } finally {
      setSaving(false);
      navigate('/dashboard');
    }
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // Validazione pulsante Avanti
  const isStepValid = () => {
    switch (step) {
      case 1:
        return selectedRegioneId !== '';
      case 2:
        return obiettivoStudio !== '';
      case 3:
        return tempoStudioGiornaliero !== null;
      case 4:
        return livelloIniziale !== '';
      default:
        return false;
    }
  };

  // Varianti per le animazioni
  const slideVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.2, ease: 'easeIn' as const } }
  };

  return (
    <div style={{
      minHeight: '100vh', 
      background: 'var(--bg-deep)',
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem 1rem', 
      color: '#f8fafc',
    }}>
      {/* Indicatore di Progresso Superiore */}
      <div style={{ width: '100%', maxWidth: '580px', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>PASSO {step} DI 4</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--elite-primary)', fontWeight: 700 }}>
            {step === 1 && "Area Concorso"}
            {step === 2 && "Obiettivo Professionale"}
            {step === 3 && "Ritmo di Studio"}
            {step === 4 && "Piano Personale"}
          </span>
        </div>
        <div style={{ height: '6px', width: '100%', background: '#1e293b', borderRadius: '100px', overflow: 'hidden' }}>
          <motion.div 
            initial={{ width: '0%' }}
            animate={{ width: `${(step / 4) * 100}%` }}
            transition={{ duration: 0.3 }}
            style={{ height: '100%', background: 'var(--elite-primary)', borderRadius: '100px' }}
          />
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%', 
          maxWidth: '580px',
          background: 'var(--bg-card)', 
          borderRadius: '24px',
          border: '1px solid var(--border-elite)',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          padding: '2.5rem',
        }}
      >
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  background: 'rgba(99, 102, 241, 0.1)', color: 'var(--elite-primary)',
                  borderRadius: '100px', padding: '0.4rem 1rem',
                  fontSize: '0.85rem', fontWeight: 600,
                  marginBottom: '1rem',
                  border: '1px solid rgba(99, 102, 241, 0.2)'
                }}>
                  <Shield size={14} /> Configura la tua area
                </div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
                  Dove farai il concorso?
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
                  Personalizziamo il tuo database caricando le normative regionali e comunali del tuo bando.
                </p>
              </div>

              {/* REGIONE */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  <MapPin size={16} color="var(--elite-primary)" /> Regione del Concorso *
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={selectedRegioneId}
                    onChange={(e) => {
                      setSelectedRegioneId(e.target.value);
                      setSelectedComuneId(''); // Reset comune
                    }}
                    style={{
                      width: '100%', padding: '1rem',
                      background: 'var(--bg-deep)', border: '1px solid var(--border-elite)',
                      borderRadius: '12px', color: '#f8fafc',
                      fontSize: '1rem', outline: 'none', appearance: 'none',
                      cursor: 'pointer', transition: 'border-color 0.2s',
                    }}
                  >
                    <option value="" disabled>Seleziona una regione...</option>
                    {regioni.map(r => (
                      <option key={r.id} value={r.id}>{r.nome}</option>
                    ))}
                  </select>
                  <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }}>
                    <ChevronRight size={16} style={{ transform: 'rotate(90deg)' }} />
                  </div>
                </div>
              </div>

              {/* COMUNE */}
              <div style={{ opacity: selectedRegioneId ? 1 : 0.5, pointerEvents: selectedRegioneId ? 'auto' : 'none', transition: 'opacity 0.2s' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  <Building2 size={16} color="var(--elite-accent)" /> Comune (Opzionale)
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={selectedComuneId}
                    onChange={(e) => setSelectedComuneId(e.target.value)}
                    style={{
                      width: '100%', padding: '1rem',
                      background: 'var(--bg-deep)', border: '1px solid var(--border-elite)',
                      borderRadius: '12px', color: '#f8fafc',
                      fontSize: '1rem', outline: 'none', appearance: 'none',
                      cursor: 'pointer', transition: 'border-color 0.2s',
                    }}
                  >
                    <option value="">Studio solo normativa regionale</option>
                    {comuniDisponibili.map(c => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                  <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }}>
                    <ChevronRight size={16} style={{ transform: 'rotate(90deg)' }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
                  Qual è il tuo ruolo obiettivo?
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
                  Il simulatore adatterà la ponderazione delle domande in base al profilo selezionato.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Opzione Agente */}
                <div 
                  role="button"
                  tabIndex={0}
                  onClick={() => setObiettivoStudio('agente')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '1.25rem', borderRadius: '16px',
                    border: obiettivoStudio === 'agente' ? '2px solid var(--elite-primary)' : '1px solid var(--border-elite)',
                    background: obiettivoStudio === 'agente' ? 'rgba(99, 102, 241, 0.06)' : 'var(--bg-deep)',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: obiettivoStudio === 'agente' ? 'var(--elite-primary)' : '#1e293b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                  }}>
                    <Shield size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontWeight: '700', fontSize: '1.05rem' }}>Agente di Polizia Locale</h4>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>Codice della Strada, TULPS, Diritto Penale e Regolamenti locali.</p>
                  </div>
                  {obiettivoStudio === 'agente' && (
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--elite-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <Check size={12} />
                    </div>
                  )}
                </div>

                {/* Opzione Ufficiale */}
                <div 
                  role="button"
                  tabIndex={0}
                  onClick={() => setObiettivoStudio('ufficiale')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '1.25rem', borderRadius: '16px',
                    border: obiettivoStudio === 'ufficiale' ? '2px solid var(--elite-primary)' : '1px solid var(--border-elite)',
                    background: obiettivoStudio === 'ufficiale' ? 'rgba(99, 102, 241, 0.06)' : 'var(--bg-deep)',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: obiettivoStudio === 'ufficiale' ? 'var(--elite-primary)' : '#1e293b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                  }}>
                    <Award size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontWeight: '700', fontSize: '1.05rem' }}>Ufficiale / Comandante</h4>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>Diritto Amministrativo avanzato, legislazione locale e management.</p>
                  </div>
                  {obiettivoStudio === 'ufficiale' && (
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--elite-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <Check size={12} />
                    </div>
                  )}
                </div>

                {/* Opzione Professionale */}
                <div 
                  role="button"
                  tabIndex={0}
                  onClick={() => setObiettivoStudio('professionale')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '1.25rem', borderRadius: '16px',
                    border: obiettivoStudio === 'professionale' ? '2px solid var(--elite-primary)' : '1px solid var(--border-elite)',
                    background: obiettivoStudio === 'professionale' ? 'rgba(99, 102, 241, 0.06)' : 'var(--bg-deep)',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: obiettivoStudio === 'professionale' ? 'var(--elite-primary)' : '#1e293b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                  }}>
                    <Target size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontWeight: '700', fontSize: '1.05rem' }}>Aggiornamento Continuo</h4>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>Studio libero di tutta la normativa e mantenimento delle competenze.</p>
                  </div>
                  {obiettivoStudio === 'professionale' && (
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--elite-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <Check size={12} />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
                  Quanto tempo vuoi dedicare al giorno?
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
                  Definiremo il tuo target giornaliero per sbloccare e mantenere lo streak quotidiano.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Opzione 10 minuti */}
                <div 
                  role="button"
                  tabIndex={0}
                  onClick={() => setTempoStudioGiornaliero(10)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '1.25rem', borderRadius: '16px',
                    border: tempoStudioGiornaliero === 10 ? '2px solid var(--elite-primary)' : '1px solid var(--border-elite)',
                    background: tempoStudioGiornaliero === 10 ? 'rgba(99, 102, 241, 0.06)' : 'var(--bg-deep)',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: tempoStudioGiornaliero === 10 ? 'var(--elite-primary)' : '#1e293b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                  }}>
                    <Clock size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontWeight: '700', fontSize: '1.05rem' }}>Rapido (10 Minuti / Giorno)</h4>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>Target: <strong>15 Domande</strong>. Ideale per mantenere costante l'abitudine.</p>
                  </div>
                  {tempoStudioGiornaliero === 10 && (
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--elite-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <Check size={12} />
                    </div>
                  )}
                </div>

                {/* Opzione 20 minuti */}
                <div 
                  role="button"
                  tabIndex={0}
                  onClick={() => setTempoStudioGiornaliero(20)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '1.25rem', borderRadius: '16px',
                    border: tempoStudioGiornaliero === 20 ? '2px solid var(--elite-primary)' : '1px solid var(--border-elite)',
                    background: tempoStudioGiornaliero === 20 ? 'rgba(99, 102, 241, 0.06)' : 'var(--bg-deep)',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: tempoStudioGiornaliero === 20 ? 'var(--elite-primary)' : '#1e293b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                  }}>
                    <Clock size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontWeight: '700', fontSize: '1.05rem' }}>Bilanciato (20 Minuti / Giorno)</h4>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>Target: <strong>30 Domande</strong>. Il ritmo ideale raccomandato per la memoria.</p>
                  </div>
                  {tempoStudioGiornaliero === 20 && (
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--elite-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <Check size={12} />
                    </div>
                  )}
                </div>

                {/* Opzione 45 minuti */}
                <div 
                  role="button"
                  tabIndex={0}
                  onClick={() => setTempoStudioGiornaliero(45)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '1.25rem', borderRadius: '16px',
                    border: tempoStudioGiornaliero === 45 ? '2px solid var(--elite-primary)' : '1px solid var(--border-elite)',
                    background: tempoStudioGiornaliero === 45 ? 'rgba(99, 102, 241, 0.06)' : 'var(--bg-deep)',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: tempoStudioGiornaliero === 45 ? 'var(--elite-primary)' : '#1e293b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                  }}>
                    <Clock size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontWeight: '700', fontSize: '1.05rem' }}>Intensivo (45 Minuti / Giorno)</h4>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>Target: <strong>60 Domande</strong>. Consigliato se il bando scade a breve.</p>
                  </div>
                  {tempoStudioGiornaliero === 45 && (
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--elite-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <Check size={12} />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
              <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
                  Configurazione Finale
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
                  Definisci il tuo livello iniziale e la data dell'esame se già stabilita.
                </p>
              </div>

              {/* LIVELLO DI PARTENZA */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  <Award size={16} color="var(--elite-primary)" /> Livello di Conoscenza Attuale
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {(['base', 'intermedio', 'avanzato'] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLivelloIniziale(l)}
                      style={{
                        padding: '0.75rem', borderRadius: '12px',
                        background: livelloIniziale === l ? 'var(--elite-primary)' : 'var(--bg-deep)',
                        border: livelloIniziale === l ? '2px solid var(--elite-primary)' : '1px solid var(--border-elite)',
                        color: livelloIniziale === l ? '#fff' : '#cbd5e1',
                        fontSize: '0.9rem', fontWeight: 600,
                        cursor: 'pointer', textTransform: 'capitalize',
                        transition: 'all 0.2s',
                      }}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* DATA ESAME */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  <CalendarDays size={16} color="var(--elite-accent)" /> Data Esame (Opzionale)
                </label>
                <input
                  type="date"
                  value={dataEsame}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setDataEsame(e.target.value)}
                  style={{
                    width: '100%', padding: '0.95rem 1rem',
                    background: 'var(--bg-deep)', border: '1px solid var(--border-elite)',
                    borderRadius: '12px', color: '#f8fafc',
                    fontSize: '1rem', outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulsanti di Navigazione */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
          {step > 1 && (
            <button
              onClick={handleBack}
              style={{
                flex: 1, padding: '1rem', borderRadius: '12px',
                background: 'transparent', border: '1px solid var(--border-elite)',
                color: '#cbd5e1', fontWeight: 700, fontSize: '1rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                transition: 'background 0.2s',
              }}
            >
              <ArrowLeft size={18} /> Indietro
            </button>
          )}
          
          <button
            onClick={step === 4 ? handleSave : handleNext}
            disabled={!isStepValid() || saving}
            style={{
              flex: 2, padding: '1rem', borderRadius: '12px',
              background: isStepValid() ? 'var(--elite-primary)' : 'var(--border-elite)',
              border: 'none', color: isStepValid() ? '#fff' : '#64748b',
              fontWeight: 700, fontSize: '1rem',
              cursor: isStepValid() ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              transition: 'all 0.2s',
              boxShadow: isStepValid() ? '0 4px 14px rgba(99, 102, 241, 0.3)' : 'none',
            }}
          >
            {step === 4 ? (saving ? 'Salvataggio...' : 'Completa Configurazione') : 'Avanti'}
            {step < 4 && <ChevronRight size={18} />}
          </button>
        </div>

      </motion.div>
    </div>
  );
}