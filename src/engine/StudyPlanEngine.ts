/**
 * StudyPlanEngine — Motore di pianificazione studio adattivo
 * 
 * Genera un piano di studio personalizzato basato su:
 * - Data del concorso (se nota)
 * - Tempo disponibile giornaliero
 * - Punti deboli rilevati dalle statistiche
 * - Peso delle materie nel bando specifico
 */

import type { GlobalProgress, CategoriaStats } from '../types/progressi';

// ===================================================
// Tipi
// ===================================================

export interface SessioneSuggerita {
  id: string;
  tipo: 'quiz' | 'ripasso_errori' | 'srs' | 'simulazione' | 'studio_manuale';
  categoriaId: string;
  categoriaLabel: string;
  numeroDomande: number;
  priorita: 'alta' | 'media' | 'bassa';
  motivazione: string;
  stimaMinuti: number;
  icona: string;
}

export interface GiornoStudio {
  data: string; // YYYY-MM-DD
  sessioni: SessioneSuggerita[];
  minutiTotali: number;
  completato: boolean;
}

export interface PianoStudio {
  id: string;
  generatoIl: string;
  dataConcorso?: string;
  giorniRimanenti?: number;
  tempoGiornalieroMinuti: number;
  pianificazione: GiornoStudio[];
  faseCorrente: 'fondamenta' | 'consolidamento' | 'simulazioni' | 'sprint_finale';
  prossimaSessione: SessioneSuggerita | null;
}

export interface StatoCategoria {
  id: string;
  label: string;
  accuratezza: number; // 0-100
  domandeFatte: number;
  peso: number; // peso nel piano (0-1)
}

// ===================================================
// Costanti
// ===================================================

const CATEGORIA_LABELS: Record<string, string> = {
  cds:              'Codice della Strada',
  penale:           'Diritto e Proc. Penale',
  l689:             'Legge 689/81 — Sanzioni',
  l241:             'Legge 241/90 — Proc. Amm.',
  tuel:             'TUEL — Enti Locali',
  enti_locali:      'Ordinamento Enti Locali',
  costituzionale:   'Diritto Costituzionale',
  amministrativo:   'Diritto Amministrativo',
  reg_generale:     'Normativa Regionale',
  com_generale:     'Regolamento Comunale',
  logica:           'Logica e Ragionamento',
};

/**
 * Peso base delle materie nel concorso tipico PL.
 * Ordinate per frequenza media nei bandi reali.
 */
const PESO_MATERIE_DEFAULT: Record<string, number> = {
  cds:              0.25, // La materia più pesante
  tuel:             0.15,
  l689:             0.12,
  l241:             0.10,
  penale:           0.10,
  amministrativo:   0.08,
  enti_locali:      0.07,
  costituzionale:   0.05,
  reg_generale:     0.05,
  com_generale:     0.03,
};

const SECONDI_PER_DOMANDA = 25; // media stimata

// ===================================================
// Engine
// ===================================================

/**
 * Analizza le statistiche per categoria e calcola la priorità di studio
 */
export function analizzaCategorie(
  perCategoria: Record<string, CategoriaStats>,
): StatoCategoria[] {
  const categorie: StatoCategoria[] = [];

  // Analizza tutte le categorie con un peso noto
  for (const [catId, peso] of Object.entries(PESO_MATERIE_DEFAULT)) {
    const stats = perCategoria[catId] || { fatte: 0, corrette: 0 };
    const accuratezza = stats.fatte > 0
      ? Math.round((stats.corrette / stats.fatte) * 100)
      : 0;

    categorie.push({
      id: catId,
      label: CATEGORIA_LABELS[catId] || catId,
      accuratezza,
      domandeFatte: stats.fatte,
      peso,
    });
  }

  // Aggiungi eventuali categorie regionali/comunali presenti nei dati
  for (const catId of Object.keys(perCategoria)) {
    if (!PESO_MATERIE_DEFAULT[catId]) {
      const stats = perCategoria[catId];
      const accuratezza = stats.fatte > 0
        ? Math.round((stats.corrette / stats.fatte) * 100)
        : 0;

      categorie.push({
        id: catId,
        label: CATEGORIA_LABELS[catId] || catId,
        accuratezza,
        domandeFatte: stats.fatte,
        peso: catId.startsWith('reg_') ? 0.05 : catId.startsWith('com_') ? 0.03 : 0.02,
      });
    }
  }

  return categorie;
}

