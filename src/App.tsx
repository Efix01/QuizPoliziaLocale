import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import ScrollToTop from './components/ScrollToTop';

// Lazy-loaded Pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Profile = React.lazy(() => import('./pages/Profile'));
const StudyLibrary = React.lazy(() => import('./pages/StudyLibrary'));
const LessonReader = React.lazy(() => import('./pages/LessonReader'));
const Login = React.lazy(() => import('./pages/Login'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const Onboarding = React.lazy(() => import('./pages/Onboarding'));
const TermsOfService = React.lazy(() => import('./pages/TermsOfService'));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'));
const ChiSiamo = React.lazy(() => import('./pages/ChiSiamo'));
const PhysicalPrep = React.lazy(() => import('./pages/PhysicalPrep'));

// Pagine PL
const Settings = React.lazy(() => import('./pages/Settings'));
const QuickQuizMenu = React.lazy(() => import('./pages/QuickQuizMenu'));
const SimulationMenu = React.lazy(() => import('./pages/SimulationMenu'));
const SimulationSession = React.lazy(() => import('./pages/SimulationSession'));
const StudyMode = React.lazy(() => import('./pages/StudyMode'));

import LoadingSpinner from './components/ui/LoadingSpinner';
import { ToastProvider } from './context/ToastProvider';
import { AuthProvider } from './context/AuthProvider';
import { NotificationProvider } from './context/NotificationProvider';
import { CookieProvider } from './context/CookieProvider';
import CookieBanner from './components/ui/CookieBanner';
import { PLProvider } from './context/PLContext';
import { ProgressProvider } from './context/ProgressContext';
import WhatsNewModal from './components/ui/WhatsNewModal';
import './components/ui/Toast.css';
import ErrorBoundary from './components/ui/ErrorBoundary';

function App() {
  // PULIZIA LEGACY ETREMA (Per risolvere pagina bianca da vecchi dati)
  React.useEffect(() => {
    const LEGACY_KEYS = ['quiz_cfva_auth', 'user_progress', 'cfva_study_state', 'last_quiz_results'];
    let cleaned = false;
    LEGACY_KEYS.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        cleaned = true;
      }
    });
    if (cleaned) {
      console.log('🧹 Puliti dati legacy CFVA per prevenire crash.');
    }
  }, []);

  return (
    <ErrorBoundary>
      <CookieProvider>
        <AuthProvider>
          <NotificationProvider>
            <PLProvider>
              <ProgressProvider>
                <ToastProvider>
                  <Router>
                    <ScrollToTop />

                    <Suspense fallback={<LoadingSpinner />}>
                      <Routes>
                        {/* Onboarding */}
                        <Route path="/welcome" element={<Onboarding />} />
                        <Route path="/terms" element={<TermsOfService />} />
                        <Route path="/privacy" element={<PrivacyPolicy />} />
                        <Route path="/chi-siamo" element={<ChiSiamo />} />

                        {/* Auth */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />

                        {/* Lesson Reader & Simulation & Study - Full screen (No Tabs) */}
                        <Route path="/manual/:subjectId/:chapterId" element={<LessonReader />} />
                        <Route path="/manual/:subjectId" element={<LessonReader />} />
                        <Route path="/simulazione/sessione/:id?" element={<SimulationSession />} />
                        <Route path="/study" element={<StudyMode />} />

                        {/* Main app with Layout */}
                        <Route path="/" element={<Layout />}>
                          <Route index element={<Dashboard />} />
                          <Route path="quiz-veloce" element={<QuickQuizMenu />} />
                          <Route path="simulazione" element={<SimulationMenu />} />
                          <Route path="physical" element={<PhysicalPrep />} />
                          <Route path="manual" element={<StudyLibrary />} />
                          <Route path="profile" element={<Profile />} />
                          <Route path="settings" element={<Settings />} />
                        </Route>
                      </Routes>
                    </Suspense>
                    <CookieBanner />
                    <WhatsNewModal />
                  </Router>
                </ToastProvider>
              </ProgressProvider>
            </PLProvider>
          </NotificationProvider>
        </AuthProvider>
      </CookieProvider>
    </ErrorBoundary>
  );
}

export default App;
