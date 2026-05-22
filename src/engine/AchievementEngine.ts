/**
 * AchievementEngine — Sistema di traguardi e badge
 * 
 * Valuta lo stato dei progressi dell'utente e rileva quando
 * un traguardo è stato sbloccato. I traguardi premiano
 * comportamenti virtuosi senza banalizzare lo studio.
 */

import type { GlobalProgress } from '../types/progressi';

// ===================================================
// Tipi
// ===================================================

export type AchievementRarity = 'comune' | 'raro' | 'epico' | 'leggendario';

export interface Achievement {
  id: string;
  titolo: string;
  descrizione: string;
  icona: string;
  xpReward: number;
  rarita: AchievementRarity;
  /** Condizione di sblocco (valutata dal motore) */
  condizione: (progressi: GlobalProgress) => boolean;
  /** Descrizione del progresso verso il traguardo */
  progressDesc: (progressi: GlobalProgress) => string;
  /** Percentuale di progresso verso il traguardo (0-100) */
  progressPct: (progressi: GlobalProgress) => number;
}

export interface AchievementSbloccato {
  achievementId: string;
  sbloccatoIl: string; // ISO date
  xpAssegnati: number;
  visto: boolean; // false = mostrare toast
}

// ===================================================
// Catalogo Traguardi
// ===================================================

