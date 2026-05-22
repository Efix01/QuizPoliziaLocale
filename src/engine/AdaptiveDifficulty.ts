/**
 * AdaptiveDifficulty — Engine per la selezione adattiva delle domande
 * 
 * Adatta la difficoltà dei quiz in tempo reale in base al comportamento dell'utente:
 * - Se risponde correttamente a 5+ consecutive → aumenta difficoltà
 * - Se sbaglia 3+ consecutive → riduce difficoltà e inserisce spiegazioni
 * - Traccia un "livello di padronanza" per ogni sotto-argomento
 */

import type { DomandaPL } from '../types/pl';
import type { GlobalProgress, SRSItem } from '../types/progressi';

// ===================================================
// Tipi
// ===================================================

export type DifficoltaLevel = 1 | 2 | 3;

export interface AdaptiveState {
  /** Risposte corrette consecutive nella sessione corrente */
  consecutiveCorrect: number;
  /** Risposte errate consecutive nella sessione corrente */
  consecutiveWrong: number;
  /** Livello di difficoltà corrente della sessione (1=facile, 2=medio, 3=difficile) */
  currentDifficulty: DifficoltaLevel;
  /** Domande già mostrate in questa sessione (per non ripetere) */
  shownIds: Set<string>;
  /** Contatore totale domande nella sessione */
  totalAnswered: number;
  /** Contatore totale corrette nella sessione */
  totalCorrect: number;
}

export interface AdaptiveConfig {
  /** Dopo quante risposte corrette consecutive aumentare la difficoltà */
  upThreshold: number;
  /** Dopo quante risposte errate consecutive ridurre la difficoltà */
  downThreshold: number;
  /** Prioritizza domande già sbagliate in passato */
  reinforceErrors: boolean;
  /** Percentuale di domande "nuove" (mai viste) da inserire */
  newQuestionRatio: number;
}

// ===================================================
// Config default
// ===================================================

export const DEFAULT_ADAPTIVE_CONFIG: AdaptiveConfig = {
  upThreshold: 5,
  downThreshold: 3,
  reinforceErrors: true,
  newQuestionRatio: 0.3, // 30% nuove
};

// ===================================================
// Funzioni
// ===================================================

/**
 * Crea uno stato adattivo iniziale
 */
export function createAdaptiveState(
  startDifficulty?: DifficoltaLevel,
): AdaptiveState {
  return {
    consecutiveCorrect: 0,
    consecutiveWrong: 0,
    currentDifficulty: startDifficulty ?? 2,
    shownIds: new Set(),
    totalAnswered: 0,
    totalCorrect: 0,
  };
}

/**
 * Calcola il livello di difficoltà iniziale suggerito per una categoria
 * basandosi sulle performance storiche dell'utente.
 */
export function calcolaLivelloIniziale(
  categoriaId: string,
  progressi: GlobalProgress,
): DifficoltaLevel {
  const catStats = progressi.perCategoria[categoriaId];

  if (!catStats || catStats.fatte < 10) return 1; // Poco dato → facile

  const accuratezza = (catStats.corrette / catStats.fatte) * 100;

  if (accuratezza >= 80) return 3;      // Esperto → difficile
  if (accuratezza >= 55) return 2;      // Intermedio → medio
  return 1;                              // Principiante → facile
}

/**
 * Aggiorna lo stato adattivo dopo una risposta.
 * Ritorna il nuovo stato con la difficoltà eventualmente modificata.
 */
export function aggiornaStatoAdattivo(
  state: AdaptiveState,
  isCorrect: boolean,
  config: AdaptiveConfig = DEFAULT_ADAPTIVE_CONFIG,
): AdaptiveState {
  const newState = { ...state };

  newState.totalAnswered += 1;
  if (isCorrect) newState.totalCorrect += 1;

  if (isCorrect) {
    newState.consecutiveCorrect += 1;
    newState.consecutiveWrong = 0;

    // Upgrade difficoltà se la soglia è raggiunta
    if (newState.consecutiveCorrect >= config.upThreshold) {
      if (newState.currentDifficulty < 3) {
        newState.currentDifficulty = (newState.currentDifficulty + 1) as DifficoltaLevel;
        newState.consecutiveCorrect = 0; // Reset dopo upgrade
      }
    }
  } else {
    newState.consecutiveWrong += 1;
    newState.consecutiveCorrect = 0;

    // Downgrade difficoltà se la soglia è raggiunta
    if (newState.consecutiveWrong >= config.downThreshold) {
      if (newState.currentDifficulty > 1) {
        newState.currentDifficulty = (newState.currentDifficulty - 1) as DifficoltaLevel;
        newState.consecutiveWrong = 0; // Reset dopo downgrade
      }
    }
  }

  return newState;
}

