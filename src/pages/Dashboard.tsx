import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
    BookOpen,
    Target,
    ArrowRight,
    Calendar,
    ChevronRight,
    ChevronLeft,
    TreePine,
    Leaf,
    Bug,
    Scale,
    Flame,
    MapPin
} from 'lucide-react';
import { useScrollAnimation, useStaggerAnimation, useParallax } from '../hooks/useAnimations';
import LockedOverlay from '../components/ui/LockedOverlay';
import { StudyNotificationBanner } from '../components/ui/StudyNotification';
import './Dashboard.css';

// Greeting based on time of day
const getGreeting = (): { text: string; emoji: string } => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return { text: 'Buongiorno', emoji: '☀️' };
    if (hour >= 12 && hour < 18) return { text: 'Buon pomeriggio', emoji: '🌤️' };
    if (hour >= 18 && hour < 22) return { text: 'Buonasera', emoji: '🌙' };
    return { text: 'Studio notturno?', emoji: '🦉' };
};

// Countdown calculation
const getCountdown = (targetDate: Date) => {
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();

    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
};

// FREE categories available to guests (first 3)
const FREE_CATEGORY_IDS = ['botanica', 'fauna', 'ecologia'];

// Categories data - mapped to actual database categories
const CATEGORIES = [
    { id: 'istituzionale', name: 'Istituzionale (L.R. 26/1985)', icon: Scale, gradient: 'diritto' },
    { id: 'ecologia', name: 'Ecologia e Selvicoltura', icon: TreePine, gradient: 'ecologia' },
    { id: 'botanica', name: 'Botanica', icon: Leaf, gradient: 'botanica' },
    { id: 'zoologia', name: 'Zoologia', icon: Bug, gradient: 'fauna' },
    { id: 'geografia', name: 'Geografia della Sardegna', icon: MapPin, gradient: 'geografia' },
    { id: 'legislazione', name: 'Legislazione Forestale', icon: BookOpen, gradient: 'inglese' },
    { id: 'aree', name: 'Aree Protette (L. 394/1991)', icon: TreePine, gradient: 'ecologia' },
    { id: 'incendi', name: 'Incendi Boschivi (L. 353/2000)', icon: Flame, gradient: 'incendi' },
    { id: 'penale', name: 'Diritto Penale e Procedura Penale', icon: Scale, gradient: 'diritto' },
    { id: 'reati', name: 'Reati Ambientali', icon: Flame, gradient: 'incendi' },
    { id: 'fauna', name: 'Fauna (L. 157/1992)', icon: Bug, gradient: 'fauna' },
    { id: 'informatica', name: 'Informatica', icon: Target, gradient: 'informatica' },
];

const ONBOARDING_KEY = 'forestali_onboarding_completed';

