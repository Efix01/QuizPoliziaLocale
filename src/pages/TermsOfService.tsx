import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';

const TermsOfService: React.FC = () => {
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
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', margin: 0 }}>Termini di Servizio</h1>
                </header>

                <main style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    <section>
                        <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#3b82f6', marginBottom: '0.5rem' }}>QUIZ POLIZIA LOCALE</h1>
                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Ultimo aggiornamento: 04.04.2026</p>
                        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#f8fafc', marginTop: '1.5rem' }}>
                            Benvenuto in "Quiz Polizia Locale". Ti preghiamo di leggere attentamente i presenti Termini di Servizio prima di utilizzare l'applicazione.
                        </p>
                    </section>

                    <div style={{ padding: '1.5rem', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '16px', display: 'flex', gap: '1rem' }}>
                        <AlertCircle color="#f59e0b" style={{ flexShrink: 0 }} />
                        <p style={{ margin: 0, fontSize: '0.95rem', color: '#d97706', lineHeight: 1.5 }}>
                            <strong>DISCLAIMER:</strong> I contenuti sono forniti a scopo puramente didattico. L'uso dell'app non garantisce il superamento del concorso e non sostituisce lo studio sui testi ufficiali.
                        </p>
                    </div>

                    {[
                        { title: '1. Il Servizio', content: 'Quiz Polizia Locale è una piattaforma web indipendente dedicata alla preparazione tecnica per i concorsi pubblici negli Enti Locali. Forniamo simulazioni, quiz tematici e strumenti di monitoraggio.' },
                        { title: '2. Accettazione', content: 'Utilizzando il Servizio, dichiari di avere almeno 18 anni e di aver letto integralmente la nostra Privacy Policy.' },
                        { title: '3. Proprietà Intellettuale', content: 'Tutti i contenuti (testi, loghi, banca dati dei quiz) sono di proprietà esclusiva di Quiz Polizia Locale e sono protetti dalle leggi sul diritto d\'autore. È vietata la riproduzione o lo scraping dei dati.' },
                        { title: '4. Limitazione di Responsabilità', content: 'Il Proprietario non è responsabile per eventuali inesattezze nei quiz o per esiti negativi nelle prove concorsuali. L\'utente è tenuto a verificare la validità delle risposte nei testi di legge vigenti.' },
                    ].map((s, i) => (
                        <section key={i} style={{ background: '#1e293b', padding: '2rem', borderRadius: '24px', border: '1px solid #334155' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ color: '#3b82f6', opacity: 0.5 }}>#</span> {s.title}
                            </h2>
                            <p style={{ lineHeight: 1.7, margin: 0 }}>{s.content}</p>
                        </section>
                    ))}

                    <section style={{ textAlign: 'center', paddingTop: '2rem', borderTop: '1px solid #334155' }}>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            Per domande o segnalazioni riguardo ai Termini:
                        </p>
                        <a href="mailto:efix01@gmail.com" style={{ color: '#3b82f6', fontWeight: '700', textDecoration: 'none', fontSize: '1.1rem' }}>
                            efix01@gmail.com
                        </a>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default TermsOfService;
