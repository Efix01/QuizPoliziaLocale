import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Unlock, Brain, Scale, TreePine, Shield, Heart } from 'lucide-react';
import './ChiSiamo.css';

const ChiSiamo: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="chi-siamo-container">
            {/* Header */}
            <header className="chi-siamo-header">
                <button
                    className="back-button"
                    onClick={() => navigate(-1)}
                    aria-label="Torna indietro"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1>Chi Siamo</h1>
                <div className="header-spacer" />
            </header>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-icon">
                    <TreePine size={48} />
                </div>
                <h2 className="hero-title">
                    Tecnologia e Passione<br />
                    <span>al servizio della Natura</span>
                </h2>
                <p className="hero-subtitle">
                    Il progetto Quiz CFVA nasce per supportare i futuri custodi della Sardegna.
                </p>
            </section>

            {/* La Storia - Bio Card */}
            <section className="bio-section">
                <div className="bio-card">
                    <div className="bio-avatar">
                        <Shield size={32} />
                    </div>
                    <div className="bio-content">
                        <p className="bio-greeting">Ciao, sono <strong>Efisio</strong>.</p>
                        <p>
                            Nella vita professionale sono un <strong>Assistente Capo del Corpo Forestale</strong>.
                            Nel tempo libero, sono un appassionato di programmazione, intelligenza artificiale,
                            fotografia e video.
                        </p>
                        <p>
                            Ho creato questa applicazione perché conosco bene la sfida che state affrontando.
                            Il percorso per indossare questa divisa è impegnativo e richiede dedizione assoluta.
                            Ho voluto mettere le mie competenze digitali a disposizione di chi, come me, ha il
                            sogno di proteggere il patrimonio ambientale della nostra isola.
                        </p>
                    </div>
                </div>
            </section>

            {/* La Filosofia - Grid 2 Colonne */}
            <section className="philosophy-section">
                <h3 className="section-title">La Nostra Filosofia</h3>
                <div className="philosophy-grid">
                    <div className="philosophy-card">
                        <div className="philosophy-icon">
                            <Unlock size={28} />
                        </div>
                        <h4>100% Gratuito</h4>
                        <p>
                            La cultura e la formazione non dovrebbero avere barriere economiche.
                            Non troverai pubblicità, abbonamenti o richieste di donazioni in questa app.
                        </p>
                    </div>
                    <div className="philosophy-card">
                        <div className="philosophy-icon powered">
                            <Brain size={28} />
                        </div>
                        <h4>Powered by AI</h4>
                        <p>
                            Utilizzo le più recenti tecnologie di Intelligenza Artificiale per elaborare
                            i dati ufficiali del bando e creare strumenti di studio efficaci e moderni.
                        </p>
                    </div>
                </div>
            </section>

            {/* Disclaimer Legale */}
            <section className="disclaimer-section">
                <div className="disclaimer-box">
                    <div className="disclaimer-header">
                        <Scale size={20} />
                        <span>DISCLAIMER DI INDIPENDENZA E NON AFFILIAZIONE</span>
                    </div>
                    <div className="disclaimer-content">
                        <p>
                            L'applicazione <strong>"Quiz CFVA"</strong> è un progetto personale,
                            apolitico e senza scopo di lucro, realizzato a titolo di volontariato privato.
                        </p>
                        <p className="disclaimer-declaration">Si dichiara esplicitamente che:</p>
                        <ul>
                            <li>
                                Questo progetto è <strong>totalmente indipendente</strong> dal Corpo Forestale
                                e di Vigilanza Ambientale (CFVA) e dalla Regione Autonoma della Sardegna (RAS).
                            </li>
                            <li>
                                L'autore agisce in veste di privato cittadino appassionato di tecnologia;
                                l'app non rappresenta in alcun modo l'Ente di appartenenza né costituisce
                                canale di comunicazione ufficiale.
                            </li>
                            <li>
                                I contenuti didattici (quiz e materiali) sono elaborazioni basate esclusivamente
                                su <strong>documenti pubblici</strong> (leggi, bandi, gazzette ufficiali)
                                accessibili a chiunque.
                            </li>
                            <li>
                                L'utilizzo dell'app <strong>non garantisce</strong> il superamento del concorso
                                e non sostituisce lo studio sui testi ufficiali.
                            </li>
                        </ul>
                        <p style={{ marginTop: '16px' }}>
                            I quiz e i materiali di studio presenti sono stati elaborati sulla base di dati di pubblico dominio.
                            Sebbene sia stata posta la massima cura nell'accuratezza delle informazioni, l'autore non si assume
                            alcuna responsabilità per eventuali errori, inesattezze o per l'esito delle prove concorsuali
                            sostenute dagli utilizzatori. L'uso dell'app non sostituisce in alcun modo i canali e i testi
                            ufficiali del bando di concorso.
                        </p>
                    </div>
                </div>
            </section>

            {/* Firma e Footer */}
            <section className="signature-section">
                <div className="signature-content">
                    <Heart className="signature-heart" size={24} />
                    <p className="signature-text">
                        "In bocca al lupo, futuro collega. 🌲"
                    </p>
                    <p className="signature-author">— Efisio</p>
                </div>
            </section>

            {/* Pulsante Torna alla Home */}
            <div className="footer-action">
                <button
                    className="home-button"
                    onClick={() => navigate('/')}
                >
                    <TreePine size={20} />
                    Torna alla Home
                </button>
            </div>
        </div>
    );
};

export default ChiSiamo;
