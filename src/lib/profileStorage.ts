import { ProfiloPLSchema, type ProfiloPL } from '../types/pl';

const PROFILO_KEY = 'pl_user_profile';

/**
 * Utility per la gestione della persistenza locale del profilo PL.
 * Isola l'uso di localStorage per permettere future integrazioni (es. Firestore Sync)
 * senza dover modificare la logica dei context React.
 */
export const profileStorage = {
  /**
   * Salva il profilo in localStorage.
   */
  save: (profile: ProfiloPL): void => {
    try {
      localStorage.setItem(PROFILO_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error("Errore salvataggio profilo su storage locale", e);
    }
  },

  /**
   * Carica e valida il profilo dallo storage locale.
   * Restituisce null se non trovato o se la validazione Zod fallisce.
   */
  load: (): ProfiloPL | null => {
    try {
      const stored = localStorage.getItem(PROFILO_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      
      // Validazione Zod per garantire integrità tra versioni diverse dell'app
      const result = ProfiloPLSchema.safeParse(parsed);
      if (result.success) {
        return result.data;
      }

      console.warn("Profilo locale corrotto o non compatibile. Rimozione...", result.error.format());
      localStorage.removeItem(PROFILO_KEY);
      return null;
    } catch (e) {
      console.error("Errore critico durante il caricamento del profilo locale", e);
      return null;
    }
  },

  /**
   * Rimuove il profilo dallo storage locale.
   */
  clear: (): void => {
    localStorage.removeItem(PROFILO_KEY);
  }
};
