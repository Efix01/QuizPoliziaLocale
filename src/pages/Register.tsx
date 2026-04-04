import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { z } from 'zod'; // Skill sicurezza-quiz
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

// Schema di validazione Zod (Skill sicurezza-quiz)
const RegisterSchema = z.object({
  displayName: z.string().min(3, "Il nome deve contenere almeno 3 caratteri"),
  email: z.string().email("Inserisci un'email valida"),
  password: z.string().min(6, "La password deve contenere almeno 6 caratteri"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Le password non coincidono",
  path: ["confirmPassword"],
});

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validazione Zod
    const result = RegisterSchema.safeParse({ displayName, email, password, confirmPassword });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setIsLoading(true);
    try {
      await register(email, password, displayName);
      navigate('/setup'); // Onboarding dopo registrazione
    } catch (err: any) {
      setError("Errore durante la creazione dell'account. Email già in uso?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Elite <span className="text-blue-600">PLUS</span></h1>
          <p className="text-slate-500 font-medium mt-2">Crea il tuo profilo agente gratuito.</p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-medium"
                  placeholder="Nome Cognome"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Email Istituzionale / Privata</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-medium"
                  placeholder="agente@polizialocale.it"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-medium"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Conferma</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-medium"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold"
              >
                ⚠️ {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-5 bg-blue-600 text-white rounded-3xl font-black text-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-200 hover:shadow-blue-300 disabled:opacity-50 group active:scale-95"
            >
              {isLoading ? 'Creazione Account...' : (
                <>
                  Inizia il Percorso <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
             <p className="text-slate-500 font-medium">Fai già parte degli agenti?</p>
             <Link to="/login" className="text-slate-900 font-bold hover:underline mt-1 inline-block">
                Accedi al tuo account
             </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