/**
 * Calcola il punteggio di priorità per una categoria.
 * Più alto = più urgente da studiare.
 * 
 * Formula: peso_bando × (100 - accuratezza) × fattore_copertura
 * - Categorie mai affrontate ricevono boost (fattore_copertura = 1.5)
 * - Categorie sotto 50% ricevono boost (1.3)
 * - Categorie sopra 80% ricevono riduzione (0.6)
 */
function calcolaPriorita(cat: StatoCategoria): number {
  let fattoreCopertura = 1.0;
  
  if (cat.domandeFatte === 0) {
    fattoreCopertura = 1.5; // Mai studiata → massima urgenza
  } else if (cat.accuratezza < 50) {
    fattoreCopertura = 1.3; // Critica
  } else if (cat.accuratezza >= 80) {
    fattoreCopertura = 0.6; // Già solida
  }

  return cat.peso * (100 - cat.accuratezza) * fattoreCopertura;
}

/**
 * Determina la fase corrente del piano di studio
 */
function determinaFase(
  giorniRimanenti: number | undefined,
  mediaPercentuale: number,
  quizCompletati: number,
): PianoStudio['faseCorrente'] {
  if (giorniRimanenti !== undefined) {
    if (giorniRimanenti <= 7) return 'sprint_finale';
    if (giorniRimanenti <= 21) return 'simulazioni';
    if (giorniRimanenti <= 45) return 'consolidamento';
    return 'fondamenta';
  }

  // Senza data concorso, usa la maturità dell'utente
  if (quizCompletati < 10) return 'fondamenta';
  if (mediaPercentuale < 60) return 'fondamenta';
  if (mediaPercentuale < 75) return 'consolidamento';
  return 'simulazioni';
}

/**
 * Genera la prossima sessione suggerita per oggi
 */
export function generaProssimaSessione(
  progressi: GlobalProgress,
  srsScaduti: number,
  erroriCount: number,
  tempoMinuti: number,
  dataConcorso?: string,
): SessioneSuggerita {
  const categorie = analizzaCategorie(progressi.perCategoria);
  const giorniRimanenti = dataConcorso
    ? Math.max(0, Math.ceil((new Date(dataConcorso).getTime() - Date.now()) / 86_400_000))
    : undefined;
  const fase = determinaFase(giorniRimanenti, progressi.mediaPercentuale, progressi.quizCompletati);

  // PRIORITÀ 1: SRS scaduti (memoria che decade)
  if (srsScaduti > 0) {
    return {
      id: `srs_${Date.now()}`,
      tipo: 'srs',
      categoriaId: 'mix',
      categoriaLabel: 'Ripasso Mnemonico',
      numeroDomande: Math.min(srsScaduti, 20),
      priorita: 'alta',
      motivazione: `${srsScaduti} conoscenze stanno per decadere dalla memoria. Rinforzale ora!`,
      stimaMinuti: Math.min(Math.ceil(srsScaduti * SECONDI_PER_DOMANDA / 60), tempoMinuti),
      icona: '🧠',
    };
  }

  // PRIORITÀ 2: Sprint finale — simulazioni intensive
  if (fase === 'sprint_finale') {
    return {
      id: `sim_${Date.now()}`,
      tipo: 'simulazione',
      categoriaId: 'mix',
      categoriaLabel: 'Simulazione Esame',
      numeroDomande: 30, // Simulazione ridotta
      priorita: 'alta',
      motivazione: `Mancano solo ${giorniRimanenti} giorni! Allenati nelle condizioni reali d'esame.`,
      stimaMinuti: 20,
      icona: '⚡',
    };
  }

  // PRIORITÀ 3: Errori non ripassati (> 10)
  if (erroriCount > 10) {
    return {
      id: `errori_${Date.now()}`,
      tipo: 'ripasso_errori',
      categoriaId: 'mix',
      categoriaLabel: 'Ripasso Errori',
      numeroDomande: Math.min(erroriCount, 15),
      priorita: 'alta',
      motivazione: `Hai ${erroriCount} errori accumulati. Correggili prima di avanzare.`,
      stimaMinuti: Math.ceil(Math.min(erroriCount, 15) * SECONDI_PER_DOMANDA / 60),
      icona: '🔴',
    };
  }

  // PRIORITÀ 4: Materia più debole
  const prioritized = categorie
    .map(cat => ({ ...cat, priorityScore: calcolaPriorita(cat) }))
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const matTarget = prioritized[0];
  const domandePerTempo = Math.max(5, Math.floor((tempoMinuti * 60) / SECONDI_PER_DOMANDA));

  if (matTarget) {
    const isNuova = matTarget.domandeFatte === 0;
    const isCritica = matTarget.accuratezza < 50;

    return {
      id: `quiz_${matTarget.id}_${Date.now()}`,
      tipo: 'quiz',
      categoriaId: matTarget.id,
      categoriaLabel: matTarget.label,
      numeroDomande: Math.min(domandePerTempo, 20),
      priorita: isNuova || isCritica ? 'alta' : 'media',
      motivazione: isNuova
        ? `Non hai ancora studiato ${matTarget.label}. È il ${Math.round(matTarget.peso * 100)}% del bando!`
        : isCritica
          ? `La tua accuratezza su ${matTarget.label} è al ${matTarget.accuratezza}%. Serve rinforzo.`
          : `Consolida ${matTarget.label} per portarla sopra l'80%.`,
      stimaMinuti: tempoMinuti,
      icona: isNuova ? '📖' : isCritica ? '🔥' : '📊',
    };
  }

  // Fallback: quiz generico
  return {
    id: `mix_${Date.now()}`,
    tipo: 'quiz',
    categoriaId: 'mix',
    categoriaLabel: 'Quiz Misto',
    numeroDomande: domandePerTempo,
    priorita: 'media',
    motivazione: 'Continua a esercitarti con un mix di materie per mantenere alta la preparazione.',
    stimaMinuti: tempoMinuti,
    icona: '🎯',
  };
}