export const ACHIEVEMENT_CATALOG: Achievement[] = [
  // ── COMUNI (Facili da ottenere — primi giorni) ──
  {
    id: 'primo_quiz',
    titolo: 'Prima Missione',
    descrizione: 'Completa il tuo primo quiz.',
    icona: '🎯',
    xpReward: 50,
    rarita: 'comune',
    condizione: (p) => p.quizCompletati >= 1,
    progressDesc: (p) => `${Math.min(p.quizCompletati, 1)}/1 quiz`,
    progressPct: (p) => Math.min(100, p.quizCompletati >= 1 ? 100 : 0),
  },
  {
    id: 'dieci_quiz',
    titolo: 'Recluta Operativa',
    descrizione: 'Completa 10 quiz.',
    icona: '📋',
    xpReward: 100,
    rarita: 'comune',
    condizione: (p) => p.quizCompletati >= 10,
    progressDesc: (p) => `${Math.min(p.quizCompletati, 10)}/10 quiz`,
    progressPct: (p) => Math.min(100, Math.round((p.quizCompletati / 10) * 100)),
  },
  {
    id: 'streak_3',
    titolo: 'Costanza',
    descrizione: 'Mantieni una streak di 3 giorni consecutivi.',
    icona: '🔥',
    xpReward: 100,
    rarita: 'comune',
    condizione: (p) => p.streak >= 3,
    progressDesc: (p) => `${Math.min(p.streak, 3)}/3 giorni`,
    progressPct: (p) => Math.min(100, Math.round((p.streak / 3) * 100)),
  },

  // ── RARI (1-2 settimane di studio) ──
  {
    id: 'streak_7',
    titolo: 'Settimana di Fuoco',
    descrizione: '7 giorni di studio consecutivi.',
    icona: '🔥',
    xpReward: 250,
    rarita: 'raro',
    condizione: (p) => p.streak >= 7,
    progressDesc: (p) => `${Math.min(p.streak, 7)}/7 giorni`,
    progressPct: (p) => Math.min(100, Math.round((p.streak / 7) * 100)),
  },
  {
    id: 'cinquanta_quiz',
    titolo: 'Veterano',
    descrizione: 'Completa 50 quiz.',
    icona: '🏅',
    xpReward: 300,
    rarita: 'raro',
    condizione: (p) => p.quizCompletati >= 50,
    progressDesc: (p) => `${Math.min(p.quizCompletati, 50)}/50 quiz`,
    progressPct: (p) => Math.min(100, Math.round((p.quizCompletati / 50) * 100)),
  },
  {
    id: 'accuratezza_75',
    titolo: 'Precisione Tattica',
    descrizione: 'Raggiungi il 75% di accuratezza media globale.',
    icona: '🎯',
    xpReward: 300,
    rarita: 'raro',
    condizione: (p) => p.mediaPercentuale >= 75 && p.quizCompletati >= 5,
    progressDesc: (p) => `${p.mediaPercentuale}%/75% media`,
    progressPct: (p) => Math.min(100, Math.round((p.mediaPercentuale / 75) * 100)),
  },
  {
    id: 'tutte_materie',
    titolo: 'Enciclopedico',
    descrizione: 'Studia tutte le materie core nazionali.',
    icona: '📚',
    xpReward: 400,
    rarita: 'raro',
    condizione: (p) => {
      const coreMaterie = ['cds', 'tuel', 'l689', 'l241', 'penale', 'costituzionale', 'amministrativo'];
      return coreMaterie.every(cat => (p.perCategoria[cat]?.fatte ?? 0) >= 5);
    },
    progressDesc: (p) => {
      const coreMaterie = ['cds', 'tuel', 'l689', 'l241', 'penale', 'costituzionale', 'amministrativo'];
      const studiate = coreMaterie.filter(cat => (p.perCategoria[cat]?.fatte ?? 0) >= 5).length;
      return `${studiate}/${coreMaterie.length} materie`;
    },
    progressPct: (p) => {
      const coreMaterie = ['cds', 'tuel', 'l689', 'l241', 'penale', 'costituzionale', 'amministrativo'];
      const studiate = coreMaterie.filter(cat => (p.perCategoria[cat]?.fatte ?? 0) >= 5).length;
      return Math.round((studiate / coreMaterie.length) * 100);
    },
  },
  {
    id: 'livello_5',
    titolo: 'Agente Confermato',
    descrizione: 'Raggiungi il Livello 5.',
    icona: '⭐',
    xpReward: 200,
    rarita: 'raro',
    condizione: (p) => p.livello >= 5,
    progressDesc: (p) => `Livello ${Math.min(p.livello, 5)}/5`,
    progressPct: (p) => Math.min(100, Math.round((p.livello / 5) * 100)),
  },

  // ── EPICI (Studio serio, settimane) ──
  {
    id: 'streak_30',
    titolo: 'Ironman',
    descrizione: '30 giorni di studio consecutivi.',
    icona: '🏔️',
    xpReward: 1000,
    rarita: 'epico',
    condizione: (p) => p.streak >= 30,
    progressDesc: (p) => `${Math.min(p.streak, 30)}/30 giorni`,
    progressPct: (p) => Math.min(100, Math.round((p.streak / 30) * 100)),
  },
  {
    id: 'cento_quiz',
    titolo: 'Centurione',
    descrizione: 'Completa 100 quiz.',
    icona: '💯',
    xpReward: 500,
    rarita: 'epico',
    condizione: (p) => p.quizCompletati >= 100,
    progressDesc: (p) => `${Math.min(p.quizCompletati, 100)}/100 quiz`,
    progressPct: (p) => Math.min(100, Math.round((p.quizCompletati / 100) * 100)),
  },
  {
    id: 'accuratezza_90',
    titolo: 'Cecchino',
    descrizione: 'Raggiungi il 90% di accuratezza media con almeno 200 risposte.',
    icona: '🎯',
    xpReward: 800,
    rarita: 'epico',
    condizione: (p) => {
      const totFatte = Object.values(p.perCategoria).reduce((s, c) => s + c.fatte, 0);
      return p.mediaPercentuale >= 90 && totFatte >= 200;
    },
    progressDesc: (p) => `${p.mediaPercentuale}%/90% media`,
    progressPct: (p) => Math.min(100, Math.round((p.mediaPercentuale / 90) * 100)),
  },
  {
    id: 'livello_10',
    titolo: 'Sottufficiale',
    descrizione: 'Raggiungi il Livello 10.',
    icona: '🎖️',
    xpReward: 500,
    rarita: 'epico',
    condizione: (p) => p.livello >= 10,
    progressDesc: (p) => `Livello ${Math.min(p.livello, 10)}/10`,
    progressPct: (p) => Math.min(100, Math.round((p.livello / 10) * 100)),
  },

  // ── LEGGENDARI (Obiettivi da campione) ──
  {
    id: 'streak_100',
    titolo: 'Leggenda Vivente',
    descrizione: '100 giorni di studio consecutivi.',
    icona: '👑',
    xpReward: 5000,
    rarita: 'leggendario',
    condizione: (p) => p.streak >= 100,
    progressDesc: (p) => `${Math.min(p.streak, 100)}/100 giorni`,
    progressPct: (p) => Math.min(100, Math.round((p.streak / 100) * 100)),
  },
  {
    id: 'livello_20',
    titolo: 'Comandante',
    descrizione: 'Raggiungi il Livello 20.',
    icona: '🏛️',
    xpReward: 2000,
    rarita: 'leggendario',
    condizione: (p) => p.livello >= 20,
    progressDesc: (p) => `Livello ${Math.min(p.livello, 20)}/20`,
    progressPct: (p) => Math.min(100, Math.round((p.livello / 20) * 100)),
  },
  {
    id: 'mille_risposte',
    titolo: 'Maratoneta',
    descrizione: 'Rispondi a 1000 domande corrette.',
    icona: '🏃',
    xpReward: 1500,
    rarita: 'leggendario',
    condizione: (p) => p.risposteCorrette >= 1000,
    progressDesc: (p) => `${Math.min(p.risposteCorrette, 1000)}/1000 corrette`,
    progressPct: (p) => Math.min(100, Math.round((p.risposteCorrette / 1000) * 100)),
  },
];

