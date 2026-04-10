import React, { useMemo } from 'react';
import { ProfileProvider, useProfile } from './ProfileContext';
import { QuizDataProvider, useQuizData } from './QuizDataContext';
import type { ProfiloPL, DomandaPL } from '../types/pl';
// ===================================================
// Tipo unificato (facade)
// ===================================================
interface PLContextType {
  // Profilo
  profilo: ProfiloPL | null;
  setProfilo: (update: ProfiloPL | ((prev: ProfiloPL | null) => ProfiloPL | null)) => void;
  profiloConfigurato: boolean;
  // Domande
  domandeCore: DomandaPL[];
  domandeRegionali: DomandaPL[];
  domandeComunali: DomandaPL[];
  tutteLeDomande: DomandaPL[];
  // Stato
  isLoading: boolean;
  error: string | null;
  // Azioni
  cambiaRegione: (regioneId: string, nomeRegione: string) => Promise<void>;
  cambiaComune: (comuneId: string, nomeComune: string) => Promise<void>;
  // Helper
  totaleDomandeDisponibili: number;
}
// ===================================================
// Provider — compone ProfileProvider + QuizDataProvider
// ===================================================
export function PLProvider({ children }: { children: React.ReactNode }) {
  return (
    <ProfileProvider>
      <QuizDataProvider>
        {children}
      </QuizDataProvider>
    </ProfileProvider>
  );
}
// ===================================================
// Hook facade — fonde i due context specializzati
// useMemo stabilizza il riferimento dell'oggetto risultante
// ===================================================
// eslint-disable-next-line react-refresh/only-export-components
export function usePL(): PLContextType {
  const profile = useProfile();
  const quizData = useQuizData();
  return useMemo(() => ({
    ...profile,
    ...quizData,
  }), [profile, quizData]);
}
