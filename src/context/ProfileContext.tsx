import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { type ProfiloPL, ProfiloPLSchema } from '../types/pl';
import { profileStorage } from '../lib/profileStorage';

interface ProfileContextType {
  profilo: ProfiloPL | null;
  setProfilo: (update: ProfiloPL | ((prev: ProfiloPL | null) => ProfiloPL | null)) => void;
  profiloConfigurato: boolean;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profilo, setProfiloState] = useState<ProfiloPL | null>(null);

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

  // Boot da storage con validazione Zod
  useEffect(() => {
    const data = profileStorage.load();
    if (!data) return;
    const result = ProfiloPLSchema.safeParse(data);
    if (result.success) {
      setProfiloState(result.data);
    } else {
      console.warn('Profilo in storage non valido, reset a null:', result.error.issues);
      profileStorage.clear?.();
    }
  }, []);

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

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile deve essere usato dentro ProfileProvider');
  return context;
}
