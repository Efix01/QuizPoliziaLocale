import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Unlock, Scale, Shield, Heart, Cpu, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const ChiSiamo: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', color: '#cbd5e1', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                
                {/* Custom Header */}
                <header style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button 
                        onClick={() => navigate(-1)} 
                        style={{ background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '0.6rem', borderRadius: '12px', cursor: 'pointer' }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', margin: 0 }}>La Nostra Storia</h1>
                </header>

                {/* Hero / Mission */}
                <section style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}
                    >
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '24px', padding: '1.5rem' }}>
                            <Shield size={48} />
                        </div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#fff', lineHeight: 1.2, margin: 0 }}>
                            Passione per la Divisa,<br />
                            <span style={{ color: '#3b82f6' }}>Votata all'Innovazione</span>
                        </h2>
                        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>
                            Quiz Polizia Locale d'Elite è il progetto indipendente leader per la preparazione concorsuale sul territorio nazionale.
                        </p>
                    </motion.div>
                </section>

                {/* Bio Card */}
                <section style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: '1px solid #334155', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)' }}>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <div style={{ width: '64px', height: '64px', background: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff' }}>
                            <MapPin size={32} />
                        </div>
                        <div style={{ flex: 1, minWidth: '280px' }}>
                            <p style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', marginBottom: '1rem' }}>Sempre al fianco dei candidati.</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', lineHeight: 1.7 }}>
                                <p>Ciao, sono <strong>Efisio</strong>.</p>
                                <p>Nella vita professionale sono un <strong>Agente della Polizia Locale</strong>. Nel tempo libero, unisco la mia esperienza operativa alla passione per lo sviluppo software e l'intelligenza artificiale.</p>
                                <p>Ho creato questa piattaforma perché conosco la fatica e la dedizione richieste per indossare questa divisa. Il mio obiettivo è rendere lo studio accessibile, moderno e soprattutto efficace per chiunque voglia servire la comunità.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {[
                        { icon: Unlock, title: '100% Libero', text: 'Nessun abbonamento, nessuna barriera. La formazione deve essere un diritto di tutti i futuri colleghi.' },
                        { icon: Cpu, title: 'A.I. Powered', text: 'Algoritmi avanzati elaborano i contenuti d\'esame per offrirti simulatori sempre aggiornati e precisi.' }
                    ].map((f, i) => (
                        <div key={i} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ color: '#3b82f6' }}><f.icon size={28} /></div>
                            <h4 style={{ fontWeight: '800', color: '#fff', fontSize: '1.2rem', margin: 0 }}>{f.title}</h4>
                            <p style={{ margin: 0, lineHeight: 1.6, color: '#94a3b8' }}>{f.text}</p>
                        </div>
                    ))}
                </div>

                {/* Legal / Independence Box */}
                <section style={{ border: '1px dashed #334155', borderRadius: '24px', padding: '2rem', background: 'rgba(59, 130, 246, 0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: '#3b82f6' }}>
                        <Scale size={20} />
                        <span style={{ fontWeight: '800', letterSpacing: '0.1em', fontSize: '0.85rem' }}>INFORMATIVA DI INDIPENDENZA</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6 }}>
                        <p>Questo progetto è un esperimento tecnologico privato e <strong>non ha alcuna affiliazione ufficiale</strong> con Enti Locali, Comandi o Forze dell'Ordine.</p>
                        <p>L'autore non rappresenta l'Ente di appartenenza; l'app è frutto di iniziativa personale a scopo didattico. L'uso della piattaforma non garantisce l'esito dei concorsi ufficiali.</p>
                    </div>
                </section>

                <footer style={{ textAlign: 'center', padding: '2rem 0 4rem 0' }}>
                    <div style={{ color: '#ef4444', marginBottom: '1rem' }}><Heart size={28} /></div>
                    <p style={{ fontStyle: 'italic', fontSize: '1.2rem', color: '#f8fafc', margin: 0 }}>"In bocca al lupo, futuro collega."</p>
                    <p style={{ color: '#64748b', marginTop: '0.5rem' }}>— Efisio</p>
                </footer>

            </div>
        </div>
    );
};

export default ChiSiamo;
