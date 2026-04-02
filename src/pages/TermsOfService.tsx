import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './TermsOfService.css';

const TermsOfService: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="terms-page">
            <header className="terms-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                    <span>Indietro</span>
                </button>
            </header>

            <main className="terms-content">
                <h1>TERMINI DI SERVIZIO DI "QUIZ CFVA"</h1>
                <p className="terms-date">Ultimo aggiornamento: 29.03.2026</p>

                <p className="terms-intro">
                    Benvenuto in "Quiz Polizia Locale". Ti preghiamo di leggere attentamente i presenti Termini di Servizio ("Termini") prima di utilizzare l'applicazione Web ("Servizio").
                </p>
                <p>
                    Utilizzando il Servizio, l'utente accetta di essere vincolato dai presenti Termini. Se non sei d'accordo con questi Termini, ti preghiamo di non utilizzare il Servizio.
                </p>

                <section>
                    <h2>1. Il Servizio</h2>
                    <p>
                        Quiz Polizia Locale è un'applicazione Web dedicata alla preparazione per i concorsi pubblici indetti dagli Enti Locali per l'assunzione di Agenti di Polizia Locale.
                    </p>
                    <p>Il Servizio fornisce:</p>
                    <ul>
                        <li>Quiz a risposta multipla basati sul bando ufficiale.</li>
                        <li>Simulazioni d'esame. (Quiz non ufficiali)</li>
                        <li>Materiale didattico ed esplicativo.</li>
                        <li>Strumenti di monitoraggio dei progressi personali.</li>
                    </ul>
                </section>

                <section>
                    <h2>2. Accettazione dei Termini</h2>
                    <p>Utilizzando l'App, dichiari di:</p>
                    <ul>
                        <li>Avere almeno 18 anni di età.</li>
                        <li>Possedere la capacità giuridica di sottoscrivere il presente contratto.</li>
                        <li>Aver letto e compreso la nostra <Link to="/privacy">Privacy Policy</Link>.</li>
                    </ul>
                </section>

                <section>
                    <h2>3. Registrazione e Account</h2>
                    <p>
                        Per accedere a determinate funzionalità dell'App (es. salvataggio dei progressi, simulazioni complete), è necessario creare un account utilizzando l'autenticazione Google o Email.
                    </p>
                    <p>L'Utente si impegna a:</p>
                    <ul>
                        <li>Fornire informazioni veritiere, accurate, complete e aggiornate durante la registrazione.</li>
                        <li>Mantenere e aggiornare tempestivamente i propri dati.</li>
                        <li>Divulgare immediatamente al Proprietario qualsiasi uso non autorizzato della propria password o account.</li>
                        <li>Essere responsabile di tutte le attività che avvengano sotto il proprio account.</li>
                    </ul>
                    <p>
                        Il Proprietario si riserva il diritto di rifiutare la registrazione, sospendere o chiudere l'account dell'Utente in caso di violazione dei presenti Termini.
                    </p>
                </section>

                <section>
                    <h2>4. Natura dei Contenuti e Disclaimer</h2>
                    <div className="terms-warning">
                        <strong>⚠️ IMPORTANTE:</strong> I contenuti di "Quiz Polizia Locale" sono forniti a scopo puramente didattico e informativo.
                    </div>
                    <p>Sebbene ci sforziamo di garantire che le domande e le spiegazioni siano accurate e aggiornate in base al testo del bando ufficiale:</p>
                    <ul>
                        <li>I contenuti NON costituiscono il testo ufficiale del bando di concorso.</li>
                        <li>Le risposte e le spiegazioni potrebbero contenere errori o interpretazioni soggettive.</li>
                        <li>Il Proprietario declina ogni responsabilità per danni diretti o indiretti derivanti dall'uso di informazioni imprecise. L'utente è tenuto di persona a verificare la validità delle risposte nei testi ufficiali.</li>
                    </ul>
                    <p>
                        Per la partecipazione ai concorsi, si rimanda esclusivamente al testo integrale pubblicato dagli Enti Locali e sul portale "inPA".
                    </p>
                </section>

                <section>
                    <h2>5. Proprietà Intellettuale</h2>
                    <p>Tutti i contenuti presenti nell'App, inclusi ma non limitati a:</p>
                    <ul>
                        <li>Testi, grafiche, loghi, icone, immagini.</li>
                        <li>Struttura del sito web e design (UI/UX).</li>
                        <li>Banca dati dei quiz (domande e risposte).</li>
                    </ul>
                    <p>
                        sono di proprietà esclusiva del Proprietario ("Quiz Polizia Locale") o dei suoi licenziatari e sono protetti dalle leggi sul diritto d'autore e sulla proprietà intellettuale.
                    </p>
                    <p>È severamente vietato:</p>
                    <ul>
                        <li>Copiare, riprodurre, distribuire, vendere o trasmettere i contenuti dell'App.</li>
                        <li>Estrazione sistematica dei dati (scraping) per creare banche dati concorrenti.</li>
                        <li>Sfruttare commercialmente i quiz senza autorizzazione scritta.</li>
                    </ul>
                </section>

                <section>
                    <h2>6. Limitazione di Responsabilità</h2>
                    <p>Nella misura massima consentita dalla legge applicabile, il Proprietario non è responsabile per:</p>
                    <ul>
                        <li>Eventuali interruzioni, sospensioni o malfunzionamenti del Servizio.</li>
                        <li>Errori tecnici, virus o altri materiali dannosi sul sito.</li>
                        <li>Perdita di dati o informazioni personali derivanti da guasti tecnici o attacchi hacker.</li>
                        <li>Inaccuratezze nei quiz che, nonostante la nostra accuratezza, non sostituiscono il testo ufficiale del concorso.</li>
                    </ul>
                    <p><strong>L'uso del Servizio è a rischio esclusivo dell'Utente.</strong></p>
                </section>

                <section>
                    <h2>7. Servizio Gratuito e Modifiche</h2>
                    <p>
                        Attualmente l'accesso al Servizio è gratuito. Il Proprietario si riserva il diritto, a sua discrezione, di:
                    </p>
                    <ul>
                        <li>Introdurre costi di abbonamento per funzionalità aggiuntive ("Premium").</li>
                        <li>Modificare, sospendere o interrompere, in tutto o in parte, il Servizio in qualsiasi momento e senza alcun preavviso.</li>
                    </ul>
                </section>

                <section>
                    <h2>8. Condizioni d'Uso e Comportamento Utente</h2>
                    <p>L'Utente si impegna a non utilizzare l'App per:</p>
                    <ul>
                        <li>Violare leggi o normative in vigore.</li>
                        <li>Diffamare, offendere o molestare altri utenti.</li>
                        <li>Tentare di violare la sicurezza del sistema o accedere a server non autorizzati.</li>
                        <li>Condividere le credenziali di accesso con terze parti.</li>
                    </ul>
                </section>

                <section>
                    <h2>9. Protezione dei Dati Personali</h2>
                    <p>
                        La raccolta e il trattamento dei dati personali sono disciplinati dalla nostra <Link to="/privacy">Informativa sulla Privacy</Link>, conforme al Regolamento UE 2016/679 (GDPR). Ti invitiamo a leggerla attentamente.
                    </p>
                </section>

                <section>
                    <h2>10. Cessione del Contratto</h2>
                    <p>
                        Il Proprietario si riserva il diritto di cedere, trasferire o subappaltare tutti i propri diritti e obblighi derivanti dai presenti Termini a terze parti senza alcun preavviso.
                    </p>
                </section>

                <section>
                    <h2>11. Risoluzione e Termine</h2>
                    <p>Il Proprietario si riserva il diritto di:</p>
                    <ul>
                        <li>Terminare o sospendere immediatamente l'accesso dell'Utente al Servizio in caso di violazione dei Termini.</li>
                        <li>Eliminare l'account e i dati associati su richiesta dell'Utente (Diritto all'oblio GDPR).</li>
                    </ul>
                </section>

                <section>
                    <h2>12. Legge Applicabile e Foro Competente</h2>
                    <p>I presenti Termini sono regolati e interpretati in conformità con la legge italiana.</p>
                    <p>Per qualsiasi controversia derivante dai presenti Termini, le parti concordano quanto segue:</p>
                    <ul>
                        <li>Qualora l'Utente sia qualificabile come "consumatore" ai sensi del D.Lgs. 206/2005 (Codice del Consumo), la competenza territoriale spetta inderogabilmente al foro del suo luogo di residenza o di domicilio.</li>
                        <li>Per tutte le altre controversie (ad esempio, con utenti non consumatori), la competenza territoriale spetta in via esclusiva al <strong>Tribunale di Oristano</strong>.</li>
                    </ul>
                </section>

                <section>
                    <h2>13. Contatti</h2>
                    <p>
                        Per qualsiasi domanda relativa ai Termini di Servizio o al funzionamento dell'App, contattaci all'indirizzo:
                    </p>
                    <p className="contact-info">
                        <strong>Email:</strong> <a href="mailto:efix01@gmail.com">efix01@gmail.com</a>
                    </p>
                </section>
            </main>
        </div>
    );
};

export default TermsOfService;
