import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Unlock, Cpu, Scale, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const ChiSiamo: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '4rem' }}>
                
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
                            La Nostra Storia
                        </h1>
                        <p style={{ fontSize: '1.25rem', lineHeight: 1.6, color: '#cbd5e1', margin: 0 }}>
                            Quiz Polizia Locale d'Elite è il progetto indipendente per la preparazione concorsuale sul territorio nazionale.
                        </p>
                    </motion.div>
                </section>

                <section style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)' }}>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <div style={{ width: '48px', height: '48px', background: '#f0f9ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#3b82f6' }}>
                            <MapPin size={24} />
                        </div>
                        <div style={{ flex: 1, minWidth: '280px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#f8fafc', marginBottom: '1rem' }}>Sempre al fianco dei candidati.</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', lineHeight: 1.7, color: '#cbd5e1' }}>
                                <p>Ciao, sono <strong>Efisio</strong>.</p>
                                <p>Nella vita professionale sono un <strong>Agente della Polizia Locale</strong>. Nel tempo libero, unisco la mia esperienza operativa alla passione per lo sviluppo software e l'intelligenza artificiale.</p>
                                <p>Ho creato questa piattaforma perché conosco la fatica e la dedizione richieste per indossare questa divisa. Il mio obiettivo è rendere lo studio accessibile, moderno e soprattutto efficace per chiunque voglia servire la comunità.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {[
                        { icon: Unlock, title: '100% Libero', text: 'Nessun abbonamento, nessuna barriera. La formazione deve essere un diritto di tutti i futuri colleghi.' },
                        { icon: Cpu, title: 'A.I. Powered', text: 'Algoritmi avanzati elaborano i contenuti d\'esame per offrirti simulatori sempre aggiornati e precisi.' }
                    ].map((f, i) => (
                        <div key={i} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ color: '#3b82f6' }}><f.icon size={24} /></div>
                            <h4 style={{ fontWeight: '700', color: '#f8fafc', fontSize: '1.25rem', margin: 0 }}>{f.title}</h4>
                            <p style={{ margin: 0, lineHeight: 1.6, color: '#94a3b8' }}>{f.text}</p>
                        </div>
                    ))}
                </div>

                <section style={{ border: '1px solid #334155', borderRadius: '16px', padding: '2rem', background: '#0f172a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#94a3b8' }}>
                        <Scale size={20} />
                        <span style={{ fontWeight: '700', letterSpacing: '0.05em', fontSize: '0.85rem', textTransform: 'uppercase' }}>Informativa di Indipendenza</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem', color: '#94a3b8', lineHeight: 1.6 }}>
                        <p>Questo progetto è un esperimento tecnologico privato e <strong>non ha alcuna affiliazione ufficiale</strong> con Enti Locali, Comandi o Forze dell'Ordine.</p>
                        <p>L'autore non rappresenta l'Ente di appartenenza; l'app è frutto di iniziativa personale a scopo didattico. L'uso della piattaforma non garantisce l'esito dei concorsi ufficiali.</p>
                    </div>
                </section>

                <footer style={{ textAlign: 'center', padding: '2rem 0 4rem 0' }}>
                    <div style={{ color: '#ef4444', marginBottom: '1rem' }}><Heart size={28} /></div>
                    <p style={{ fontStyle: 'italic', fontSize: '1.25rem', color: '#f8fafc', margin: 0 }}>"In bocca al lupo, futuro collega."</p>
                    <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>— Efisio</p>
                </footer>

            </div>
        </div>
    );
};

export default ChiSiamo;