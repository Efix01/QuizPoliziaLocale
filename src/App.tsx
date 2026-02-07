import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const StudyMode = React.lazy(() => import('./pages/StudyMode'));
const SimulationMode = React.lazy(() => import('./pages/SimulationMode'));
const PhysicalPrep = React.lazy(() => import('./pages/PhysicalPrep'));
const Profile = React.lazy(() => import('./pages/Profile'));
const StudyLibrary = React.lazy(() => import('./pages/StudyLibrary'));
const LessonReader = React.lazy(() => import('./pages/LessonReader'));
const Login = React.lazy(() => import('./pages/Login'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const Onboarding = React.lazy(() => import('./pages/Onboarding'));
const TermsOfService = React.lazy(() => import('./pages/TermsOfService'));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'));
const ChiSiamo = React.lazy(() => import('./pages/ChiSiamo'));
const MistakeReview = React.lazy(() => import('./pages/MistakeReview'));

import LoadingSpinner from './components/ui/LoadingSpinner';
import { ToastProvider } from './context/ToastProvider';
import { AuthProvider } from './context/AuthProvider';
import { NotificationProvider } from './context/NotificationProvider';
import { StudyMaterialProvider } from './context/StudyMaterialProvider';
import { CookieProvider } from './context/CookieProvider';
import CookieBanner from './components/ui/CookieBanner';
import { QuizProvider } from './context/QuizProvider';
import WhatsNewModal from './components/ui/WhatsNewModal';
import './components/ui/Toast.css';

function App() {
  return (
    <CookieProvider>
      <AuthProvider>
        <NotificationProvider>
          <StudyMaterialProvider>
            <QuizProvider>
              <ToastProvider>
                <Router>
                  <ScrollToTop />

                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                      {/* Onboarding - First time users */}
                      <Route path="/welcome" element={<Onboarding />} />
                      <Route path="/terms" element={<TermsOfService />} />
                      <Route path="/privacy" element={<PrivacyPolicy />} />
                      <Route path="/chi-siamo" element={<ChiSiamo />} />

                      {/* Auth pages outside Layout (full-screen) */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />

                      {/* Lesson Reader - Full screen without navbar */}
                      <Route path="/manual/:subjectId/:chapterId" element={<LessonReader />} />
                      <Route path="/manual/:subjectId" element={<LessonReader />} />

                      {/* Main app with Layout */}
                      <Route path="/" element={<Layout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="study" element={<StudyMode />} />
                        <Route path="simulation" element={<SimulationMode />} />
                        <Route path="physical" element={<PhysicalPrep />} />
                        <Route path="mistakes" element={<MistakeReview />} />
                        <Route path="manual" element={<StudyLibrary />} />
                        <Route path="profile" element={<Profile />} />
                      </Route>
                    </Routes>
                  </Suspense>
                  <CookieBanner />
                  <WhatsNewModal />
                </Router>
              </ToastProvider>
            </QuizProvider>
          </StudyMaterialProvider>
        </NotificationProvider>
      </AuthProvider>
    </CookieProvider>
  );
}

export default App;
