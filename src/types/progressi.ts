import { z } from 'zod';
import { isoDateString, ParametriEsameSchema } from './common';
import { ProfiloPLSchema } from './pl';

// Ri-esportazione per SSOT
export { isoDateString, ParametriEsameSchema, ProfiloPLSchema };
export type { ParametriEsame } from './common';
export type { ProfiloPL } from './pl';


// ==========================================
// 1. PROFILO UTENTE & PL CONFIG
// Path Firestore: users/{userId}/profile/
// ==========================================


export const UserProfileSchema = z.object({
  displayName: z.string(),
  email: z.string().email(),
  plConfig: ProfiloPLSchema.optional(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;


// ==========================================
// 2. PROGRESSI GLOBALI
// Path Firestore: users/{userId}/progressi/main
// ==========================================

export const CategoriaStatsSchema = z.object({
  fatte: z.number().nonnegative().default(0),
  corrette: z.number().nonnegative().default(0),
});
export type CategoriaStats = z.infer<typeof CategoriaStatsSchema>;

export const GlobalProgressSchema = z.object({
  _schemaVersion: z.union([z.literal(1), z.literal(2)]).default(1),
  quizCompletati: z.number().nonnegative().default(0),
  risposteCorrette: z.number().nonnegative().default(0),
  mediaPercentuale: z.number().min(0).max(100).default(0),

  streak: z.number().nonnegative().default(0),
  livello: z.number().positive().default(1),
  xp: z.number().nonnegative().default(0),
  
  capitoliLetti: z.array(z.string()).default([]),

  // Mappa delle materie: "cds" -> { fatte: 120, corrette: 94 }
  // Include anche regionali: "reg_lazio" -> { fatte: 15, corrette: 11 }
  perCategoria: z.record(z.string(), CategoriaStatsSchema),

  ultimoAccesso: z.string(),
});
export type GlobalProgress = z.infer<typeof GlobalProgressSchema>;


// ==========================================
// 3. SRS E ERRORI (Globali per DomandaId)
// Path Firestore: users/{userId}/srsData/{domandaId}
// Path Firestore: users/{userId}/errori/{domandaId}
// ==========================================

export const SRSItemSchema = z.object({
  domandaId: z.string(),
  easeFactor: z.number().default(2.5),
  interval: z.number().default(1),
  nextReview: z.string(),
  consecutiveCorrect: z.number().default(0),
});
export type SRSItem = z.infer<typeof SRSItemSchema>;

export const ErroreLogSchema = z.object({
  domandaId: z.string(),
  count: z.number().positive().default(1),
  lastError: isoDateString,
  indiceRispostaScelta: z.number().min(0).max(3),
});
export type ErroreLog = z.infer<typeof ErroreLogSchema>;


// ==========================================
// 4. RISULTATO RISPOSTA (FIX #4 — eliminato `any`)
// Usato da: ProgressContext.salvaRisultatoQuiz()
// ==========================================

export const RisultatoRispostaSchema = z.object({
  domandaId: z.string(),
  categoriaId: z.string(),
  corretta: z.boolean(),
  indiceRispostaScelta: z.number().min(-1).max(3),
  timestamp: isoDateString,
});
export type RisultatoRisposta = z.infer<typeof RisultatoRispostaSchema>;
// ==========================================
// 5. LOCAL STORAGE (Sincronizzazione)
// ==========================================

export const LocalStorageProgressSchema = z.object({
  progressi: GlobalProgressSchema,
  srs: z.record(z.string(), SRSItemSchema),
  errori: z.record(z.string(), ErroreLogSchema),
});
export type LocalStorageProgress = z.infer<typeof LocalStorageProgressSchema>;
