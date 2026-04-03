import React, { createContext, useContext, useState, useEffect } from 'react';
import { type ProfiloPL } from '../types/pl';
import { profileStorage } from '../lib/profileStorage';

interface ProfileContextType {
  profilo: ProfiloPL | null;
  setProfilo: (update: ProfiloPL | ((prev: ProfiloPL | null) => ProfiloPL | null)) => void;
  profiloConfigurato: boolean;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profilo, setProfiloState] = useState<ProfiloPL | null>(null);

  // Wrapper per salvare anche in storage persistente con supporto functional update
  const setProfilo = (update: ProfiloPL | ((prev: ProfiloPL | null) => ProfiloPL | null)) => {
    setProfiloState(prev => {
        const next = typeof update === 'function' ? update(prev) : update;
        if (next) {
            profileStorage.save(next);
        }
        return next;
    });
  };

  // Carica profilo dallo storage al boot
  useEffect(() => {
    const data = profileStorage.load();
    if (data) {
        setProfiloState(data);
    }
  }, []);

  const value: ProfileContextType = {
    profilo,
    setProfilo,
    profiloConfigurato: profilo !== null,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile deve essere usato dentro ProfileProvider');
  return context;
}
