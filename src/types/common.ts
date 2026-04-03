import { z } from 'zod';

// Helper per validazione date ISO (comune a più schemi)
export const isoDateString = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);

// ==========================================
// 🔑 SINGLE SOURCE OF TRUTH — ParametriEsame
// Usato da: regioni.ts, pl.ts, progressi.ts
// ==========================================

export const ParametriEsameSchema = z.object({
  numeroDomande: z.number().int().min(1).default(100),
  durataMinuti: z.number().int().min(1).default(90),
  punteggioCorretta: z.number().default(1),
  punteggioErrata: z.number().default(-0.25),
  punteggioNonData: z.number().default(0),
  sogliaSuperamento: z.number().optional(),
});

export type ParametriEsame = z.infer<typeof ParametriEsameSchema>;
