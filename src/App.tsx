
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import Dashboard from './pages/Dashboard';
import StudyMode from './pages/StudyMode';
import SimulationMode from './pages/SimulationMode';
import PhysicalPrep from './pages/PhysicalPrep';
import Profile from './pages/Profile';
import StudyLibrary from './pages/StudyLibrary';
import LessonReader from './pages/LessonReader';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Onboarding from './pages/Onboarding';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ChiSiamo from './pages/ChiSiamo';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { StudyMaterialProvider } from './context/StudyMaterialContext';
import { CookieProvider } from './context/CookieContext';
import CookieBanner from './components/ui/CookieBanner';
import { QuizProvider } from './context/QuizContext';
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
                      <Route path="manual" element={<StudyLibrary />} />
                      <Route path="profile" element={<Profile />} />
                    </Route>
                  </Routes>
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
