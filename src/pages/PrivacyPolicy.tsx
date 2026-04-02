import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './PrivacyPolicy.css';

const PrivacyPolicy: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="privacy-page">
            <header className="privacy-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                    <span>Indietro</span>
                </button>
            </header>

            <main className="privacy-content">
                <h1>INFORMATIVA SULLA PRIVACY DI "QUIZ POLIZIA LOCALE"</h1>
                <p className="privacy-date">Ultimo aggiornamento: 29.03.2026</p>

                <div className="data-controller">
                    <h3>Titolare del Trattamento dei Dati:</h3>
                    <p><strong>Efisio Pala</strong></p>
                    <p><a href="mailto:efix01@gmail.com">efix01@gmail.com</a></p>
                    <p>Terralba (OR)</p>
                </div>

                <p className="privacy-intro">
                    Gentile Utente, la presente informativa ("Privacy Policy") ha lo scopo di descrivere le modalità di gestione di "Quiz Polizia Locale" (di seguito, anche "l'App" o il "Servizio") con riferimento al trattamento dei dati personali degli utenti che lo utilizzano. L'informativa è rilasciata ai sensi dell'art. 13 del Regolamento (UE) 2016/679 (GDPR).
                </p>
                <p>Ti invitiamo a leggere con attenzione la presente Privacy Policy prima di utilizzare l'App.</p>

                <section>
                    <h2>1. Titolare del Trattamento</h2>
                    <p>Il Titolare del trattamento dei dati personali è:</p>
                    <ul>
                        <li><strong>Nome:</strong> Efisio Pala</li>
                        <li><strong>Email:</strong> <a href="mailto:efix01@gmail.com">efix01@gmail.com</a></li>
                    </ul>
                    <p>Per qualsiasi richiesta relativa ai dati personali, l'Utente può contattare il Titolare all'indirizzo email sopra indicato.</p>
                </section>

                <section>
                    <h2>2. Dati Personali Raccolti</h2>
                    <p>Il Titolare raccoglie diverse categorie di dati personali durante l'utilizzo del Servizio:</p>

                    <h3>A. Dati forniti volontariamente dall'Utente</h3>
                    <ul>
                        <li><strong>Dati di autenticazione:</strong> Nome, indirizzo email, immagine del profilo e identificativo dell'account. Questi dati sono necessari per la registrazione e l'accesso all'area riservata tramite servizi di terze parti (es. Google, Firebase).</li>
                        <li><strong>Dati di utilizzo:</strong> Progressi nello studio, punteggi dei quiz completati, categorie studiate. Questi dati vengono salvati localmente sul dispositivo dell'Utente (LocalStorage) e, se l'Utente è loggato, possono essere sincronizzati sul database del Servizio per consentire l'accesso da più dispositivi.</li>
                    </ul>

                    <h3>B. Dati di navigazione (Cookies)</h3>
                    <p>Per il funzionamento tecnico del Servizio (es. mantenere la sessione di login), il sito web utilizza cookie tecnici essenziali. Per maggiori dettagli, consultare la sezione "Uso dei Cookies" della presente policy.</p>
                </section>

                <section>
                    <h2>3. Finalità del Trattamento</h2>
                    <p>Il Titolare tratta i Dati Personali dell'Utente per le seguenti finalità:</p>
                    <ol>
                        <li><strong>Gestione dell'account:</strong> Permettere all'Utente di registrarsi, accedere e mantenere attivo il proprio account personale.</li>
                        <li><strong>Fornitura del Servizio:</strong> Salvare i progressi e i punteggi dei quiz per offrire un'esperienza personalizzata e sincronizzata.</li>
                        <li><strong>Sicurezza e Manutenzione:</strong> Garantire la sicurezza del Servizio e prevenire frodi o abusi.</li>
                        <li><strong>Analisi e Miglioramento:</strong> Analizzare l'uso dell'App per migliorare funzionalità e contenuti (mediante log di sistema anonimi).</li>
                    </ol>
                </section>

                <section>
                    <h2>4. Base Giuridica del Trattamento</h2>
                    <p>Il trattamento dei dati è lecito in quanto basato su una delle seguenti basi giuridiche:</p>
                    <ul>
                        <li><strong>Esecuzione di un contratto:</strong> Il trattamento è necessario per fornire i servizi richiesti dall'Utente (es. accesso alle aree riservate).</li>
                        <li><strong>Obbligo legale:</strong> Il trattamento è necessario per adempiere ad obblighi di legge (es. contabilità, sicurezza).</li>
                        <li><strong>Interesse legittimo:</strong> Il trattamento è necessario per le finalità di sicurezza e analisi dei servizi, nel rispetto dei diritti e libertà dell'Utente.</li>
                        <li><strong>Consenso:</strong> L'Utente acconsente esplicitamente al trattamento dei dati per le finalità specifiche dove richiesto (es. uso di cookie opzionali).</li>
                    </ul>
                </section>

                <section>
                    <h2>5. Destinatari dei Dati</h2>
                    <p>I Dati Personali raccolti potranno essere condivisi con le seguenti categorie di soggetti:</p>
                    <ul>
                        <li><strong>Fornitori di servizi tecnici:</strong> Il Titolare si avvale di Firebase (servizio di Google LLC) per la gestione dell'autenticazione, dell'hosting del sito e dell'eventuale database. I dati personali dell'Utente verranno trattati da Google in conformità con la sua <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">privacy policy</a>.</li>
                        <li><strong>Personale autorizzato:</strong> I dipendenti o collaboratori del Titolare autorizzati a trattare i dati per finalità di gestione dell'App.</li>
                    </ul>
                    <p><strong>I Dati Personali non saranno diffusi a terzi, né venduti.</strong></p>
                </section>

                <section>
                    <h2>6. Trasferimento di Dati verso Paesi Extra-UE</h2>
                    <p>
                        L'utilizzo di Firebase comporta il trasferimento dei dati personali verso server ubicati fuori dallo Spazio Economico Europeo (SEE), in particolare negli Stati Uniti. Il Titolare garantisce che tale trasferimento avvenga in conformità con le disposizioni del GDPR, avvalendosi delle Clausole Contrattuali Standard (SCC) approvate dalla Commissione Europea e/o in conformità alla decisione di adeguatezza "EU-U.S. Data Privacy Framework" a cui Google aderisce.
                    </p>
                </section>

                <section>
                    <h2>7. Conservazione dei Dati</h2>
                    <p>I Dati Personali saranno trattati e conservati per il tempo necessario al raggiungimento delle finalità sopra indicate, ovvero:</p>
                    <ul>
                        <li><strong>Dati dell'account:</strong> Per tutto il periodo in cui l'Utente è registrato al Servizio. Al momento della cancellazione dell'account, i dati verranno rimossi dai sistemi attivi (salvi quelli previsti per obblighi di legge).</li>
                        <li><strong>Log di sistema:</strong> I log tecnici vengono conservati per un periodo limitato necessario per il debug e la sicurezza (generalmente 6 mesi).</li>
                        <li><strong>Dati LocalStorage:</strong> I dati salvati localmente sul dispositivo dell'Utente rimangono sul dispositivo finché non vengono cancellati manualmente dall'Utente o tramite la funzione "Logout" o "Elimina account" dell'App.</li>
                    </ul>
                </section>

                <section>
                    <h2>8. Diritti dell'Utente</h2>
                    <p>In qualità di Interessato, l'Utente ha diritto di esercitare in qualsiasi momento i seguenti diritti:</p>
                    <ul>
                        <li><strong>Diritto di accesso:</strong> Chiedere conferma del trattamento e copia dei propri dati.</li>
                        <li><strong>Diritto di rettifica:</strong> Chiedere la correzione di dati inesatti.</li>
                        <li><strong>Diritto alla cancellazione ("Diritto all'oblio"):</strong> Chiedere la cancellazione dei propri dati (eseguibile tramite la funzione "Elimina Account" nell'App).</li>
                        <li><strong>Diritto di limitazione:</strong> Chiedere la limitazione del trattamento.</li>
                        <li><strong>Diritto di opposizione:</strong> Opporsi al trattamento dei propri dati.</li>
                        <li><strong>Diritto alla portabilità:</strong> Ricevere i propri dati in un formato strutturato, di uso comune e leggibile da dispositivo automatico.</li>
                        <li><strong>Diritto di proporre reclamo:</strong> L'Utente ha il diritto di proporre reclamo all'autorità di controllo competente (per l'Italia, il Garante per la Protezione dei Dati Personali) qualora ritenga che il trattamento dei suoi dati sia contrario alla normativa in vigore.</li>
                    </ul>
                    <p>Per esercitare tali diritti, l'Utente può scrivere al Titolare o usare le funzioni presenti nell'App.</p>
                </section>

                <section>
                    <h2>9. Protezione dei Dati Minori</h2>
                    <p>
                        Il Servizio è destinato a maggiorenni. Non raccogliamo consapevolmente dati personali di minori di 18 anni. Qualora venisse a conoscenza di dati personali di minori, provvederemo immediatamente a cancellarli.
                    </p>
                </section>

                <section>
                    <h2>10. Uso dei Cookies</h2>
                    <p>Il sito "Quiz Polizia Locale" utilizza diverse tipologie di cookie per garantire il funzionamento del servizio e, con il tuo consenso, per migliorare la tua esperienza.</p>

                    <h3>10.1 Tabella dei Cookie Utilizzati</h3>
                    <div className="cookie-table-container">
                        <table className="cookie-table">
                            <thead>
                                <tr>
                                    <th>Nome Cookie</th>
                                    <th>Tipo</th>
                                    <th>Finalità</th>
                                    <th>Durata</th>
                                    <th>Consenso</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><code>quiz-pl-cookie-consent</code></td>
                                    <td>Tecnico</td>
                                    <td>Memorizza le preferenze cookie dell'utente</td>
                                    <td>1 anno</td>
                                    <td>Non richiesto</td>
                                </tr>
                                <tr>
                                    <td>Firebase Auth Token</td>
                                    <td>Tecnico</td>
                                    <td>Mantiene la sessione di login attiva</td>
                                    <td>Sessione</td>
                                    <td>Non richiesto</td>
                                </tr>
                                <tr>
                                    <td>LocalStorage progressi</td>
                                    <td>Tecnico</td>
                                    <td>Salva i progressi di studio localmente</td>
                                    <td>Persistente</td>
                                    <td>Non richiesto</td>
                                </tr>
                                <tr>
                                    <td><code>_ga</code>, <code>_ga_*</code></td>
                                    <td>Analitico</td>
                                    <td>Google Analytics - statistiche anonime sull'uso dell'app</td>
                                    <td>2 anni</td>
                                    <td><strong>Richiesto</strong></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <h3>10.2 Cookie Tecnici Essenziali</h3>
                    <p>
                        I cookie tecnici sono necessari per il corretto funzionamento del Servizio e non richiedono il consenso preventivo dell'utente.
                        Includono cookie per la gestione della sessione di login e per memorizzare le tue preferenze cookie.
                    </p>

                    <h3>10.3 Cookie Analitici (Google Analytics)</h3>
                    <p>
                        Con il tuo consenso, utilizziamo Google Analytics per raccogliere statistiche anonime sull'utilizzo dell'App.
                        Questi dati ci aiutano a migliorare il servizio. Gli indirizzi IP vengono anonimizzati in conformità con il GDPR.
                        Puoi revocare il consenso in qualsiasi momento.
                    </p>

                    <h3>10.4 Gestione delle Preferenze Cookie</h3>
                    <p>
                        Puoi modificare le tue preferenze cookie in qualsiasi momento cliccando sul pulsante sottostante:
                    </p>
                    <button
                        className="cookie-preferences-btn"
                        onClick={() => {
                            // This will be handled by importing the context
                            localStorage.removeItem('quiz-pl-cookie-consent');
                            window.location.reload();
                        }}
                    >
                        🍪 Modifica Preferenze Cookie
                    </button>
                </section>

                <section>
                    <h2>11. Modifiche alla presente Informativa</h2>
                    <p>
                        Il Titolare si riserva il diritto di modificare la presente Privacy Policy in qualsiasi momento. L'Utente è tenuto a controllare periodicamente questa pagina per prendere visione dell'ultima versione aggiornata delle condizioni.
                    </p>
                </section>

                <section>
                    <h2>12. Contatti</h2>
                    <p>Per qualsiasi domanda relativa alla presente informativa o al trattamento dei dati personali, contattaci all'indirizzo:</p>
                    <p className="contact-info">
                        <strong>Email:</strong> <a href="mailto:efix01@gmail.com">efix01@gmail.com</a>
                    </p>
                </section>
            </main>
        </div>
    );
};

export default PrivacyPolicy;
