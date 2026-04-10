import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { loginUserSchema } from '../types/auth'; 
import Footer from '../components/Footer';

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validazione locale
      const validation = loginUserSchema.safeParse({ email, password });
      if (!validation.success) {
        setError(validation.error.issues[0]?.message || 'Errore di validazione');
        setIsLoading(false);
        return;
      }

      await login(email, password);
      setIsSuccess(true);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);

    } catch (err) {
      console.error('Errore login:', err);
      setError('Credenziali non valide. Riprova.');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await loginWithGoogle();
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      console.error('Errore Google login:', err);
      const errorMsg = err instanceof Error ? err.message : 'Errore durante l\'accesso con Google.';
      setError(errorMsg);
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    if (field === 'email') setEmail(value.toLowerCase().trim());
    else setPassword(value);
    setError(null);
  };

  // Stili comuni Elite
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '1rem 1.25rem',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '12px',
    color: '#f8fafc',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '0.75rem',
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

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', overflowY: 'auto' }}>
      {/* Sfondo decorativo */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-50%', right: '-20%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-30%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      <div style={{ 
        position: 'relative', 
        zIndex: 1,
        maxWidth: '440px', 
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
            <div style={{ 
              display: 'inline-flex',
              alignItems: 'center', 
              justifyContent: 'center',
              width: '72px', 
              height: '72px', 
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              borderRadius: '20px',
              marginBottom: '1.5rem',
              boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.4)'
            }}>
              <ShieldCheck size={36} color="#fff" />
            </div>
            
            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 0.5rem 0', color: '#f8fafc', letterSpacing: '-0.02em' }}>
              Accedi a Elite
            </h1>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '1.05rem', lineHeight: 1.5 }}>
              Preparati al concorso con il sistema più avanzato
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin}>
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
                <span>Accesso effettuato! Reindirizzamento...</span>
              </div>
            )}

            {/* Campo Email */}
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
                  value={email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  style={{ ...inputStyle, paddingLeft: '3rem' }}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Campo Password */}
            <div style={{ marginBottom: '2rem' }}>
              <label htmlFor="password" style={labelStyle}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Inserisci la tua password"
                  value={password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  style={{ ...inputStyle, paddingLeft: '3rem', paddingRight: '3rem' }}
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
            </div>

            {/* Pulsante Login */}
            <button
              className="btn-primary"
              type="submit"
              style={{
                ...buttonBaseStyle,
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: '#fff',
                boxShadow: isLoading ? 'none' : '0 10px 20px -5px rgba(59, 130, 246, 0.3)',
                opacity: isLoading ? 0.7 : 1,
                pointerEvents: isLoading ? 'none' : 'auto',
                marginBottom: '1.5rem'
              }}
              disabled={isLoading}
            >
              {isLoading && !isSuccess ? (
                <>
                  <div style={{ width: '24px', height: '24px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  Accesso...
                </>
              ) : (
                <>
                  Accedi
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1, height: '1px', background: '#334155' }} />
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>oppure</span>
              <div style={{ flex: 1, height: '1px', background: '#334155' }} />
            </div>

            {/* Pulsante Google */}
            <button
              className="btn-google"
              type="button"
              onClick={handleGoogleLogin}
              style={{
                ...buttonBaseStyle,
                background: '#fff',
                color: '#1e293b',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0',
              }}
              disabled={isLoading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Accedi con Google
            </button>

            {/* Footer links */}
            <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.95rem', color: '#94a3b8' }}>
              Non hai un account?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
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
                Registrati
              </button>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <div style={{ textAlign: 'center', marginTop: '2rem', color: '#64748b', fontSize: '0.9rem' }}>
          Protocollato • Tutti i dati sono criptati e sicuri
        </div>
      </div>

      <Footer />

      {/* CSS Animation & Hover */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }
        .btn-google:hover {
          transform: translateY(-2px);
          background-color: #f8fafc !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
        }
      `}} />
    </div>
  );
};

export default Login;
