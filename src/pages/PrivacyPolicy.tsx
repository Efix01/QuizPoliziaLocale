import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', color: '#cbd5e1', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                
                <header style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button 
                        onClick={() => navigate(-1)} 
                        style={{ background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '0.6rem', borderRadius: '12px', cursor: 'pointer' }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', margin: 0 }}>Privacy Policy</h1>
                </header>

                <main style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <section style={{ textAlign: 'center', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '3rem 2rem', borderRadius: '32px', border: '1px solid #334155', marginBottom: '1rem' }}>
                        <Shield size={48} color="#3b82f6" style={{ marginBottom: '1.5rem' }} />
                        <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#fff', marginBottom: '1rem' }}>I tuoi dati sono al sicuro.</h1>
                        <p style={{ fontSize: '1.1rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>
                            Trattiamo le tue informazioni con il massimo rispetto, in conformità con il GDPR (Regolamento UE 2016/679).
                        </p>
                    </section>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {[
                            { icon: Lock, title: '1. Titolare del Trattamento', content: 'Efisio Pala - efix01@gmail.com - Terralba (OR). Contattaci per qualsiasi richiesta relativa ai tuoi diritti privacy.' },
                            { icon: Eye, title: '2. Dati Raccolti', content: 'Dati di autenticazione (email, nome) gestiti tramite Firebase Auth e Dati di studio (progressi, voti) salvati localmente o sincronizzati sul database sicuro.' },
                            { icon: Shield, title: '3. Finalità', content: 'Fornitura del servizio di quiz, salvataggio dei progressi personali e manutenzione tecnica per garantire la sicurezza del sistema.' },
                        ].map((s, i) => (
                            <div key={i} style={{ background: '#1e293b', padding: '2rem', borderRadius: '24px', border: '1px solid #334155', display: 'flex', gap: '1.5rem' }}>
                                <div style={{ color: '#3b82f6' }}><s.icon size={24} /></div>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', marginBottom: '0.75rem' }}>{s.title}</h3>
                                    <p style={{ margin: 0, lineHeight: 1.6 }}>{s.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <section style={{ marginTop: '2rem' }}>
                         <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', marginBottom: '1.5rem' }}>Tabella Cookie</h2>
                         <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', overflowX: 'auto' }}>
                             <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
                                 <thead>
                                     <tr style={{ background: '#0f172a' }}>
                                         <th style={{ padding: '1rem', color: '#3b82f6' }}>Nome</th>
                                         <th style={{ padding: '1rem', color: '#3b82f6' }}>Tipo</th>
                                         <th style={{ padding: '1rem', color: '#3b82f6' }}>Scadenza</th>
                                     </tr>
                                 </thead>
                                 <tbody>
                                     {[
                                         { name: 'Firebase Token', type: 'Tecnico (Auth)', time: 'Sessione' },
                                         { name: 'progressi-store', type: 'Database Locale', time: 'Persistente' },
                                         { name: 'cookie-consent', type: 'Tecnico', time: '1 anno' }
                                     ].map((row, idx) => (
                                         <tr key={idx} style={{ borderTop: '1px solid #334155' }}>
                                             <td style={{ padding: '1rem', fontWeight: '700' }}>{row.name}</td>
                                             <td style={{ padding: '1rem' }}>{row.type}</td>
                                             <td style={{ padding: '1rem', color: '#64748b' }}>{row.time}</td>
                                         </tr>
                                     ))}
                                 </tbody>
                             </table>
                         </div>
                    </section>

                    <button 
                        onClick={() => { localStorage.removeItem('quiz-pl-cookie-consent'); window.location.reload(); }}
                        style={{ marginTop: '1rem', padding: '1rem', background: 'transparent', border: '1px dashed #334155', color: '#64748b', borderRadius: '12px', cursor: 'pointer', fontWeight: '600' }}
                    >
                        🍪 Modifica Preferenze Cookie
                    </button>

                    <footer style={{ marginTop: '4rem', padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                        &copy; 2026 Quiz Polizia Locale d'Élite • Progetto indipendente a scopo didattico.
                    </footer>
                </main>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
