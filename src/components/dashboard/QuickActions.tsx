import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Target, ArrowRight, AlertTriangle, Dumbbell } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import LockedOverlay from '../ui/LockedOverlay';

interface QuickActionsProps {
    pageLoaded: boolean;
    isAuthenticated: boolean;
}

const QuickActions: React.FC<QuickActionsProps> = ({ pageLoaded, isAuthenticated }) => {
    const navigate = useNavigate();
    const { markLastStudyTime } = useNotifications();

    const handleStartStudy = (path: string) => {
        markLastStudyTime();
        navigate(path);
    };

    return (
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

            <div
                className={`action-card action-card--mistakes hover-lift focus-gold ${pageLoaded ? 'animate-spring-up delay-500' : ''}`}
                onClick={() => isAuthenticated && navigate('/mistakes')}
                role="button"
                tabIndex={0}
                style={{ opacity: pageLoaded ? 1 : 0, position: 'relative' }}
            >
                {!isAuthenticated && <LockedOverlay message="Accedi per sbloccare" />}
                <div className="action-icon action-icon--mistakes">
                    <AlertTriangle />
                </div>
                <h3 className="action-title">Revisione Errori</h3>
                <p className="action-description">Recupera i tuoi<br />errori recenti</p>
                <span className="action-link">
                    Correggi <ArrowRight />
                </span>
            </div>

            <div
                className={`action-card action-card--physical hover-lift focus-gold ${pageLoaded ? 'animate-spring-up delay-500' : ''}`}
                onClick={() => navigate('/physical')}
                role="button"
                tabIndex={0}
                style={{ opacity: pageLoaded ? 1 : 0 }}
            >
                <div className="action-icon action-icon--physical">
                    <Dumbbell />
                </div>
                <h3 className="action-title">Hub Fisico</h3>
                <p className="action-description">Standard e<br />Cronometro</p>
                <span className="action-link">
                    Allenati <ArrowRight />
                </span>
            </div>
        </section>
    );
};

export default QuickActions;
