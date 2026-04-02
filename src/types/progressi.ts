import { z } from 'zod';

// ==========================================
// 🔑 SINGLE SOURCE OF TRUTH — ParametriEsame
// Usato da: regioni.ts, pl.ts, Settings.tsx, SimulationMenu.tsx
// ==========================================

export const ParametriEsameSchema = z.object({
  numeroDomande: z.number().int().min(1).default(100),
  durataMinuti: z.number().int().min(1).default(90),
  punteggioCorretta: z.number().default(1),
  punteggioErrata: z.number().default(-0.25),
  punteggioNonData: z.number().default(0),
});
export type ParametriEsame = z.infer<typeof ParametriEsameSchema>;


// ==========================================
// 1. PROFILO UTENTE & PL CONFIG
// Path Firestore: users/{userId}/profile/
// ==========================================

export const PLConfigSchema = z.object({
  regioneId: z.string(),
  comuneId: z.string().optional(),
  parametriEsame: ParametriEsameSchema,
  updatedAt: z.string(),
});
export type PLConfig = z.infer<typeof PLConfigSchema>;

export const UserProfileSchema = z.object({
  displayName: z.string(),
  email: z.string().email(),
  plConfig: PLConfigSchema.optional(),
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
  streak: z.number().default(0),
});
export type SRSItem = z.infer<typeof SRSItemSchema>;

export const ErroreLogSchema = z.object({
  domandaId: z.string(),
  count: z.number().positive().default(1),
  lastError: z.string(),
  rispostaData: z.number().min(0).max(3),
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
  rispostaData: z.number().min(0).max(3),
});
export type RisultatoRisposta = z.infer<typeof RisultatoRispostaSchema>;
