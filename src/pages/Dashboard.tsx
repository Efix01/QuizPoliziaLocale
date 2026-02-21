import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { useAuth } from '../context/AuthContext';

import { StudyNotificationBanner } from '../components/ui/StudyNotification';
import DashboardHero from '../components/dashboard/DashboardHero';
import QuickActions from '../components/dashboard/QuickActions';
import DashboardStats from '../components/dashboard/DashboardStats';
import CategoryCarousel from '../components/dashboard/CategoryCarousel';
import DailyChallenge from '../components/dashboard/DailyChallenge';

import './Dashboard.css';

const ONBOARDING_KEY = 'forestali_onboarding_completed';

const Dashboard: React.FC = () => {
    const { stats, todayAnsweredCount, loading } = useQuiz();
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [pageLoaded, setPageLoaded] = useState(false);

    // Check if onboarding is completed
    useEffect(() => {
        try {
            const onboardingCompleted = localStorage.getItem(ONBOARDING_KEY);
            if (onboardingCompleted !== 'true') {
                navigate('/welcome', { replace: true });
            }
        } catch (error) {
            console.warn('LocalStorage access blocked during onboarding check:', error);
            // Fallback: assume completed or handle distinct logic
        }
    }, [navigate]);

    // Page load animation effect
    useEffect(() => {
        const timer = setTimeout(() => setPageLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Calculate stats props
    const accuracy = stats.totalAnswered > 0
        ? Math.round((stats.correctCount / stats.totalAnswered) * 100)
        : 0;

    const averageScore = stats.totalAnswered > 0
        ? ((stats.correctCount * 0.5) / Math.max(stats.totalAnswered, 1) * 90).toFixed(1)
        : '0.0';

    return (
        <div className="dashboard-container">
            <StudyNotificationBanner />

            <DashboardHero
                user={user}
                pageLoaded={pageLoaded}
            />

            <QuickActions
                pageLoaded={pageLoaded}
                isAuthenticated={isAuthenticated}
            />

            <DashboardStats
                stats={stats}
                accuracy={accuracy}
                averageScore={averageScore}
            />

            <CategoryCarousel
                isAuthenticated={isAuthenticated}
                loading={loading}
            />

            <DailyChallenge
                todayAnsweredCount={todayAnsweredCount}
            />
        </div>
    );
};

export default Dashboard;
