import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-12 px-6 bg-[#0f172a] border-t border-slate-800/50 flex flex-col items-center gap-8 mt-auto">
      <div className="flex gap-8 flex-wrap justify-center">
        <Link 
          to="/concorsi" 
          className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
        >
          Monitor Concorsi
        </Link>
        <Link 
          to="/chi-siamo" 
          className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
        >
          Chi Siamo
        </Link>
        <Link 
          to="/privacy" 
          className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
        >
          Privacy Policy
        </Link>
        <Link 
          to="/terms" 
          className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
        >
          Termini di Servizio
        </Link>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <p className="text-slate-500 text-xs font-semibold tracking-widest uppercase">
          Elite Polizia Locale
        </p>
        <p className="text-slate-600 text-[10px] uppercase tracking-tighter">
          &copy; {new Date().getFullYear()} - Preparazione concorsuale d'eccellenza.
        </p>
      </div>
    </footer>
  );
};

export default Footer;