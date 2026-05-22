export interface GradoPL {
  titolo: string;
  livelloMin: number;
  color: string;
  badgeEmoji: string;
}

export const GRADI_POLIZIA_LOCALE: GradoPL[] = [
  { titolo: "Agente in Prova", livelloMin: 1, color: "#94a3b8", badgeEmoji: "👮‍♂️" },
  { titolo: "Agente", livelloMin: 3, color: "#60a5fa", badgeEmoji: "👮" },
  { titolo: "Agente Scelto", livelloMin: 5, color: "#3b82f6", badgeEmoji: "🎖️" },
  { titolo: "Assistente", livelloMin: 7, color: "#1d4ed8", badgeEmoji: "🎗️" },
  { titolo: "Assistente Scelto", livelloMin: 9, color: "#1e3a8a", badgeEmoji: "🏅" },
  { titolo: "Vice Sovrintendente", livelloMin: 11, color: "#a855f7", badgeEmoji: "⭐" },
  { titolo: "Sovrintendente", livelloMin: 14, color: "#8b5cf6", badgeEmoji: "🌟" },
  { titolo: "Ispettore", livelloMin: 17, color: "#f59e0b", badgeEmoji: "⚔️" },
  { titolo: "Commissario", livelloMin: 21, color: "#ef4444", badgeEmoji: "👑" },
];

export function ottieniGradoCorrente(livello: number): GradoPL {
  let gradoSelezionato = GRADI_POLIZIA_LOCALE[0];
  for (const g of GRADI_POLIZIA_LOCALE) {
    if (livello >= g.livelloMin) {
      gradoSelezionato = g;
    } else {
      break;
    }
  }
  return gradoSelezionato;
}

export function ottieniProssimoGrado(livello: number): GradoPL | null {
  for (const g of GRADI_POLIZIA_LOCALE) {
    if (g.livelloMin > livello) {
      return g;
    }
  }
  return null;
}