const Dashboard: React.FC = () => {
    const { stats, questions } = useQuiz();
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    // Check if onboarding is completed
    useEffect(() => {
        const onboardingCompleted = localStorage.getItem(ONBOARDING_KEY);
        if (onboardingCompleted !== 'true') {
            navigate('/welcome', { replace: true });
        }
    }, [navigate]);

    // Animation hooks
    const parallaxOffset = useParallax(0.3);
    const countdownVisible = useStaggerAnimation(4, 100);
    const [progressRef, progressVisible] = useScrollAnimation<HTMLElement>();
    const [categoriesRef, categoriesVisible] = useScrollAnimation<HTMLElement>();
    const [challengeRef, challengeVisible] = useScrollAnimation<HTMLElement>();

    // Categories scroll ref and navigation
    const categoriesScrollRef = React.useRef<HTMLDivElement>(null);
    const scrollCategories = (direction: 'left' | 'right') => {
        if (categoriesScrollRef.current) {
            const scrollAmount = 320; // ~2 cards
            categoriesScrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Page load animation state
    const [pageLoaded, setPageLoaded] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setPageLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Greeting
    const greeting = getGreeting();

    // Countdown state (target: Sept 15, 2025)
    const TARGET_DATE = new Date('2025-09-15T09:00:00');
    const [countdown, setCountdown] = useState(getCountdown(TARGET_DATE));

    // Update countdown every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(getCountdown(TARGET_DATE));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Calculate stats
    const accuracy = stats.totalAnswered > 0
        ? Math.round((stats.correctCount / stats.totalAnswered) * 100)
        : 0;

    const averageScore = stats.totalAnswered > 0
        ? ((stats.correctCount * 0.5) / Math.max(stats.totalAnswered, 1) * 90).toFixed(1)
        : '0.0';

    // Count questions per category
    const getCategoryCount = (categoryId: string) => {
        return questions.filter(q =>
            q.category.toLowerCase().includes(categoryId.toLowerCase())
        ).length;
    };

    // Sparkline data (mock for now, could be from actual history)
    const sparklineData = [30, 45, 35, 50, 40, 55, 48];
    const maxSparkline = Math.max(...sparklineData);

    // Notification hook
    const { markLastStudyTime } = useNotifications();

    // Track study start
    const handleStartStudy = (path: string) => {
        markLastStudyTime();
        navigate(path);
    };

    return (
        <div className="dashboard-container">
            {/* STUDY NOTIFICATION BANNER */}
            <StudyNotificationBanner />

            {/* HERO SECTION */}
            <section
                className="hero-section"
                style={{
                    backgroundPositionY: `${parallaxOffset}px`,
                    background: 'radial-gradient(ellipse at center bottom, #0D2818 0%, #1E5631 100%)',
                }}
            >
                <div className={`hero-content ${pageLoaded ? 'animate-scale-in' : ''}`}>
                    {/* Logo */}
                    <div className="dashboard-logo">
                        <img src="/logo-cfva.png" alt="Quiz CFVA" className="dashboard-logo-img" />
                    </div>

                    {/* Greeting */}
                    <div className="hero-greeting">
                        <span className="greeting-emoji">{greeting.emoji}</span>
                        <h1 className="greeting-text display-text">{greeting.text}, {user?.displayName?.split(' ')[0] || 'Candidato'}</h1>
                    </div>
                    <p className="hero-subtitle">Il tuo obiettivo è vicino</p>

                    {/* Countdown with stagger animation */}
                    <div className="countdown-container">
                        <div className={`countdown-box ${countdownVisible[0] ? 'animate-spring-up' : ''}`} style={{ opacity: countdownVisible[0] ? 1 : 0 }}>
                            <span className="countdown-number mono-text">{countdown.days}</span>
                            <span className="countdown-label">giorni</span>
                        </div>
                        <div className={`countdown-box ${countdownVisible[1] ? 'animate-spring-up' : ''}`} style={{ opacity: countdownVisible[1] ? 1 : 0 }}>
                            <span className="countdown-number mono-text">{countdown.hours}</span>
                            <span className="countdown-label">ore</span>
                        </div>
                        <div className={`countdown-box ${countdownVisible[2] ? 'animate-spring-up' : ''}`} style={{ opacity: countdownVisible[2] ? 1 : 0 }}>
                            <span className="countdown-number mono-text">{countdown.minutes}</span>
                            <span className="countdown-label">min</span>
                        </div>
                        <div className={`countdown-box ${countdownVisible[3] ? 'animate-spring-up' : ''}`} style={{ opacity: countdownVisible[3] ? 1 : 0 }}>
                            <span className="countdown-number mono-text">{countdown.seconds}</span>
                            <span className="countdown-label">sec</span>
                        </div>
                    </div>

                    <div className="countdown-date">
                        <Calendar />
                        <span>Data esame: da definire</span>
                    </div>
                </div>
            </section>

            {/* QUICK ACTIONS */}
            <section className="quick-actions">
                <div
                    className={`action-card hover-lift focus-gold ${pageLoaded ? 'animate-spring-up delay-300' : ''}`}
                    onClick={() => handleStartStudy('/study')}
                    role="button"
                    tabIndex={0}
                    style={{ opacity: pageLoaded ? 1 : 0 }}
                >
                    <div className="action-icon action-icon--study">
                        <BookOpen />
                    </div>
                    <h3 className="action-title">Quiz Veloce</h3>
                    <p className="action-description">10 domande<br />~5 minuti</p>
                    <span className="action-link">
                        Inizia <ArrowRight />
                    </span>
                </div>

                <div
                    className={`action-card action-card--simulation hover-lift focus-gold ${pageLoaded ? 'animate-spring-up delay-400' : ''}`}
                    onClick={() => isAuthenticated && navigate('/simulation')}
                    role="button"
                    tabIndex={0}
                    style={{ opacity: pageLoaded ? 1 : 0, position: 'relative' }}
                >
                    {/* Locked Overlay for guests */}
                    {!isAuthenticated && <LockedOverlay message="Accedi per sbloccare" />}

                    <div className="action-icon action-icon--simulation">
                        <Target />
                    </div>
                    <h3 className="action-title">Simulazione</h3>
                    <p className="action-description">90 domande<br />100 minuti</p>
                    <span className="action-link">
                        Inizia <ArrowRight />
                    </span>
                </div>
            </section>

            {/* PROGRESS SECTION */}
            <section
                ref={progressRef}
                className={`section animate-on-scroll ${progressVisible ? 'is-visible' : ''}`}
            >
                <div className="section-header">
                    <h2 className="section-title">I tuoi progressi</h2>
                    <button className="section-link" onClick={() => navigate('/profile')}>
                        Vedi tutto <ChevronRight />
                    </button>
                </div>

                <div className="progress-card">
                    {/* Sparkline */}
                    <div className="sparkline-container">
                        {sparklineData.map((value, i) => (
                            <div
                                key={i}
                                className="sparkline-bar"
                                style={{
                                    height: progressVisible ? `${(value / maxSparkline) * 100}%` : '0%',
                                    transitionDelay: `${i * 0.05}s`
                                }}
                            />
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="stats-row">
                        <div className="stat-item">
                            <span className={`stat-value ${parseFloat(averageScore) >= 31 ? 'stat-value--success' : 'stat-value--warning'}`}>
                                {averageScore}
                            </span>
                            <span className="stat-label">Media punteggio</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{stats.totalAnswered}</span>
                            <span className="stat-label">Quiz completati</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{accuracy}%</span>
                            <span className="stat-label">Precisione</span>
                        </div>
                    </div>

                    {/* Threshold bar */}
                    <div className="threshold-bar">
                        <div className="threshold-track">
                            <div
                                className="threshold-fill"
                                style={{
                                    width: progressVisible ? `${Math.min((parseFloat(averageScore) / 45) * 100, 100)}%` : '0%',
                                    transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s'
                                }}
                            />
                        </div>
                        <div className="threshold-marker">
                            <div className="threshold-line" />
                            <span className="threshold-label">Soglia 31/45</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* CATEGORIES */}
            <section
                ref={categoriesRef}
                className={`section animate-on-scroll ${categoriesVisible ? 'is-visible' : ''}`}
            >
                <div className="section-header">
                    <h2 className="section-title">Esplora per argomento</h2>
                </div>

                <div className="categories-wrapper">
                    {/* Left Arrow */}
                    <button
                        className="categories-arrow categories-arrow--left"
                        onClick={() => scrollCategories('left')}
                        aria-label="Scorri a sinistra"
                    >
                        <ChevronLeft />
                    </button>

                    <div className="categories-scroll" ref={categoriesScrollRef}>
                        {CATEGORIES.map((cat, index) => {
                            const count = getCategoryCount(cat.id);
                            const Icon = cat.icon;
                            const isFreeCategory = FREE_CATEGORY_IDS.includes(cat.id);
                            const isLocked = !isAuthenticated && !isFreeCategory;

                            return (
                                <div
                                    key={cat.id}
                                    className={`category-card category-card--${cat.gradient} hover-scale`}
                                    onClick={() => {
                                        if (isLocked) {
                                            navigate('/login');
                                        } else {
                                            navigate('/study', { state: { category: cat.name } });
                                        }
                                    }}
                                    role="button"
                                    tabIndex={0}
                                    style={{
                                        transitionDelay: categoriesVisible ? `${index * 0.05}s` : '0s',
                                        position: 'relative'
                                    }}
                                >
                                    {/* Locked Overlay for premium categories */}
                                    {isLocked && (
                                        <div className="category-locked">
                                            <span className="category-lock-icon">🔒</span>
                                        </div>
                                    )}

                                    <div className="category-icon">
                                        <Icon />
                                    </div>
                                    <span className="category-title">{cat.name}</span>
                                    <span className="category-count">{count} domande</span>
                                    <div className="category-progress">
                                        <div
                                            className="category-progress-fill"
                                            style={{ width: `${Math.random() * 60 + 10}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Right Arrow */}
                    <button
                        className="categories-arrow categories-arrow--right"
                        onClick={() => scrollCategories('right')}
                        aria-label="Scorri a destra"
                    >
                        <ChevronRight />
                    </button>
                </div>
            </section>

            {/* DAILY CHALLENGE */}
            <section
                ref={challengeRef}
                className={`section animate-on-scroll ${challengeVisible ? 'is-visible' : ''}`}
            >
                <div className="challenge-card">
                    <div className="challenge-icon">⭐</div>
                    <h3 className="challenge-title display-text">Sfida del Giorno</h3>
                    <p className="challenge-description">
                        Completa 20 domande e guadagna 50 punti bonus!
                    </p>
                    <div className="challenge-progress-container">
                        <div className="challenge-progress-bar">
                            <div
                                className="challenge-progress-fill"
                                style={{
                                    width: challengeVisible ? `${(8 / 20) * 100}%` : '0%',
                                    transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s'
                                }}
                            />
                        </div>
                        <span className="challenge-progress-text">8/20 completate</span>
                    </div>
                    <button
                        className="challenge-button hover-lift focus-gold"
                        onClick={() => navigate('/study')}
                    >
                        Accetta la sfida
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
