import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Home, BookOpen, ClipboardList, FileText, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './layout.css';

export const Layout: React.FC = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    // Get user initials for avatar
    const getInitials = () => {
        if (!user?.displayName) return user?.email?.charAt(0).toUpperCase() || '?';
        return user.displayName
            .split(' ')
            .map(n => n.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="app-container">
            <main className="content">
                <Outlet />
            </main>
            <nav className="bottom-nav" aria-label="Navigazione principale">
                <NavLink
                    to="/"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    end
                    aria-label="Home"
                >
                    <Home />
                    <span>Home</span>
                </NavLink>
                <NavLink
                    to="/study"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    aria-label="Quiz"
                >
                    <BookOpen />
                    <span>Quiz</span>
                </NavLink>
                <NavLink
                    to="/manual"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    aria-label="Studio"
                >
                    <FileText />
                    <span>Studio</span>
                </NavLink>
                <NavLink
                    to="/simulation"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    aria-label="Simulazione"
                >
                    <ClipboardList />
                    <span>Test</span>
                </NavLink>

                {/* Profile or Login based on auth state */}
                {isAuthenticated ? (
                    <NavLink
                        to="/profile"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        aria-label="Profilo"
                    >
                        <div className="nav-avatar">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt="" className="nav-avatar-img" />
                            ) : (
                                <span className="nav-avatar-initials">{getInitials()}</span>
                            )}
                        </div>
                        <span>Profilo</span>
                    </NavLink>
                ) : (
                    <button
                        className="nav-item nav-login"
                        onClick={() => navigate('/login')}
                        aria-label="Accedi"
                    >
                        <LogIn />
                        <span>Accedi</span>
                    </button>
                )}
            </nav>
        </div>
    );
};
