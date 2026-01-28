import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCookieConsent, type CookiePreferences } from '../../context/CookieContext';
import './CookieBanner.css';

export const CookieBanner: React.FC = () => {
    const {
        showBanner,
        showPreferences,
        preferences,
        acceptAll,
        rejectNonEssential,
        savePreferences,
        openPreferences,
        closePreferences,
    } = useCookieConsent();

    const [tempPreferences, setTempPreferences] = useState<CookiePreferences>(preferences);

    // Update temp preferences when preferences change
    React.useEffect(() => {
        setTempPreferences(preferences);
    }, [preferences]);

    if (!showBanner) return null;

    const handleToggle = (key: keyof CookiePreferences) => {
        if (key === 'necessary') return; // Cannot toggle necessary cookies
        setTempPreferences(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleSavePreferences = () => {
        savePreferences(tempPreferences);
    };

    return (
        <div className="cookie-banner-overlay">
            <div className={`cookie-banner ${showPreferences ? 'cookie-banner--expanded' : ''}`}>
                {!showPreferences ? (
                    // Main banner view
                    <>
                        <div className="cookie-banner__icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <circle cx="8" cy="9" r="1" fill="currentColor" />
                                <circle cx="15" cy="8" r="1" fill="currentColor" />
                                <circle cx="10" cy="14" r="1" fill="currentColor" />
                                <circle cx="16" cy="14" r="1" fill="currentColor" />
                                <circle cx="12" cy="11" r="1" fill="currentColor" />
                            </svg>
                        </div>

                        <div className="cookie-banner__content">
                            <h3 className="cookie-banner__title">Utilizziamo i cookie 🍪</h3>
                            <p className="cookie-banner__text">
                                Questo sito utilizza cookie tecnici necessari e, con il tuo consenso, cookie di analisi
                                per migliorare la tua esperienza. Puoi accettare tutti i cookie, rifiutare quelli non
                                essenziali o personalizzare le tue preferenze.
                            </p>
                            <Link to="/privacy" className="cookie-banner__link">
                                Leggi la Privacy Policy
                            </Link>
                        </div>

                        <div className="cookie-banner__actions">
                            <button
                                className="cookie-btn cookie-btn--primary"
                                onClick={acceptAll}
                            >
                                Accetta tutti
                            </button>
                            <button
                                className="cookie-btn cookie-btn--secondary"
                                onClick={rejectNonEssential}
                            >
                                Rifiuta non essenziali
                            </button>
                            <button
                                className="cookie-btn cookie-btn--tertiary"
                                onClick={openPreferences}
                            >
                                Personalizza
                            </button>
                        </div>
                    </>
                ) : (
                    // Preferences view
                    <>
                        <div className="cookie-preferences">
                            <div className="cookie-preferences__header">
                                <h3 className="cookie-banner__title">Preferenze Cookie</h3>
                                <button
                                    className="cookie-preferences__close"
                                    onClick={closePreferences}
                                    aria-label="Chiudi preferenze"
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>

                            <div className="cookie-preferences__list">
                                {/* Necessary cookies */}
                                <div className="cookie-category">
                                    <div className="cookie-category__header">
                                        <div className="cookie-category__info">
                                            <h4 className="cookie-category__title">Cookie Necessari</h4>
                                            <p className="cookie-category__desc">
                                                Essenziali per il funzionamento del sito. Non possono essere disabilitati.
                                            </p>
                                        </div>
                                        <div className="cookie-toggle cookie-toggle--disabled">
                                            <input
                                                type="checkbox"
                                                checked={true}
                                                disabled
                                                id="necessary-cookies"
                                            />
                                            <label htmlFor="necessary-cookies" className="cookie-toggle__slider"></label>
                                        </div>
                                    </div>
                                </div>

                                {/* Analytics cookies */}
                                <div className="cookie-category">
                                    <div className="cookie-category__header">
                                        <div className="cookie-category__info">
                                            <h4 className="cookie-category__title">Cookie Analitici</h4>
                                            <p className="cookie-category__desc">
                                                Ci aiutano a capire come utilizzi il sito per migliorare l'esperienza.
                                            </p>
                                        </div>
                                        <div className="cookie-toggle">
                                            <input
                                                type="checkbox"
                                                checked={tempPreferences.analytics}
                                                onChange={() => handleToggle('analytics')}
                                                id="analytics-cookies"
                                            />
                                            <label htmlFor="analytics-cookies" className="cookie-toggle__slider"></label>
                                        </div>
                                    </div>
                                </div>

                                {/* Marketing cookies */}
                                <div className="cookie-category">
                                    <div className="cookie-category__header">
                                        <div className="cookie-category__info">
                                            <h4 className="cookie-category__title">Cookie di Marketing</h4>
                                            <p className="cookie-category__desc">
                                                Utilizzati per mostrarti contenuti personalizzati in base ai tuoi interessi.
                                            </p>
                                        </div>
                                        <div className="cookie-toggle">
                                            <input
                                                type="checkbox"
                                                checked={tempPreferences.marketing}
                                                onChange={() => handleToggle('marketing')}
                                                id="marketing-cookies"
                                            />
                                            <label htmlFor="marketing-cookies" className="cookie-toggle__slider"></label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="cookie-preferences__actions">
                                <button
                                    className="cookie-btn cookie-btn--primary"
                                    onClick={handleSavePreferences}
                                >
                                    Salva preferenze
                                </button>
                                <button
                                    className="cookie-btn cookie-btn--secondary"
                                    onClick={acceptAll}
                                >
                                    Accetta tutti
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CookieBanner;