/**
 * Seleziona la prossima domanda ottimale da un pool,
 * bilanciando difficoltà adattiva, rinforzo errori e domande nuove.
 */
export function selezionaDomandaAdattiva(
  pool: DomandaPL[],
  state: AdaptiveState,
  erroriLog: Record<string, { count: number }>,
  srsData: Record<string, SRSItem>,
  config: AdaptiveConfig = DEFAULT_ADAPTIVE_CONFIG,
): DomandaPL | null {
  // Filtra domande già mostrate in questa sessione
  const disponibili = pool.filter(d => !state.shownIds.has(d.id));

  if (disponibili.length === 0) return null;

  const targetDifficulty = state.currentDifficulty;

  // Partiziona per difficoltà
  const matchDifficulty = disponibili.filter(d => d.livelloDifficolta === targetDifficulty);
  const closeDifficulty = disponibili.filter(d => Math.abs(d.livelloDifficolta - targetDifficulty) === 1);

  // Pool candidati con la difficoltà giusta (o vicina)
  const candidati = matchDifficulty.length >= 3 ? matchDifficulty : [...matchDifficulty, ...closeDifficulty];

  if (candidati.length === 0) {
    // Fallback: qualsiasi domanda disponibile
    return disponibili[Math.floor(Math.random() * disponibili.length)];
  }

  // Strategia: rinforzo errori
  if (config.reinforceErrors && Math.random() > config.newQuestionRatio) {
    const conErrori = candidati.filter(d => erroriLog[d.id] && erroriLog[d.id].count > 0);
    if (conErrori.length > 0) {
      // Scegli la domanda con più errori
      const sorted = conErrori.sort((a, b) => (erroriLog[b.id]?.count ?? 0) - (erroriLog[a.id]?.count ?? 0));
      return sorted[0];
    }
  }

  // Strategia: SRS scaduto
  const now = new Date();
  const srsScadute = candidati.filter(d => {
    const srs = srsData[d.id];
    return srs && new Date(srs.nextReview) <= now;
  });
  if (srsScadute.length > 0) {
    return srsScadute[Math.floor(Math.random() * srsScadute.length)];
  }

  // Strategia: domande mai viste
  const maiViste = candidati.filter(d => !srsData[d.id] && !erroriLog[d.id]);
  if (maiViste.length > 0 && Math.random() < config.newQuestionRatio) {
    return maiViste[Math.floor(Math.random() * maiViste.length)];
  }

  // Default: random dal pool candidati
  return candidati[Math.floor(Math.random() * candidati.length)];
}

/**
 * Calcola il livello di padronanza di una materia (0-100)
 * Combina accuratezza storica + SRS health + copertura domande
 */
export function calcolaPadronanza(
  categoriaId: string,
  progressi: GlobalProgress,
  srsData: Record<string, SRSItem>,
  totaleDomandeCategoria: number,
): {
  score: number;
  label: string;
  details: {
    accuratezza: number;
    srsHealth: number;
    copertura: number;
  };
} {
  const stats = progressi.perCategoria[categoriaId];
  if (!stats || stats.fatte === 0) {
    return {
      score: 0,
      label: 'Non iniziata',
      details: { accuratezza: 0, srsHealth: 0, copertura: 0 },
    };
  }

  // 1. Accuratezza (0-100)
  const accuratezza = Math.round((stats.corrette / stats.fatte) * 100);

  // 2. SRS Health — quante domande hanno un intervallo SRS >= 7 giorni
  const now = new Date();
  const srsEntries = Object.values(srsData).filter(item => {
    // Approssima: domande in questa categoria (non abbiamo il mapping diretto,
    // ma il SRS contiene tutte le domande globalmente)
    return item && item.interval >= 7 && new Date(item.nextReview) > now;
  });
  const srsHealth = totaleDomandeCategoria > 0
    ? Math.min(100, Math.round((srsEntries.length / totaleDomandeCategoria) * 100))
    : 0;

  // 3. Copertura — quante domande della categoria sono state affrontate
  const copertura = totaleDomandeCategoria > 0
    ? Math.min(100, Math.round((stats.fatte / totaleDomandeCategoria) * 100))
    : 0;

  // Score composto: 50% accuratezza + 25% SRS + 25% copertura
  const score = Math.round(accuratezza * 0.5 + srsHealth * 0.25 + copertura * 0.25);

  let label: string;
  if (score >= 85) label = 'Padronanza';
  else if (score >= 70) label = 'Consolidata';
  else if (score >= 50) label = 'In corso';
  else if (score >= 25) label = 'Debole';
  else label = 'Critica';

  return { score, label, details: { accuratezza, srsHealth, copertura } };
}
