import React, { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { Calendar } from 'lucide-react';
import { useStaggerAnimation, useParallax } from '../../hooks/useAnimations';

interface DashboardHeroProps {
    user: User | null;
    pageLoaded: boolean;
}
// ...
const TARGET_DATE = new Date('2025-09-15T09:00:00');

const getGreeting = (): { text: string; emoji: string } => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return { text: 'Buongiorno', emoji: '☀️' };
    if (hour >= 12 && hour < 18) return { text: 'Buon pomeriggio', emoji: '🌤️' };
    if (hour >= 18 && hour < 22) return { text: 'Buonasera', emoji: '🌙' };
    return { text: 'Studio notturno?', emoji: '🦉' };
};

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

const DashboardHero: React.FC<DashboardHeroProps> = ({ user, pageLoaded }) => {
    const parallaxOffset = useParallax(0.3);
    const countdownVisible = useStaggerAnimation(4, 100);
    const greeting = getGreeting();

    const [countdown, setCountdown] = useState(getCountdown(TARGET_DATE));

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(getCountdown(TARGET_DATE));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section
            className="hero-section"
            style={{
                backgroundPositionY: `${parallaxOffset}px`,
                background: 'radial-gradient(ellipse at center bottom, #0D2818 0%, #1E5631 100%)',
            }}
        >
            <div className={`hero-content ${pageLoaded ? 'animate-scale-in' : ''}`}>
                <div className="dashboard-logo">
                    <img src="/logo-cfva.png" alt="Quiz CFVA" className="dashboard-logo-img" />
                </div>

                <div className="hero-greeting">
                    <span className="greeting-emoji">{greeting.emoji}</span>
                    <h1 className="greeting-text display-text">
                        {greeting.text}, {user?.displayName?.split(' ')[0] || 'Candidato'}
                    </h1>
                </div>
                <p className="hero-subtitle">Il tuo obiettivo è vicino</p>

                <div className="countdown-container">
                    {['giorni', 'ore', 'min', 'sec'].map((label, index) => {
                        const values = [countdown.days, countdown.hours, countdown.minutes, countdown.seconds];
                        return (
                            <div
                                key={label}
                                className={`countdown-box ${countdownVisible[index] ? 'animate-spring-up' : ''}`}
                                style={{ opacity: countdownVisible[index] ? 1 : 0 }}
                            >
                                <span className="countdown-number mono-text">{values[index]}</span>
                                <span className="countdown-label">{label}</span>
                            </div>
                        );
                    })}
                </div>

                <div className="countdown-date">
                    <Calendar />
                    <span>Data esame: da definire</span>
                </div>
            </div>
        </section>
    );
};

export default DashboardHero;
