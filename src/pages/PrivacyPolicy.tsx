import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

const PrivacyPolicy: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                
                <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '2rem' }}>
                    <button 
                        onClick={() => navigate(-1)} 
                        style={{ background: 'transparent', border: '1px solid #334155', color: '#cbd5e1', padding: '0.6rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <ArrowLeft size={18} /> Torna indietro
                    </button>
                </header>

                <section style={{ textAlign: 'left' }}>
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                    >
                        <div style={{ color: '#3b82f6', marginBottom: '0.5rem' }}><Shield size={40} /></div>
                        <h1 style={{ fontSize: '3rem', fontWeight: '900', color: '#f8fafc', lineHeight: 1.1, letterSpacing: '-0.03em', margin: 0 }}>
                            Privacy Policy
                        </h1>
                        <p style={{ fontSize: '1.25rem', lineHeight: 1.6, color: '#cbd5e1', margin: 0 }}>
                            I tuoi dati sono al sicuro. Trattiamo le tue informazioni con il massimo rispetto, in conformità con il GDPR (Regolamento UE 2016/679).
                        </p>
                    </motion.div>
                </section>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {[
                        { icon: Lock, title: '1. Titolare del Trattamento', content: 'Efisio Pala - efix01@gmail.com - Terralba (OR). Contattaci per qualsiasi richiesta relativa ai tuoi diritti privacy.' },
                        { icon: Eye, title: '2. Dati Raccolti', content: 'Dati di autenticazione (email, nome) gestiti tramite Firebase Auth e Dati di studio (progressi, voti) salvati localmente o sincronizzati sul database sicuro.' },
                        { icon: Shield, title: '3. Finalità', content: 'Fornitura del servizio di quiz, salvataggio dei progressi personali e manutenzione tecnica per garantire la sicurezza del sistema.' },
                    ].map((s, i) => (
                        <div key={i} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                            <div style={{ color: '#3b82f6', marginTop: '0.2rem' }}><s.icon size={24} /></div>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', margin: '0 0 0.5rem 0' }}>{s.title}</h3>
                                <p style={{ margin: 0, lineHeight: 1.6, color: '#cbd5e1' }}>{s.content}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <section style={{ marginTop: '1rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#f8fafc', marginBottom: '1.5rem' }}>Tabella Cookie</h2>
                    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#0f172a', borderBottom: '1px solid #334155' }}>
                                    <th style={{ padding: '1.25rem', color: '#94a3b8', fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nome</th>
                                    <th style={{ padding: '1.25rem', color: '#94a3b8', fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tipo</th>
                                    <th style={{ padding: '1.25rem', color: '#94a3b8', fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scadenza</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { name: 'Firebase Token', type: 'Tecnico (Auth)', time: 'Sessione' },
                                    { name: 'progressi-store', type: 'Database Locale', time: 'Persistente' },
                                    { name: 'cookie-consent', type: 'Tecnico', time: '1 anno' }
                                ].map((row, idx, arr) => (
                                    <tr key={idx} style={{ borderBottom: idx < arr.length - 1 ? '1px solid #334155' : 'none' }}>
                                        <td style={{ padding: '1.25rem', fontWeight: '600', color: '#f8fafc' }}>{row.name}</td>
                                        <td style={{ padding: '1.25rem', color: '#cbd5e1' }}>{row.type}</td>
                                        <td style={{ padding: '1.25rem', color: '#94a3b8' }}>{row.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <button 
                    onClick={() => { localStorage.removeItem('quiz-pl-cookie-consent'); window.location.reload(); }}
                    style={{ padding: '1rem', background: 'transparent', border: '1px dashed #334155', color: '#94a3b8', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', textAlign: 'center', transition: 'all 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.color = '#f8fafc'}
                    onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}
                >
                    🍪 Modifica Preferenze Cookie
                </button>

                <footer style={{ padding: '2rem 0', textAlign: 'center', color: '#64748b', fontSize: '0.95rem' }}>
                    &copy; 2026 Quiz Polizia Locale d'Élite • Progetto indipendente a scopo didattico.
                </footer>
            </div>
        </div>
    );
};

export default PrivacyPolicy;