/**
 * Genera un piano di studio completo per i prossimi N giorni
 */
export function generaPianoStudio(
  progressi: GlobalProgress,
  srsScaduti: number,
  erroriCount: number,
  tempoGiornalieroMinuti: number,
  dataConcorso?: string,
  giorniDaPianificare: number = 7,
): PianoStudio {
  const categorie = analizzaCategorie(progressi.perCategoria);
  const giorniRimanenti = dataConcorso
    ? Math.max(0, Math.ceil((new Date(dataConcorso).getTime() - Date.now()) / 86_400_000))
    : undefined;
  const fase = determinaFase(giorniRimanenti, progressi.mediaPercentuale, progressi.quizCompletati);

  const giorni = giorniRimanenti !== undefined
    ? Math.min(giorniDaPianificare, giorniRimanenti)
    : giorniDaPianificare;

  const pianificazione: GiornoStudio[] = [];
  const prioritized = categorie
    .map(cat => ({ ...cat, priorityScore: calcolaPriorita(cat) }))
    .sort((a, b) => b.priorityScore - a.priorityScore);

  for (let i = 0; i < giorni; i++) {
    const data = new Date();
    data.setDate(data.getDate() + i);
    const dataStr = data.toISOString().split('T')[0];

    const sessioni: SessioneSuggerita[] = [];
    let minutiUsati = 0;

    // SRS se è il primo giorno
    if (i === 0 && srsScaduti > 0) {
      const srsMinuti = Math.min(Math.ceil(srsScaduti * SECONDI_PER_DOMANDA / 60), 10);
      sessioni.push({
        id: `srs_${dataStr}`,
        tipo: 'srs',
        categoriaId: 'mix',
        categoriaLabel: 'Ripasso Mnemonico',
        numeroDomande: Math.min(srsScaduti, 20),
        priorita: 'alta',
        motivazione: 'Rinforza le conoscenze in scadenza.',
        stimaMinuti: srsMinuti,
        icona: '🧠',
      });
      minutiUsati += srsMinuti;
    }

    // Simulazione periodica (ogni 3-4 giorni nella fase simulazioni/sprint)
    if ((fase === 'simulazioni' || fase === 'sprint_finale') && (i % 3 === 0)) {
      const simMinuti = Math.min(tempoGiornalieroMinuti - minutiUsati, 30);
      if (simMinuti >= 15) {
        sessioni.push({
          id: `sim_${dataStr}`,
          tipo: 'simulazione',
          categoriaId: 'mix',
          categoriaLabel: 'Simulazione Esame',
          numeroDomande: 30,
          priorita: 'alta',
          motivazione: 'Allenamento nelle condizioni reali d\'esame.',
          stimaMinuti: simMinuti,
          icona: '⚡',
        });
        minutiUsati += simMinuti;
      }
    }

    // Riempi il tempo restante con quiz sulla materia prioritaria del giorno
    const tempoRestante = tempoGiornalieroMinuti - minutiUsati;
    if (tempoRestante >= 5) {
      // Ruota tra le materie prioritarie per non fare sempre la stessa
      const matIdx = i % Math.min(prioritized.length, 3);
      const matTarget = prioritized[matIdx];

      if (matTarget) {
        const domandePerTempo = Math.max(5, Math.floor((tempoRestante * 60) / SECONDI_PER_DOMANDA));
        sessioni.push({
          id: `quiz_${matTarget.id}_${dataStr}`,
          tipo: 'quiz',
          categoriaId: matTarget.id,
          categoriaLabel: matTarget.label,
          numeroDomande: Math.min(domandePerTempo, 25),
          priorita: matTarget.domandeFatte === 0 || matTarget.accuratezza < 50 ? 'alta' : 'media',
          motivazione: `Focus su ${matTarget.label} — ${matTarget.accuratezza > 0 ? `accuratezza attuale: ${matTarget.accuratezza}%` : 'non ancora studiata'}`,
          stimaMinuti: tempoRestante,
          icona: matTarget.domandeFatte === 0 ? '📖' : matTarget.accuratezza < 50 ? '🔥' : '📊',
        });
      }
    }

    // Errori una volta a settimana
    if (i % 5 === 2 && erroriCount > 0 && tempoGiornalieroMinuti - minutiUsati >= 5) {
      sessioni.push({
        id: `errori_${dataStr}`,
        tipo: 'ripasso_errori',
        categoriaId: 'mix',
        categoriaLabel: 'Ripasso Errori',
        numeroDomande: Math.min(erroriCount, 10),
        priorita: 'media',
        motivazione: `${erroriCount} errori da correggere.`,
        stimaMinuti: 5,
        icona: '🔴',
      });
    }

    pianificazione.push({
      data: dataStr,
      sessioni,
      minutiTotali: sessioni.reduce((acc, s) => acc + s.stimaMinuti, 0),
      completato: false,
    });
  }

  const prossimaSessione = generaProssimaSessione(
    progressi, srsScaduti, erroriCount, tempoGiornalieroMinuti, dataConcorso
  );

  return {
    id: `piano_${Date.now()}`,
    generatoIl: new Date().toISOString(),
    dataConcorso,
    giorniRimanenti,
    tempoGiornalieroMinuti,
    pianificazione,
    faseCorrente: fase,
    prossimaSessione,
  };
}