// ===================================================
// Engine
// ===================================================

/**
 * Valuta quali traguardi sono stati sbloccati ma non ancora registrati.
 * Ritorna la lista dei nuovi traguardi sbloccati.
 */
export function valutaAchievements(
  progressi: GlobalProgress,
  giaSbloccati: Record<string, AchievementSbloccato>,
): Achievement[] {
  const nuoviSbloccati: Achievement[] = [];

  for (const achievement of ACHIEVEMENT_CATALOG) {
    // Già sbloccato → skip
    if (giaSbloccati[achievement.id]) continue;

    // Valuta condizione
    if (achievement.condizione(progressi)) {
      nuoviSbloccati.push(achievement);
    }
  }

  return nuoviSbloccati;
}

/**
 * Calcola lo stato di progresso per tutti i traguardi
 */
export function getAchievementsStatus(
  progressi: GlobalProgress,
  giaSbloccati: Record<string, AchievementSbloccato>,
): Array<{
  achievement: Achievement;
  sbloccato: boolean;
  sbloccatoIl?: string;
  progressPct: number;
  progressDesc: string;
}> {
  return ACHIEVEMENT_CATALOG.map(achievement => {
    const sblocco = giaSbloccati[achievement.id];
    return {
      achievement,
      sbloccato: !!sblocco,
      sbloccatoIl: sblocco?.sbloccatoIl,
      progressPct: sblocco ? 100 : achievement.progressPct(progressi),
      progressDesc: sblocco ? 'Completato!' : achievement.progressDesc(progressi),
    };
  });
}

/**
 * Colore per la rarità del traguardo
 */
export function getAchievementColor(rarita: AchievementRarity): string {
  switch (rarita) {
    case 'comune': return '#94a3b8';
    case 'raro': return '#3b82f6';
    case 'epico': return '#a855f7';
    case 'leggendario': return '#f59e0b';
  }
}

/**
 * Label per la rarità
 */
export function getAchievementRaritaLabel(rarita: AchievementRarity): string {
  switch (rarita) {
    case 'comune': return 'Comune';
    case 'raro': return 'Raro';
    case 'epico': return 'Epico';
    case 'leggendario': return 'Leggendario';
  }
}
