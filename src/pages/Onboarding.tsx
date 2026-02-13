import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import './Onboarding.css';

const ONBOARDING_KEY = 'forestali_onboarding_completed';

interface SlideData {
    title: string;
    description: React.ReactNode;
    buttonText: string;
}

const slides: SlideData[] = [
    {
        title: 'Il tuo sogno inizia qui',
        description: (
            <>
                Preparati al concorso per Agente del{' '}
                <strong>Corpo Forestale della Sardegna</strong>{' '}
                con l'app più completa.
            </>
        ),
        buttonText: 'Inizia il viaggio'
    },
    {
        title: '96 posti, migliaia di candidati',
        description: (
            <>
                Il concorso CFVA è tra i più selettivi. Servono{' '}
                <strong className="text-green">31/45 punti</strong>{' '}
                e ogni errore costa{' '}
                <strong className="text-red">-0.17</strong>.
            </>
        ),
        buttonText: 'Avanti'
    },
    {
        title: 'Tutto ciò che serve',
        description: null,
        buttonText: 'Avanti'
    },
    {
        title: 'Pronto a superare il concorso?',
        description: (
            <span className="cta-subtitle">Inizia subito. È gratis.</span>
        ),
        buttonText: 'Inizia Subito'
    }
];

const features = [
    'Quiz su tutte le materie del bando',
    'Punteggio reale (+0.5 / -0.17)',
    'Simulazioni d\'esame cronometrate'
];

import {
    Slide1Illustration,
    Slide2Illustration,
    Slide3Illustration,
    Slide4Illustration
} from '../components/ui/OnboardingIllustrations';

const illustrations = [Slide1Illustration, Slide2Illustration, Slide3Illustration, Slide4Illustration];

const Onboarding: React.FC = () => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        const completed = localStorage.getItem(ONBOARDING_KEY);
        if (completed === 'true') {
            navigate('/', { replace: true });
        }
    }, [navigate]);

    const completeOnboarding = useCallback(() => {
        localStorage.setItem(ONBOARDING_KEY, 'true');
        localStorage.setItem('onboarding_date', new Date().toISOString());
        navigate('/', { replace: true });
    }, [navigate]);

    const goToSlide = useCallback((index: number) => {
        if (index < 0 || index >= slides.length || isAnimating) return;
        setIsAnimating(true);
        setCurrentSlide(index);
        setTimeout(() => setIsAnimating(false), 400);
    }, [isAnimating]);

    const nextSlide = useCallback(() => {
        if (currentSlide === slides.length - 1) {
            completeOnboarding();
        } else {
            goToSlide(currentSlide + 1);
        }
    }, [currentSlide, completeOnboarding, goToSlide]);

    const prevSlide = useCallback(() => {
        goToSlide(currentSlide - 1);
    }, [currentSlide, goToSlide]);

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.changedTouches[0].screenX);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const endX = e.changedTouches[0].screenX;
        const threshold = 50;
        const diff = touchStart - endX;

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    };

    const isLastSlide = currentSlide === slides.length - 1;
    const slide = slides[currentSlide];
    const CurrentIllustration = illustrations[currentSlide];

    return (
        <div
            className="onboarding-v2"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <header className="onboarding-header">
                {!isLastSlide ? (
                    <button className="skip-btn" onClick={completeOnboarding}>
                        Salta
                    </button>
                ) : (
                    <div></div>
                )}
                <span className="slide-counter">
                    {currentSlide + 1}/{slides.length}
                </span>
            </header>

            <div className="illustration-area">
                <div className="illustration-wrapper" key={currentSlide}>
                    <CurrentIllustration />
                </div>
            </div>

            <div className="content-card">
                <div className="slide-content" key={`content-${currentSlide}`}>
                    <h1 className="slide-title">{slide.title}</h1>

                    {currentSlide === 2 ? (
                        <ul className="features-list">
                            {features.map((feature, index) => (
                                <li key={index} className="feature-item">
                                    <span className="feature-check">
                                        <Check size={16} />
                                    </span>
                                    <span className="feature-text">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="slide-description">{slide.description}</p>
                    )}
                </div>

                <div className="indicators">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            className={`indicator ${index === currentSlide ? 'active' : ''}`}
                            onClick={() => goToSlide(index)}
                            aria-label={`Vai alla slide ${index + 1}`}
                        />
                    ))}
                </div>

                <button
                    className={`main-btn ${isLastSlide ? 'btn-final' : ''}`}
                    onClick={nextSlide}
                >
                    {slide.buttonText}
                    {!isLastSlide && <ArrowRight size={20} />}
                </button>

                {isLastSlide && (
                    <p className="login-link">
                        Cliccando Inizia Subito, accetti i nostri{' '}
                        <Link to="/terms">Termini di Servizio</Link> e la{' '}
                        <Link to="/privacy">Privacy Policy</Link>
                    </p>
                )}
            </div>
        </div>
    );
};

export default Onboarding;
