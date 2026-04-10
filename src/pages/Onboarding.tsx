import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePL } from '../context/PLContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { MapPin, Building2, CalendarDays, ChevronRight, Shield } from 'lucide-react';
import dataRegioni from '../data/regioni_pl.json';
import { motion } from 'framer-motion';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cambiaRegione, cambiaComune } = usePL();

  const [selectedRegioneId, setSelectedRegioneId] = useState<string>('');
  const [selectedComuneId, setSelectedComuneId] = useState<string>('');
  const [dataEsame, setDataEsame] = useState('');
  const [saving, setSaving] = useState(false);

  const regioni = dataRegioni?.regioni || [];
  const comuniDisponibili = selectedRegioneId
    ? regioni.find((r) => r.id === selectedRegioneId)?.citta || []
    : [];

  const handleSave = async () => {
    setSaving(true);
    try {
      if (selectedRegioneId) {
        const nomeRegione = regioni.find(r => r.id === selectedRegioneId)?.nome || '';
        await cambiaRegione(selectedRegioneId, nomeRegione);
      }
      
      if (selectedComuneId && selectedComuneId !== 'nessuno') {
        const nomeComune = comuniDisponibili.find(c => c.id === selectedComuneId)?.nome || '';
        await cambiaComune(selectedComuneId, nomeComune);
      } else {
        await cambiaComune('', '');
      }

      if (dataEsame && user) {
        await updateDoc(doc(db, 'users', user.uid), {
          dataEsamePrevista: dataEsame,
        });
      }
    } catch (e) {
      console.error('Errore salvataggio onboarding:', e);
    } finally {
      setSaving(false);
      navigate('/dashboard');
    }
  };

  const isFormValid = selectedRegioneId !== '';

  return (
    <div style={{
      minHeight: '100vh', background: '#0f172a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', color: '#f8fafc',
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%', maxWidth: '560px',
          background: '#1e293b', borderRadius: '24px',
          border: '1px solid #334155',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.03)',
          overflow: 'hidden',
          padding: '3rem',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: '#eff6ff', color: '#3b82f6',
            borderRadius: '100px', padding: '0.4rem 1rem',
            fontSize: '0.85rem', fontWeight: 600,
            marginBottom: '1.5rem',
          }}>
            <Shield size={14} /> Personalizza la tua preparazione
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '900', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
            Benvenuto, {user?.displayName?.split(' ')[0] || 'Agente'}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', margin: 0 }}>
            Seleziona la tua area per ricevere domande mirate sui regolamenti locali.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* REGIONE */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              <MapPin size={16} color="#3b82f6" /> Regione del Concorso *
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedRegioneId}
                onChange={(e) => {
                  setSelectedRegioneId(e.target.value);
                  setSelectedComuneId(''); // Reset comune
                }}
                style={{
                  width: '100%', padding: '1rem 1rem',
                  background: '#0f172a', border: '1px solid #334155',
                  borderRadius: '12px', color: '#f8fafc',
                  fontSize: '1rem', outline: 'none', appearance: 'none',
                  cursor: 'pointer', transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#334155'}
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
          <motion.div 
            animate={{ opacity: selectedRegioneId ? 1 : 0.5 }}
            style={{ pointerEvents: selectedRegioneId ? 'auto' : 'none' }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              <Building2 size={16} color="#10b981" /> Comune (Opzionale)
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedComuneId}
                onChange={(e) => setSelectedComuneId(e.target.value)}
                style={{
                  width: '100%', padding: '1rem 1rem',
                  background: '#0f172a', border: '1px solid #334155',
                  borderRadius: '12px', color: '#f8fafc',
                  fontSize: '1rem', outline: 'none', appearance: 'none',
                  cursor: 'pointer', transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                onBlur={(e) => e.target.style.borderColor = '#334155'}
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
          </motion.div>

          {/* DATA ESAME */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              <CalendarDays size={16} color="#a78bfa" /> Data Esame (Opzionale)
            </label>
            <input
              type="date"
              value={dataEsame}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setDataEsame(e.target.value)}
              style={{
                width: '100%', padding: '0.95rem 1rem',
                background: '#0f172a', border: '1px solid #334155',
                borderRadius: '12px', color: '#f8fafc',
                fontSize: '1rem', outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#a78bfa'}
              onBlur={(e) => e.target.style.borderColor = '#334155'}
            />
          </div>

        </div>

        <div style={{ marginTop: '3rem' }}>
          <button
            onClick={handleSave}
            disabled={!isFormValid || saving}
            style={{
              width: '100%', padding: '1.1rem', borderRadius: '12px',
              background: isFormValid ? '#3b82f6' : '#334155',
              border: 'none', color: isFormValid ? '#1e293b' : '#64748b',
              fontWeight: 700, fontSize: '1.05rem',
              cursor: isFormValid ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
              transition: 'all 0.2s',
              boxShadow: isFormValid ? '0 4px 12px rgba(59, 130, 246, 0.2)' : 'none',
            }}
            onMouseOver={e => isFormValid && (e.currentTarget.style.background = '#2563eb')}
            onMouseOut={e => isFormValid && (e.currentTarget.style.background = '#3b82f6')}
          >
            {saving ? 'Salvataggio...' : 'Inizia a Studiare'} <ChevronRight size={20} />
          </button>
        </div>

      </motion.div>
    </div>
  );
}