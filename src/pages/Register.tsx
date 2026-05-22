import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginSchema } from '../context/AuthProvider';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle, MapPin } from 'lucide-react';
import Footer from '../components/Footer';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Stili comuni Elite
  const inputStyle = (withIcon?: boolean): React.CSSProperties => ({
    width: '100%',
    padding: withIcon ? '1rem 3rem 1rem 3rem' : '1rem 1.25rem',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '12px',
    color: '#f8fafc',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  });

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#cbd5e1',
    fontWeight: '600',
    fontSize: '0.95rem',
  };

  const buttonBaseStyle: React.CSSProperties = {
    width: '100%',
    padding: '1rem',
    borderRadius: '12px',
    fontWeight: '700',
    fontSize: '1.05rem',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    border: 'none',
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: field === 'email' ? value.toLowerCase().trim() : value }));
    setError(null);
  };

  const validateForm = (): boolean => {
    // Email validation tramite Zod (SSOT)
    const emailResult = LoginSchema.shape.email.safeParse(formData.email);
    if (!emailResult.success) {
      setError(emailResult.error.issues[0]?.message || 'Email non valida');
      return false;
    }
    
    // Password validation (min 8 characters)
    if (formData.password.length < 8) {
      setError('La password deve avere almeno 8 caratteri');
      return false;
    }
    
    // Confirm password must match
    if (formData.password !== formData.confirmPassword) {
      setError('Le password non coincidono');
      return false;
    }

    // Name validation
    if (formData.firstName.trim().length < 2) {
      setError('Inserisci il tuo nome (almeno 2 caratteri)');
      return false;
    }

    if (formData.lastName.trim().length < 2) {
      setError('Inserisci il tuo cognome (almeno 2 caratteri)');
      return false;
    }

    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const displayName = `${formData.firstName} ${formData.lastName}`.trim();
      await register(formData.email, formData.password, displayName);
      setIsSuccess(true);
      
      setTimeout(() => {
        navigate('/onboarding');
      }, 1500);

    } catch (err) {
      console.error('Errore registrazione:', err);
      const errorMsg = err instanceof Error ? err.message : 'Errore nella creazione dell\'account. Riprova.';
      setError(errorMsg);
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 1.5rem 3rem', position: 'relative', overflow: 'hidden' }}>
      {/* Sfondo decorativo */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '-20%', width: '450px', height: '450px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      <div style={{ 
        position: 'relative', 
        zIndex: 1,
        maxWidth: '500px', 
        width: '100%',
      }}>
        
        {/* Card principale */}
        <div style={{
          background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid #334155',
          borderRadius: '24px',
          padding: '2.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(59, 130, 246, 0.1)',
        }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <img src="/logo_quiz_pol_locale.png" alt="Quiz Polizia Locale" style={{ height: '72px', objectFit: 'contain', marginBottom: '1.25rem' }} />
            
            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 0.5rem 0', color: '#f8fafc', letterSpacing: '-0.02em' }}>
              Crea il tuo account
            </h1>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '1.05rem', lineHeight: 1.5 }}>
              Inizia subito la tua preparazione al concorso
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister}>
            {error && (
              <div style={{
                background: '#ef444415',
                border: '1px solid #ef4444',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.5rem',
                color: '#fecaca',
                fontSize: '0.95rem',
              }}>
                <AlertCircle size={20} color="#ef4444" />
                <span>{error}</span>
              </div>
            )}

            {isSuccess && (
              <div style={{
                background: '#10b98115',
                border: '1px solid #10b981',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.5rem',
                color: '#bbf7d0',
                fontSize: '0.95rem',
              }}>
                <CheckCircle size={20} color="#10b981" />
                <span>Account creato! Reindirizzamento...</span>
              </div>
            )}

            {/* Nome e Cognome in riga */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label htmlFor="firstName" style={labelStyle}>
                  Nome
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={20} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    id="firstName"
                    type="text"
                    placeholder="Mario"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    style={{ ...inputStyle(true), paddingLeft: '3rem' }}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="lastName" style={labelStyle}>
                  Cognome
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={20} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Rossi"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    style={{ ...inputStyle(true), paddingLeft: '3rem' }}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="email" style={labelStyle}>
                Indirizzo Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={20} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  id="email"
                  type="email"
                  placeholder="nome@esempio.it"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  style={{ ...inputStyle(true), paddingLeft: '3rem' }}
                  required
                  disabled={isLoading}
                />
              </div>
              <p style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ color: '#f59e0b' }}>⚠</span>
                Usa un'email personale (Gmail, ecc.). Le email istituzionali potrebbero non ricevere le notifiche.
              </p>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="password" style={labelStyle}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimo 8 caratteri"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  style={{ ...inputStyle(true), paddingRight: '3rem' }}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '0.5rem',
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {/* Info sicurezza */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.85rem', color: formData.password.length >= 8 ? '#22c55e' : '#ef4444' }}>
                <MapPin size={14} />
                <span>{formData.password.length >= 8 ? '✅ Password sicura' : '⚠️ Usa almeno 8 caratteri'}</span>
              </div>
            </div>

            {/* Conferma Password */}
            <div style={{ marginBottom: '2rem' }}>
              <label htmlFor="confirmPassword" style={labelStyle}>
                Conferma Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Ripeti la password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  style={{ ...inputStyle(true), paddingRight: '3rem' }}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '0.5rem',
                  }}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Pulsante Registrati */}
            <button
              className="btn-register"
              type="submit"
              style={{
                ...buttonBaseStyle,
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: '#fff',
                boxShadow: isLoading ? 'none' : '0 10px 20px -5px rgba(34, 197, 94, 0.3)',
                opacity: isLoading ? 0.7 : 1,
                pointerEvents: isLoading ? 'none' : 'auto',
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div style={{ width: '24px', height: '24px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  Creazione Account...
                </>
              ) : (
                <>
                  Registrati
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            {/* Footer links */}
            <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.95rem', color: '#94a3b8' }}>
              Hai già un account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  fontWeight: '600',
                  textDecoration: 'underline',
                  padding: '0',
                }}
              >
                Accedi
              </button>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <div style={{ textAlign: 'center', marginTop: '2rem', color: '#64748b', fontSize: '0.9rem' }}>
          I tuoi dati sono protetti • Criptazione end-to-end
        </div>
      </div>
      </main>

      <Footer />

    </div>
  );
};

export default Register;
