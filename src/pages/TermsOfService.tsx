import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const TermsOfService: React.FC = () => {
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
                        <h1 style={{ fontSize: '3rem', fontWeight: '900', color: '#f8fafc', lineHeight: 1.1, letterSpacing: '-0.03em', margin: 0 }}>
                            Termini di Servizio
                        </h1>
                        <p style={{ fontSize: '1.1rem', color: '#94a3b8', margin: 0 }}>
                            Ultimo aggiornamento: 04.04.2026
                        </p>
                    </motion.div>
                </section>

                <div style={{ padding: '1.5rem', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '16px', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <AlertCircle color="#d97706" size={24} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                    <p style={{ margin: 0, fontSize: '0.95rem', color: '#b45309', lineHeight: 1.6 }}>
                        <strong style={{ display: 'block', marginBottom: '0.25rem', fontSize: '1rem' }}>Disclaimer Importante</strong>
                        I contenuti di questa applicazione sono forniti a scopo puramente didattico. L'uso dell'app non garantisce il superamento del concorso e non sostituisce in alcun modo lo studio accurato sui testi ufficiali e sulle normative vigenti.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {[
                        { title: '1. Il Servizio', content: 'Quiz Polizia Locale è una piattaforma web indipendente dedicata alla preparazione tecnica per i concorsi pubblici negli Enti Locali. Forniamo simulazioni, quiz tematici e strumenti di monitoraggio delle prestazioni.' },
                        { title: '2. Accettazione', content: 'Utilizzando il Servizio, dichiari di aver letto e compreso i presenti Termini e la nostra Privacy Policy, accettandoli integralmente.' },
                        { title: '3. Proprietà Intellettuale', content: 'La struttura dell\'app, il codice sorgente e il database dei quiz elaborato sono di proprietà esclusiva di Quiz Polizia Locale. È severamente vietato lo scraping o l\'esportazione automatizzata dei dati per riutilizzo non autorizzato.' },
                        { title: '4. Limitazione di Responsabilità', content: 'Nonostante l\'impegno nel mantenere aggiornato il database, l\'autore non è responsabile per eventuali inesattezze nei quiz, refusi, o per esiti negativi nelle prove concorsuali. L\'utente è l\'unico responsabile della verifica delle risposte.' },
                    ].map((s, i) => (
                        <div key={i} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <CheckCircle size={20} color="#3b82f6" />
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
                                    {s.title}
                                </h2>
                            </div>
                            <p style={{ lineHeight: 1.7, color: '#cbd5e1', margin: 0 }}>{s.content}</p>
                        </div>
                    ))}
                </div>

                <footer style={{ textAlign: 'center', paddingTop: '3rem', borderTop: '1px solid #334155', paddingBottom: '4rem' }}>
                    <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '1rem' }}>
                        Hai dubbi sui Termini di Servizio?
                    </p>
                    <a href="mailto:efix01@gmail.com" style={{ color: '#3b82f6', fontWeight: '700', textDecoration: 'none', fontSize: '1.15rem' }}>
                        efix01@gmail.com
                    </a>
                </footer>

            </div>
        </div>
    );
};

export default TermsOfService;