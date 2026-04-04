import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { usePL } from './context/PLContext';

// Pagine
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import QuizBuilder from './pages/QuizBuilder';
import StudyMode from './pages/StudyMode';
import SimulationSession from './pages/SimulationSession';
import ProgressStats from './pages/ProgressStats';
import StudyLibrary from './pages/StudyLibrary';
import Layout from './components/Layout'; // IL NUOVO MENU

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const { profilo, isLoading: plLoading } = usePL();

  if (authLoading || plLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#fff' }}>
        <div className="loader">Caricamento...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Rotte Pubbliche senza Menu */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />

      {/* Onboarding senza Menu */}
      <Route path="/onboarding" element={
        user ? <Onboarding /> : <Navigate to="/login" replace />
      } />

      {/* === ROTTE PROTETTE CON MENU (LAYOUT) === */}
      <Route element={user && profilo?.regioneId ? <Layout /> : <Navigate to={user ? "/onboarding" : "/"} replace />}>
        
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/quiz-builder" element={<QuizBuilder />} />
        <Route path="/progress" element={<ProgressStats />} /> 
        <Route path="/library" element={<StudyLibrary />} />

      </Route>

      {/* === ROTTE PROTETTE SENZA MENU (Per non distrarre durante lo studio) === */}
      <Route path="/study" element={
        user && profilo?.regioneId ? <StudyMode /> : <Navigate to="/dashboard" replace />
      } />
      <Route path="/simulation" element={
        user && profilo?.regioneId ? <SimulationSession /> : <Navigate to="/dashboard" replace />
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
