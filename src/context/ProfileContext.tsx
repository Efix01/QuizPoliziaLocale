import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { type ProfiloPL } from '../types/pl';
import { profileStorage } from '../lib/profileStorage';
import { useAuth } from './AuthContext'; // Importiamo useAuth per la sync futura

interface ProfileContextType {
  profilo: ProfiloPL | null;
  setProfilo: (update: ProfiloPL | ((prev: ProfiloPL | null) => ProfiloPL | null)) => void;
  profiloConfigurato: boolean;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth(); // Recuperiamo l'utente per la sync
  const [profilo, setProfiloState] = useState<ProfiloPL | null>(() => profileStorage.load() || null);

  // Stabile — nessuna dipendenza esterna
  const setProfilo = useCallback(
    (update: ProfiloPL | ((prev: ProfiloPL | null) => ProfiloPL | null)) => {
      setProfiloState(prev => {
        const next = typeof update === 'function' ? update(prev) : update;
        if (next) profileStorage.save(next);
        return next;
      });
    },
    []
  );

  // 2. Punto di estensione per sincronizzazione Firestore futura
  // Si attiva ogni volta che il profilo o l'utente cambiano
  useEffect(() => {
    if (!user || !profilo) return;
    
    // TODO: Implementare firestoreProfileSync(user.uid, profilo);
    // console.log(`[Sync] Profilo di ${user.uid} pronto per il backup su Firestore`);
  }, [profilo, user]);

  const value = useMemo<ProfileContextType>(() => ({
    profilo,
    setProfilo,
    profiloConfigurato: profilo !== null,
  }), [profilo, setProfilo]);

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile deve essere usato dentro ProfileProvider');
  return context;
}
