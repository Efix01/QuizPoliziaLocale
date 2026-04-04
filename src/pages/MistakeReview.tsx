import { useProgress } from '../context/ProgressContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, RotateCcw, ShieldCheck, ArrowRight, Trash2, BookOpen } from 'lucide-react';

export default function MistakeReview() {
  const { erroriLog, resetErrori } = useProgress();
  const navigate = useNavigate();

  const mistakesList = Object.entries(erroriLog).map(([id, stats]) => ({
      id,
      ...stats
  })).sort((a, b) => b.lastError.localeCompare(a.lastError));

  const handleReviewAll = () => {
    // In un'app reale, filtreremmo le domande del database per caricare solo gli errori.
    // Qui navigheremo al QuizBuilder o simuleremo l'avvio.
    navigate('/quiz-builder');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      
      <header className="max-w-4xl mx-auto mb-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 shadow-sm transition-all">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase underline decoration-red-500 decoration-4 underline-offset-8">Centro <span className="text-red-500">Revisione</span></h1>
        </div>
        {mistakesList.length > 0 && (
          <button 
            onClick={resetErrori}
            className="flex items-center gap-2 text-slate-400 font-bold hover:text-red-600 transition-colors p-2 text-sm uppercase tracking-widest"
          >
            <Trash2 size={16} /> Pulisci Log
          </button>
        )}
      </header>

      <main className="max-w-4xl mx-auto space-y-8">
        
        {/* Intro Card */}
        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-3xl rounded-full" />
           <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
              <div className="text-center md:text-left">
                  <h3 className="text-sm font-black text-red-400 uppercase tracking-[0.2em] mb-2">Analisi Critica Lacune</h3>
                  <div className="text-6xl font-black mb-4 tracking-tighter">{mistakesList.length} <span className="text-2xl text-slate-400">Errori Attivi</span></div>
                  <p className="text-slate-400 font-medium max-w-sm">Revisionare i propri errori è il modo più veloce per aumentare l'Indice di Prontezza Nazionale.</p>
              </div>
              <button 
                disabled={mistakesList.length === 0}
                onClick={handleReviewAll}
                className="px-10 py-5 bg-white text-slate-900 rounded-3xl font-black text-xl hover:bg-slate-50 transition-all flex items-center gap-3 shadow-xl active:scale-95 disabled:opacity-20"
              >
                Ripassa Ora <RotateCcw size={24} />
              </button>
           </div>
        </div>

        {/* List Areas */}
        <div className="space-y-4 pb-20">
            <AnimatePresence mode="popLayout">
                {mistakesList.length > 0 ? (
                    mistakesList.map((m, i) => (
                        <motion.div 
                            key={m.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white border border-slate-200 p-6 rounded-3xl flex items-center justify-between group hover:shadow-xl transition-all"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center text-2xl font-black">
                                   !
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-slate-900 leading-none mb-1 uppercase tracking-tight">ID: {m.id.split('-')[0]}</h4>
                                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                                        <span className="flex items-center gap-1"><BookOpen size={10} /> {m.count} Occorrenze</span>
                                        <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                        <span>Ultimo errore: {new Date(m.lastError).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => navigate('/quiz-builder')} className="p-3 bg-slate-50 text-slate-300 rounded-xl hover:bg-slate-900 hover:text-white transition-all group-hover:translate-x-1">
                                <ArrowRight size={20} />
                            </button>
                        </motion.div>
                    ))
                ) : (
                    <div className="py-20 text-center space-y-6">
                        <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                            <ShieldCheck size={48} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2 italic">Registro Pulito</h3>
                            <p className="text-slate-400 font-medium">Nessun errore rilevato nelle ultime sessioni. Sei sulla strada giusta per il concorso.</p>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>

      </main>
    </div>
  );
}