/**
 * Calcola un indice di "readiness" (prontezza) pesato sulle materie del bando
 */
export function calcolaReadiness(
  perCategoria: Record<string, CategoriaStats>,
): { 
  score: number; 
  label: string; 
  color: string;
  categorieCritiche: StatoCategoria[];
} {
  const categorie = analizzaCategorie(perCategoria);

  let pesoTotale = 0;
  let scorePesato = 0;
  const critiche: StatoCategoria[] = [];

  for (const cat of categorie) {
    pesoTotale += cat.peso;
    scorePesato += cat.peso * cat.accuratezza;

    if (cat.accuratezza < 60 && cat.domandeFatte > 0) {
      critiche.push(cat);
    }
    if (cat.domandeFatte === 0 && cat.peso > 0.05) {
      critiche.push(cat); // Materie importanti mai studiate
    }
  }

  const score = pesoTotale > 0 ? Math.round(scorePesato / pesoTotale) : 0;

  let label: string;
  let color: string;

  if (score >= 80) {
    label = 'Pronto per l\'esame';
    color = '#22c55e';
  } else if (score >= 65) {
    label = 'Buona preparazione';
    color = '#f59e0b';
  } else if (score >= 40) {
    label = 'In costruzione';
    color = '#f97316';
  } else {
    label = 'Serve più studio';
    color = '#ef4444';
  }

  return {
    score,
    label,
    color,
    categorieCritiche: critiche.sort((a, b) => a.accuratezza - b.accuratezza),
  };
}
