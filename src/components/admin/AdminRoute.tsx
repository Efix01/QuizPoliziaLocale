import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminRoute() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#fff' }}>
        <p>Valutazione credenziali Cyborg...</p>
      </div>
    );
  }

  // Se l'utente non è autenticato O non è admin
  if (!user || !isAdmin) {
    console.warn("Tentativo di accesso Admin non autorizzato da:", user?.email);
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
