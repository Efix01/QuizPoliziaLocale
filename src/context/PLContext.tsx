import React, { useMemo } from 'react';
import { ProfileProvider, useProfile } from './ProfileContext';
import { QuizDataProvider, useQuizData } from './QuizDataContext';
import { type ProfiloPL, type DomandaPL } from '../types/pl';

/**
 * Facciata (Facade) per la migrazione graduale dell'architettura PL.
 * Aggrega internamente ProfileContext e QuizDataContext per mantenere 
 * la retrocompatibilità con i componenti esistenti del progetto.
 */

interface PLContextType {
  // Profilo (da ProfileContext)
  profilo: ProfiloPL | null;
  setProfilo: (update: ProfiloPL | ((prev: ProfiloPL | null) => ProfiloPL | null)) => void;
  profiloConfigurato: boolean;

  // Domande caricate (da QuizDataContext)
  domandeCore: DomandaPL[];
  domandeRegionali: DomandaPL[];
  domandeComunali: DomandaPL[];
  tutteLeDomande: DomandaPL[];
  
  // Stato caricamento ed Errori (da QuizDataContext)
  isLoading: boolean;
  error: string | null;
  
  // Cambio regione/comune (da QuizDataContext)
  cambiaRegione: (regioneId: string, nomeRegione: string) => Promise<void>;
  cambiaComune: (comuneId: string, nomeComune: string) => Promise<void>;
  
  // Helper (da QuizDataContext)
  totaleDomandeDisponibili: number;
}

export function PLProvider({ children }: { children: React.ReactNode }) {
  return (
    <ProfileProvider>
      <QuizDataProvider>
        {children}
      </QuizDataProvider>
    </ProfileProvider>
  );
}

/**
 * Hook di convenienza che fonde i due nuovi contesti specializzati.
 * Utilizzato per evitare il refactoring di massa di tutti i componenti UI.
 */
export function usePL(): PLContextType {
  const profile = useProfile();
  const quizData = useQuizData();

  return useMemo(() => ({
    ...profile,
    ...quizData,
  }), [profile, quizData]);
}
