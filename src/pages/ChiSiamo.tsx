import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Target, BookOpen, Users, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const ChiSiamo: React.FC = () => {
    const navigate = useNavigate();

    const fadeUp = (delay = 0) => ({
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, delay },
    });

    return (
        <div style={{ minHeight: '100vh', background: '#020617', color: '#f8fafc', fontFamily: '"Outfit", "Inter", sans-serif' }}>
            <div style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem 1.5rem 6rem' }}>

                {/* Back */}
                <div style={{ paddingTop: '2rem', marginBottom: '3rem' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '0.6rem 1rem', borderRadius: '10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', transition: 'all 0.2s' }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = '#64748b'; e.currentTarget.style.color = '#f8fafc'; }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.color = '#94a3b8'; }}
                    >
                        <ArrowLeft size={16} /> Torna indietro
                    </button>
                </div>

                {/* Hero */}
                <motion.section {...fadeUp(0)} style={{ marginBottom: '4rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '100px', padding: '0.4rem 1rem', marginBottom: '1.5rem' }}>
                        <ShieldCheck size={14} color="#3b82f6" />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Chi Siamo</span>
                    </div>
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 1.25rem' }}>
                        SonixQuiz:<br />
                        <span style={{ background: 'linear-gradient(135deg, #60a5fa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            la preparazione che cambia le carriere.
                        </span>
                    </h1>
                    <p style={{ fontSize: '1.15rem', lineHeight: 1.75, color: '#94a3b8', margin: 0, maxWidth: '620px' }}>
                        SonixQuiz è una piattaforma italiana di preparazione concorsuale, nata per aiutare i candidati che aspirano a indossare la divisa della Polizia Locale. Non siamo un editore tradizionale: siamo un team che crede nel potere della tecnologia applicata alla formazione pubblica.
                    </p>
                </motion.section>

                {/* Mission */}
                <motion.section {...fadeUp(0.1)} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '2.5rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                        <div style={{ flexShrink: 0, background: 'rgba(59,130,246,0.12)', borderRadius: '12px', padding: '0.75rem', color: '#3b82f6' }}>
                            <Target size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', margin: '0 0 1rem', letterSpacing: '-0.01em' }}>La nostra missione</h2>
                            <p style={{ lineHeight: 1.75, color: '#94a3b8', margin: '0 0 1rem' }}>
                                Ogni anno migliaia di candidati affrontano concorsi per la Polizia Locale con strumenti inadeguati: fotocopie datate, manuali generici, quiz non calibrati sul loro bando specifico. SonixQuiz nasce per risolvere esattamente questo problema.
                            </p>
                            <p style={{ lineHeight: 1.75, color: '#94a3b8', margin: 0 }}>
                                Attraverso un sistema di quiz intelligente, aggiornato alle normative vigenti e personalizzato per Regione e Comune, offriamo ai candidati uno strumento di studio serio, moderno e realmente efficace.
                            </p>
                        </div>
                    </div>
                </motion.section>

                {/* Valori */}
                <motion.section {...fadeUp(0.15)} style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                        {[
                            {
                                icon: BookOpen,
                                color: '#3b82f6',
                                bg: 'rgba(59,130,246,0.1)',
                                title: 'Contenuti Verificati',
                                text: 'Ogni domanda è elaborata a partire da fonti ufficiali: Codice della Strada, TUEL, Leggi Regionali e Regolamenti Comunali. Nessuna improvvisazione.'
                            },
                            {
                                icon: Users,
                                color: '#10b981',
                                bg: 'rgba(16,185,129,0.1)',
                                title: 'Orientato al candidato',
                                text: 'Non vendiamo corsi, non promettiamo scorciatoie. Forniamo gli strumenti: sei tu a fare la differenza con il tuo impegno.'
                            },
                        ].map((v, i) => (
                            <div key={i} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '1.75rem' }}>
                                <div style={{ background: v.bg, borderRadius: '10px', padding: '0.65rem', display: 'inline-flex', marginBottom: '1rem', color: v.color }}>
                                    <v.icon size={20} />
                                </div>
                                <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', margin: '0 0 0.6rem', letterSpacing: '-0.01em' }}>{v.title}</h3>
                                <p style={{ margin: 0, lineHeight: 1.65, color: '#64748b', fontSize: '0.9rem' }}>{v.text}</p>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* Disclaimer indipendenza */}
                <motion.section {...fadeUp(0.2)} style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '16px', padding: '1.75rem', marginBottom: '2rem' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                        Dichiarazione di indipendenza
                    </p>
                    <p style={{ lineHeight: 1.7, color: '#94a3b8', fontSize: '0.92rem', margin: 0 }}>
                        SonixQuiz è un progetto privato e <strong style={{ color: '#cbd5e1' }}>non ha alcuna affiliazione ufficiale</strong> con Enti Locali, Ministeri, Comandi di Polizia Locale o altre istituzioni pubbliche. I contenuti sono forniti a scopo esclusivamente didattico e formativo. L'utilizzo della piattaforma non garantisce né assicura il superamento di alcuna prova concorsuale.
                    </p>
                </motion.section>

                {/* Contatti */}
                <motion.section {...fadeUp(0.25)} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '1.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <Mail size={18} color="#3b82f6" />
                        <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', margin: 0 }}>Contattaci</h3>
                    </div>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.65, margin: '0 0 0.75rem' }}>
                        Per qualsiasi domanda, segnalazione o collaborazione, scrivi al nostro team:
                    </p>
                    <a href="mailto:info@sonixquiz.it" style={{ color: '#3b82f6', fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem' }}>
                        info@sonixquiz.it
                    </a>
                </motion.section>

                {/* Footer */}
                <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid #1e293b', textAlign: 'center', color: '#334155', fontSize: '0.82rem' }}>
                    &copy; {new Date().getFullYear()} SonixQuiz — Tutti i diritti riservati. Italia.
                </div>

            </div>
        </div>
    );
};

export default ChiSiamo;
