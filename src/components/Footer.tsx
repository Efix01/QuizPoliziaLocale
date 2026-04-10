import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer style={{
      width: '100%',
      padding: '2rem 1rem',
      background: '#0f172a',
      borderTop: '1px solid #334155',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
      marginTop: 'auto',
    }}>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/chi-siamo" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#f8fafc'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>
          Chi Siamo
        </Link>
        <Link to="/privacy" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#f8fafc'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>
          Privacy Policy
        </Link>
        <Link to="/terms" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#f8fafc'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>
          Termini di Servizio
        </Link>
      </div>
      <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>
        &copy; {new Date().getFullYear()} Quiz Polizia Locale d'Elite.
      </p>
    </footer>
  );
};

export default Footer;