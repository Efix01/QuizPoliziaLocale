import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CheckCircle, Scale, FileText, ShieldOff, RefreshCw, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const TermsOfService: React.FC = () => {
    const navigate = useNavigate();

    const sections = [
        {
            icon: FileText,
            iconColor: '#3b82f6',
            iconBg: 'rgba(59,130,246,0.12)',
            title: '1. Descrizione del Servizio',
            content: (
                <>
                    <p>SonixQuiz (di seguito "il Servizio" o "la Piattaforma") è un servizio digitale di preparazione concorsuale, gestito e distribuito da <strong style={{ color: '#f8fafc' }}>SonixQuiz</strong>, con sede in Italia.</p>
                    <p style={{ marginTop: '0.75rem' }}>Il Servizio offre:</p>
                    <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <li>Quiz tematici basati sulle materie oggetto dei concorsi per Agente di Polizia Locale</li>
                        <li>Simulazioni d'esame con criteri di valutazione analoghi a quelli ufficiali</li>
                        <li>Statistiche e monitoraggio dei progressi personali</li>
                        <li>Contenuti aggiornati in base alle normative nazionali, regionali e comunali</li>
                    </ul>
                    <p style={{ marginTop: '0.75rem' }}>Il Servizio è destinato esclusivamente a soggetti maggiorenni (età minima 18 anni) residenti in Italia.</p>
                </>
            ),
        },
        {
            icon: CheckCircle,
            iconColor: '#10b981',
            iconBg: 'rgba(16,185,129,0.12)',
            title: '2. Accettazione dei Termini',
            content: (
                <>
                    <p>Accedendo, registrandoti o utilizzando il Servizio, dichiari di aver letto, compreso e accettato integralmente i presenti Termini di Servizio, nonché la nostra <strong style={{ color: '#f8fafc' }}>Informativa sulla Privacy</strong>.</p>
                    <p style={{ marginTop: '0.75rem' }}>Se non accetti anche una sola delle condizioni qui stabilite, ti invitiamo a non utilizzare il Servizio. SonixQuiz si riserva il diritto di modificare i presenti Termini in qualsiasi momento; le modifiche saranno comunicate mediante avviso sulla Piattaforma e/o tramite e-mail. L'utilizzo continuato del Servizio successivamente alla pubblicazione delle modifiche costituisce accettazione delle stesse.</p>
                </>
            ),
        },
        {
            icon: AlertTriangle,
            iconColor: '#f59e0b',
            iconBg: 'rgba(245,158,11,0.12)',
            title: '3. Natura Didattica del Servizio — Disclaimer',
            content: (
                <>
                    <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1rem' }}>
                        <p style={{ color: '#fcd34d', fontWeight: 700, margin: '0 0 0.5rem', fontSize: '0.9rem' }}>⚠ Dichiarazione importante</p>
                        <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem', lineHeight: 1.7 }}>I contenuti di SonixQuiz sono forniti a scopo <strong style={{ color: '#f8fafc' }}>esclusivamente didattico e formativo</strong>. L'utilizzo del Servizio non garantisce né assicura il superamento di alcuna prova concorsuale.</p>
                    </div>
                    <p>In particolare:</p>
                    <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li>SonixQuiz <strong style={{ color: '#f8fafc' }}>non ha alcuna affiliazione ufficiale</strong> con Enti Locali, Comuni, Ministeri, Comandi di Polizia Locale, FORMEZ PA, RIPAM o qualsiasi altra istituzione pubblica italiana.</li>
                        <li>I quiz e le simulazioni sono elaborati sulla base di fonti normative pubbliche; nonostante l'impegno a mantenerli aggiornati, SonixQuiz <strong style={{ color: '#f8fafc' }}>non garantisce l'assoluta accuratezza, completezza o aggiornamento</strong> di tutti i contenuti.</li>
                        <li>L'utente è il solo responsabile della verifica dell'esattezza delle risposte mediante consultazione delle fonti normative ufficiali.</li>
                        <li>I criteri d'esame e i programmi concorsuali variano da ente a ente e possono essere modificati senza preavviso dalle amministrazioni competenti.</li>
                    </ul>
                </>
            ),
        },
        {
            icon: Scale,
            iconColor: '#818cf8',
            iconBg: 'rgba(129,140,248,0.12)',
            title: '4. Proprietà Intellettuale',
            content: (
                <>
                    <p>Tutti i contenuti presenti sulla Piattaforma — inclusi, a titolo esemplificativo, il codice sorgente, il database delle domande, i testi, le interfacce grafiche, i loghi e i marchi — sono di proprietà esclusiva di <strong style={{ color: '#f8fafc' }}>SonixQuiz</strong> o dei rispettivi titolari e sono protetti dalle normative italiane ed europee in materia di diritto d'autore (L. 633/1941) e proprietà intellettuale.</p>
                    <p style={{ marginTop: '0.75rem' }}>È espressamente vietato:</p>
                    <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <li>Riprodurre, distribuire o vendere i contenuti della Piattaforma senza autorizzazione scritta</li>
                        <li>Effettuare scraping automatizzato o raccolta massiva di dati (data harvesting)</li>
                        <li>Decompilare, decodificare o modificare il software della Piattaforma</li>
                        <li>Utilizzare il marchio "SonixQuiz" senza preventiva autorizzazione scritta</li>
                    </ul>
                </>
            ),
        },
        {
            icon: ShieldOff,
            iconColor: '#ef4444',
            iconBg: 'rgba(239,68,68,0.1)',
            title: '5. Limitazione di Responsabilità',
            content: (
                <>
                    <p>Nei limiti consentiti dalla legge italiana applicabile, SonixQuiz non sarà responsabile per:</p>
                    <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li>Danni diretti o indiretti derivanti dall'uso o dall'impossibilità di usare il Servizio</li>
                        <li>Eventuali inesattezze, omissioni o aggiornamenti non tempestivi nei contenuti dei quiz</li>
                        <li>L'esito negativo di prove concorsuali, indipendentemente dall'utilizzo del Servizio</li>
                        <li>Interruzioni del servizio dovute a manutenzione, guasti tecnici o cause di forza maggiore</li>
                        <li>Danni derivanti da accessi non autorizzati ai dati dell'utente imputabili a cause esterne alla Piattaforma</li>
                    </ul>
                    <p style={{ marginTop: '0.75rem' }}>Il Servizio è fornito <em>"così com'è"</em> (as-is), senza garanzie espresse o implicite di idoneità a uno scopo specifico.</p>
                </>
            ),
        },
        {
            icon: RefreshCw,
            iconColor: '#06b6d4',
            iconBg: 'rgba(6,182,212,0.1)',
            title: '6. Sospensione e Cessazione del Servizio',
            content: (
                <>
                    <p>SonixQuiz si riserva il diritto di sospendere o cessare l'erogazione del Servizio, in tutto o in parte, in qualsiasi momento e senza obbligo di preavviso, per ragioni tecniche, commerciali o di manutenzione.</p>
                    <p style={{ marginTop: '0.75rem' }}>SonixQuiz potrà sospendere o cancellare l'account dell'utente in caso di:</p>
                    <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <li>Violazione dei presenti Termini</li>
                        <li>Utilizzo fraudolento o abuso del Servizio</li>
                        <li>Tentativi di accesso non autorizzato ai sistemi della Piattaforma</li>
                    </ul>
                </>
            ),
        },
        {
            icon: Scale,
            iconColor: '#a78bfa',
            iconBg: 'rgba(167,139,250,0.1)',
            title: '7. Legge Applicabile e Foro Competente',
            content: (
                <>
                    <p>I presenti Termini sono regolati dalla <strong style={{ color: '#f8fafc' }}>legge italiana</strong>. Per qualsiasi controversia relativa all'interpretazione, validità o esecuzione dei presenti Termini, le parti si impegnano a ricercare in primo luogo una soluzione amichevole.</p>
                    <p style={{ marginTop: '0.75rem' }}>Qualora non fosse possibile raggiungere un accordo, il foro territorialmente competente sarà quello del luogo di residenza o domicilio del consumatore, ai sensi del Codice del Consumo (D.Lgs. 206/2005), ove applicabile.</p>
                    <p style={{ marginTop: '0.75rem' }}>Per controversie con utenti professionali o aziende, il foro esclusivamente competente è quello di <strong style={{ color: '#f8fafc' }}>Italia</strong>.</p>
                </>
            ),
        },
    ];

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
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '100px', padding: '0.4rem 1rem', marginBottom: '1.5rem' }}>
                        <Scale size={14} color="#f59e0b" />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Termini di Servizio & Disclaimer</span>
                    </div>
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 1.25rem' }}>
                        Condizioni generali<br />
                        <span style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            di utilizzo del Servizio.
                        </span>
                    </h1>
                    <p style={{ fontSize: '1rem', lineHeight: 1.75, color: '#64748b', margin: '0 0 0.5rem' }}>
                        Leggere attentamente prima di accedere o utilizzare la Piattaforma SonixQuiz.
                    </p>
                    <p style={{ fontSize: '0.82rem', color: '#334155', margin: 0 }}>
                        Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                </motion.section>

                {/* Sezioni */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
                    {sections.map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06, duration: 0.4 }}
                            style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '1.75rem' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                                <div style={{ background: s.iconBg, borderRadius: '10px', padding: '0.6rem', color: s.iconColor, flexShrink: 0 }}>
                                    <s.icon size={18} />
                                </div>
                                <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#f8fafc', margin: 0, letterSpacing: '-0.01em' }}>{s.title}</h2>
                            </div>
                            <div style={{ lineHeight: 1.75, color: '#94a3b8', fontSize: '0.92rem' }}>
                                {s.content}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Contatti */}
                <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '1.75rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ background: 'rgba(59,130,246,0.12)', borderRadius: '10px', padding: '0.75rem', color: '#3b82f6', flexShrink: 0 }}>
                        <Mail size={20} />
                    </div>
                    <div>
                        <p style={{ fontWeight: 700, color: '#fff', margin: '0 0 0.25rem', fontSize: '0.95rem' }}>Domande sui Termini di Servizio?</p>
                        <a href="mailto:info@sonixquiz.it" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.9rem' }}>info@sonixquiz.it</a>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid #1e293b', textAlign: 'center', color: '#334155', fontSize: '0.82rem' }}>
                    &copy; {new Date().getFullYear()} SonixQuiz — Tutti i diritti riservati. I presenti Termini sono regolati dalla legge italiana.
                </div>

            </div>
        </div>
    );
};

export default TermsOfService;
