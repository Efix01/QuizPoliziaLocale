import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePL } from '../context/PLContext';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import regioniData from '../data/regioni_pl.json';
import { MapPin, Building2, CheckCircle2, ChevronLeft, ArrowRight } from 'lucide-react';

// Schema di validazione Zod (Skill sicurezza-quiz)
const ProfileSchema = z.object({
  regioneId: z.string().min(1, "Seleziona una regione"),
  comuneId: z.string().min(1, "Seleziona un comune"),
});

export default function SetupProfile() {
  const navigate = useNavigate();
  const { cambiaRegione, cambiaComune, profilo } = usePL();
  
  const [step, setStep] = useState<'regione' | 'comune' | 'conferma'>('regione');
  const [selectedRegione, setSelectedRegione] = useState('');
  const [selectedComune, setSelectedComune] = useState('');
  const [error, setError] = useState<string | null>(null);

  const regioni = regioniData.regioni || [];
  const comuniDisponibili = selectedRegione
    ? regioni.find(r => r.id === selectedRegione)?.comuni || []
    : [];

  const handleRegioneSelect = async (regioneId: string) => {
    const regione = regioni.find(r => r.id === regioneId);
    if (!regione) return;

    setSelectedRegione(regioneId);
    setError(null);
    try {
      await cambiaRegione(regioneId, regione.nome);
      setStep('comune');
    } catch (err) {
      setError("Errore nel caricamento dei dati regionali.");
    }
  };

  const handleComuneSelect = async (comuneId: string) => {
    const comune = comuniDisponibili.find(c => c.id === comuneId);
    if (!comune) return;

    setSelectedComune(comuneId);
    setError(null);
    try {
      await cambiaComune(comuneId, comune.nome);
      setStep('conferma');
    } catch (err) {
      setError("Errore nel caricamento dei dati comunali.");
    }
  };

  const handleConfirm = () => {
    // Validazione finale con Zod
    const result = ProfileSchema.safeParse({ regioneId: selectedRegione, comuneId: selectedComune });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      
      {/* Container Principale */}
      <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Header Onboarding */}
        <div className="bg-slate-900 p-10 text-center text-white relative">
          <div className="absolute top-4 left-4 flex gap-1 opacity-20">
            {[1,2,3].map(i => <div key={i} className={`w-2 h-2 rounded-full ${step === (i === 1 ? 'regione' : i === 2 ? 'comune' : 'conferma') ? 'bg-blue-400' : 'bg-white'}`} />)}
          </div>
          <motion.h1 
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-black tracking-tight"
          >
            {step === 'regione' ? 'Scegli la tua Regione' : step === 'comune' ? 'Scegli il tuo Comune' : 'Quasi pronto!'}
          </motion.h1>
          <p className="text-slate-400 mt-2 font-medium">Configura il tuo percorso di studio personalizzato.</p>
        </div>

        <div className="p-10 min-h-[400px] flex flex-col">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Regione */}
            {step === 'regione' && (
              <motion.div 
                key="regione" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-2 sm:grid-cols-3 gap-4"
              >
                {regioni.map(r => (
                  <button
                    key={r.id}
                    onClick={() => handleRegioneSelect(r.id)}
                    className={`group p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${selectedRegione === r.id ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
                  >
                    <div className="text-3xl transition-transform group-hover:scale-110">📍</div>
                    <span className={`font-bold text-sm uppercase tracking-tight ${selectedRegione === r.id ? 'text-blue-700' : 'text-slate-600'}`}>{r.nome}</span>
                  </button>
                ))}
              </motion.div>
            )}

            {/* Step 2: Comune */}
            {step === 'comune' && (
              <motion.div 
                key="comune" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6"
              >
                <div className="flex flex-wrap gap-3">
                  {comuniDisponibili.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleComuneSelect(c.id)}
                      className={`px-8 py-4 rounded-2xl border-2 font-bold text-lg transition-all ${selectedComune === c.id ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 hover:border-slate-200 text-slate-500'}`}
                    >
                      🏛️ {c.nome}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setStep('regione')}
                  className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-900 transition-colors mt-auto"
                >
                  <ChevronLeft size={20} /> Torna alla Regione
                </button>
              </motion.div>
            )}

            {/* Step 3: Conferma */}
            {step === 'conferma' && (
              <motion.div 
                key="conferma" 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center flex-1"
              >
                <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 size={48} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Configurazione Ottimale</h3>
                <p className="text-slate-500 text-center mb-8 font-medium">Hai selezionato il percorso per <span className="text-slate-900 font-bold">{profilo?.nomeRegione}</span> e <span className="text-slate-900 font-bold">{profilo?.nomeComune}</span>. I quiz sono pronti.</p>
                
                <div className="w-full flex flex-col gap-4">
                  <button 
                    onClick={handleConfirm}
                    className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black text-xl shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                  >
                    Inizia a Studiare <ArrowRight />
                  </button>
                  <button 
                    onClick={() => setStep('regione')}
                    className="w-full py-5 bg-slate-50 text-slate-400 rounded-3xl font-bold hover:bg-slate-100 transition-all"
                  >
                    Modifica Scelte
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {error && (
          <div className="mx-10 mb-10 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-2">
            ⚠️ {error}
          </div>
        )}

      </div>

      {/* Trust Badges */}
      <div className="mt-12 flex gap-8 opacity-40 grayscale">
         <div className="flex items-center gap-2 font-black text-xs tracking-widest uppercase">
            <Building2 size={16} /> Protocollo Nazionale
         </div>
         <div className="flex items-center gap-2 font-black text-xs tracking-widest uppercase">
            <MapPin size={16} /> Database Regionale
         </div>
      </div>

    </div>
  );
}
