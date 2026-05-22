import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, UserCheck, Trash2, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';

const Section: React.FC<{ icon: React.ElementType; iconColor: string; iconBg: string; title: string; children: React.ReactNode }> = ({ icon: Icon, iconColor, iconBg, title, children }) => {
    const [open, setOpen] = useState(true);
    return (
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', overflow: 'hidden' }}>
            <button
                onClick={() => setOpen(!open)}
                style={{ width: '100%', padding: '1.4rem 1.75rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
                <div style={{ background: iconBg, borderRadius: '10px', padding: '0.6rem', color: iconColor, flexShrink: 0 }}>
                    <Icon size={18} />
                </div>
                <span style={{ flex: 1, fontWeight: 700, fontSize: '1rem', color: '#f8fafc', letterSpacing: '-0.01em' }}>{title}</span>
                {open ? <ChevronUp size={16} color="#475569" /> : <ChevronDown size={16} color="#475569" />}
            </button>
            {open && (
                <div style={{ padding: '0 1.75rem 1.5rem', borderTop: '1px solid #1e293b' }}>
                    <div style={{ paddingTop: '1.25rem', lineHeight: 1.75, color: '#94a3b8', fontSize: '0.92rem' }}>
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
};

const PrivacyPolicy: React.FC = () => {
    const navigate = useNavigate();

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
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '100px', padding: '0.4rem 1rem', marginBottom: '1.5rem' }}>
                        <Shield size={14} color="#3b82f6" />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Privacy Policy</span>
                    </div>
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 1.25rem' }}>
                        Come trattiamo<br />
                        <span style={{ background: 'linear-gradient(135deg, #60a5fa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            i tuoi dati personali.
                        </span>
                    </h1>
                    <p style={{ fontSize: '1rem', lineHeight: 1.75, color: '#64748b', margin: '0 0 0.5rem' }}>
                        Informativa ai sensi dell'art. 13 del Regolamento UE 2016/679 (GDPR) e del D.Lgs. 196/2003 come modificato dal D.Lgs. 101/2018.
                    </p>
                    <p style={{ fontSize: '0.82rem', color: '#334155', margin: 0 }}>
                        Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                </motion.section>

                {/* Sezioni accordion */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>

                    <Section icon={UserCheck} iconColor="#3b82f6" iconBg="rgba(59,130,246,0.12)" title="1. Titolare del Trattamento">
                        <p>Il Titolare del trattamento dei dati personali è:</p>
                        <div style={{ background: '#1e293b', borderRadius: '10px', padding: '1rem 1.25rem', margin: '0.75rem 0', lineHeight: 1.8 }}>
                            <strong style={{ color: '#f8fafc' }}>SonixQuiz</strong><br />
                            Sede: Italia<br />
                            E-mail: <a href="mailto:info@sonixquiz.it" style={{ color: '#3b82f6', textDecoration: 'none' }}>info@sonixquiz.it</a><br />
                            PEC / Contatto DPO: <a href="mailto:privacy@sonixquiz.it" style={{ color: '#3b82f6', textDecoration: 'none' }}>privacy@sonixquiz.it</a>
                        </div>
                    </Section>

                    <Section icon={Eye} iconColor="#6366f1" iconBg="rgba(99,102,241,0.12)" title="2. Dati Raccolti e Finalità del Trattamento">
                        <p style={{ marginBottom: '0.75rem' }}>Raccogliamo e trattiamo i seguenti dati personali, esclusivamente per le finalità indicate:</p>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #1e293b' }}>
                                    <th style={{ textAlign: 'left', padding: '0.6rem 0.5rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Dato</th>
                                    <th style={{ textAlign: 'left', padding: '0.6rem 0.5rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Finalità</th>
                                    <th style={{ textAlign: 'left', padding: '0.6rem 0.5rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Base Giuridica</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ['Nome e cognome', 'Personalizzazione del profilo utente', 'Esecuzione del contratto (art. 6.1.b GDPR)'],
                                    ['Indirizzo e-mail', 'Autenticazione e comunicazioni di servizio', 'Esecuzione del contratto (art. 6.1.b GDPR)'],
                                    ['Progressi di studio', 'Salvataggio e visualizzazione dei risultati personali', 'Esecuzione del contratto (art. 6.1.b GDPR)'],
                                    ['Dati di navigazione (log)', 'Sicurezza, prevenzione di frodi e manutenzione tecnica', 'Legittimo interesse (art. 6.1.f GDPR)'],
                                    ['Cookies tecnici', 'Funzionamento del servizio di autenticazione', 'Necessità tecnica / consenso'],
                                ].map(([dato, finalita, base], i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                                        <td style={{ padding: '0.7rem 0.5rem', color: '#cbd5e1', fontWeight: 600 }}>{dato}</td>
                                        <td style={{ padding: '0.7rem 0.5rem', color: '#94a3b8' }}>{finalita}</td>
                                        <td style={{ padding: '0.7rem 0.5rem', color: '#64748b', fontSize: '0.82rem' }}>{base}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p style={{ marginTop: '1rem', fontSize: '0.88rem', color: '#475569' }}>
                            Non raccogliamo dati sensibili (categorie particolari di cui all'art. 9 GDPR) né effettuiamo profilazione automatizzata con effetti giuridici sull'utente.
                        </p>
                    </Section>

                    <Section icon={Shield} iconColor="#10b981" iconBg="rgba(16,185,129,0.12)" title="3. Modalità di Trattamento e Conservazione">
                        <p>I dati sono trattati con strumenti elettronici. Adottiamo misure tecniche e organizzative adeguate a garantire un livello di sicurezza appropriato al rischio (art. 32 GDPR), tra cui:</p>
                        <ul style={{ paddingLeft: '1.25rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <li>Trasmissione cifrata tramite protocollo TLS/HTTPS</li>
                            <li>Autenticazione gestita da Firebase Authentication (Google LLC), certificato SOC 2 Type II</li>
                            <li>Accesso ai dati limitato al personale autorizzato e ai responsabili del trattamento designati</li>
                        </ul>
                        <p style={{ marginTop: '1rem' }}>
                            I dati sono conservati per il tempo strettamente necessario alle finalità per cui sono stati raccolti e, in ogni caso, non oltre <strong style={{ color: '#f8fafc' }}>3 anni</strong> dall'ultima interazione dell'utente con il servizio, salvo obblighi di legge.
                        </p>
                    </Section>

                    <Section icon={Lock} iconColor="#f59e0b" iconBg="rgba(245,158,11,0.12)" title="4. Responsabili del Trattamento (Sub-Processor)">
                        <p style={{ marginBottom: '0.75rem' }}>Ci avvaliamo dei seguenti responsabili esterni del trattamento, con i quali abbiamo stipulato appositi accordi ex art. 28 GDPR:</p>
                        {[
                            { nome: 'Google Firebase (Google LLC)', ruolo: 'Autenticazione utenti e database', sede: 'USA – Standard Contractual Clauses (SCC)' },
                            { nome: 'Vercel Inc.', ruolo: 'Hosting e distribuzione dell\'applicazione', sede: 'USA – Standard Contractual Clauses (SCC)' },
                        ].map((r, i) => (
                            <div key={i} style={{ background: '#1e293b', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '0.5rem' }}>
                                <strong style={{ color: '#f8fafc', fontSize: '0.9rem' }}>{r.nome}</strong>
                                <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>{r.ruolo} — <em>{r.sede}</em></p>
                            </div>
                        ))}
                        <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#475569' }}>
                            I trasferimenti verso Paesi extra-UE avvengono nel rispetto delle garanzie previste dal Capo V del GDPR.
                        </p>
                    </Section>

                    <Section icon={UserCheck} iconColor="#818cf8" iconBg="rgba(129,140,248,0.12)" title="5. Diritti dell'Interessato">
                        <p style={{ marginBottom: '0.75rem' }}>In qualità di interessato, hai il diritto di:</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem', marginBottom: '1rem' }}>
                            {[
                                ['Accesso', 'art. 15 GDPR', 'Ottenere copia dei tuoi dati'],
                                ['Rettifica', 'art. 16 GDPR', 'Correggere dati inesatti'],
                                ['Cancellazione', 'art. 17 GDPR', 'Richiedere la cancellazione'],
                                ['Limitazione', 'art. 18 GDPR', 'Limitare il trattamento'],
                                ['Portabilità', 'art. 20 GDPR', 'Ricevere i dati in formato leggibile'],
                                ['Opposizione', 'art. 21 GDPR', 'Opporsi al trattamento'],
                            ].map(([tit, art, desc], i) => (
                                <div key={i} style={{ background: '#1e293b', borderRadius: '8px', padding: '0.85rem' }}>
                                    <p style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.88rem', margin: '0 0 0.2rem' }}>{tit}</p>
                                    <p style={{ color: '#3b82f6', fontSize: '0.75rem', margin: '0 0 0.3rem' }}>{art}</p>
                                    <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>{desc}</p>
                                </div>
                            ))}
                        </div>
                        <p style={{ fontSize: '0.9rem' }}>
                            Puoi esercitare i tuoi diritti scrivendo a{' '}
                            <a href="mailto:privacy@sonixquiz.it" style={{ color: '#3b82f6', textDecoration: 'none' }}>privacy@sonixquiz.it</a>.
                            Risponderemo entro <strong style={{ color: '#f8fafc' }}>30 giorni</strong> dalla ricezione della richiesta (art. 12 GDPR).
                        </p>
                        <p style={{ fontSize: '0.9rem', marginTop: '0.75rem' }}>
                            Hai inoltre il diritto di proporre reclamo al <strong style={{ color: '#f8fafc' }}>Garante per la protezione dei dati personali</strong> (
                            <a href="https://www.garanteprivacy.it" target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'none' }}>www.garanteprivacy.it</a>
                            ) qualora ritenga che il trattamento dei tuoi dati violi il Regolamento.
                        </p>
                    </Section>

                    <Section icon={Trash2} iconColor="#ef4444" iconBg="rgba(239,68,68,0.1)" title="6. Cookie e Tecnologie di Tracciamento">
                        <p style={{ marginBottom: '0.75rem' }}>Utilizziamo esclusivamente cookie tecnici, necessari al funzionamento del servizio:</p>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #1e293b' }}>
                                    {['Cookie', 'Tipo', 'Durata', 'Finalità'].map(h => (
                                        <th key={h} style={{ textAlign: 'left', padding: '0.6rem 0.5rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ['firebase-auth-token', 'Tecnico', 'Sessione', 'Mantenimento sessione autenticata'],
                                    ['cookie-consent', 'Tecnico', '12 mesi', 'Salvataggio preferenze cookie'],
                                    ['pl_progress_v2', 'Funzionale', 'Persistente', 'Salvataggio progressi di studio'],
                                ].map(([nome, tipo, durata, finalita], i, arr) => (
                                    <tr key={i} style={{ borderBottom: i < arr.length - 1 ? '1px solid #1e293b' : 'none' }}>
                                        <td style={{ padding: '0.7rem 0.5rem', color: '#cbd5e1', fontWeight: 600, fontFamily: 'monospace', fontSize: '0.82rem' }}>{nome}</td>
                                        <td style={{ padding: '0.7rem 0.5rem', color: '#94a3b8' }}>{tipo}</td>
                                        <td style={{ padding: '0.7rem 0.5rem', color: '#64748b' }}>{durata}</td>
                                        <td style={{ padding: '0.7rem 0.5rem', color: '#64748b', fontSize: '0.82rem' }}>{finalita}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p style={{ marginTop: '1rem', fontSize: '0.88rem', color: '#475569' }}>
                            Non utilizziamo cookie di profilazione né condividiamo dati con terzi per finalità pubblicitarie.
                        </p>
                        <button
                            onClick={() => { localStorage.removeItem('quiz-pl-cookie-consent'); window.location.reload(); }}
                            style={{ marginTop: '0.75rem', padding: '0.65rem 1.25rem', background: 'transparent', border: '1px solid #334155', color: '#94a3b8', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s' }}
                            onMouseOver={e => { e.currentTarget.style.borderColor = '#64748b'; e.currentTarget.style.color = '#f8fafc'; }}
                            onMouseOut={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.color = '#94a3b8'; }}
                        >
                            Modifica preferenze cookie
                        </button>
                    </Section>

                </div>

                {/* Contatti */}
                <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '1.75rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ background: 'rgba(59,130,246,0.12)', borderRadius: '10px', padding: '0.75rem', color: '#3b82f6', flexShrink: 0 }}>
                        <Mail size={20} />
                    </div>
                    <div>
                        <p style={{ fontWeight: 700, color: '#fff', margin: '0 0 0.25rem', fontSize: '0.95rem' }}>Hai domande sulla privacy?</p>
                        <a href="mailto:privacy@sonixquiz.it" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.9rem' }}>privacy@sonixquiz.it</a>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid #1e293b', textAlign: 'center', color: '#334155', fontSize: '0.82rem' }}>
                    &copy; {new Date().getFullYear()} SonixQuiz — Informativa redatta in conformità al Reg. UE 2016/679 (GDPR) e al D.Lgs. 196/2003.
                </div>

            </div>
        </div>
    );
};

export default PrivacyPolicy;
