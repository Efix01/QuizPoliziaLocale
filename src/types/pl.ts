import { z } from 'zod';
import { ParametriEsameSchema } from './progressi';

// Ri-esportazione del tipo unificato (Single Source of Truth in progressi.ts)
export { ParametriEsameSchema };
export type { ParametriEsame } from './progressi';

// === Profilo PL (Stato locale per l'UI) ===

export const ProfiloPLSchema = z.object({
  regioneId: z.string(),
  comuneId: z.string().optional(),
  nomeRegione: z.string(),
  nomeComune: z.string().optional(),
  parametriEsame: ParametriEsameSchema,
});
export type ProfiloPL = z.infer<typeof ProfiloPLSchema>;

// === Domanda PL ===

export const DomandaPLSchema = z.object({
  id: z.string(),
  strato: z.enum(['core', 'regionale', 'comunale']),
  categoriaId: z.string(),
  sottoCategoriaId: z.string().optional(),
  testo: z.string().min(5),
  opzioni: z.array(z.string()).length(4),
  rispostaCorretta: z.number().int().min(0).max(3),
  spiegazione: z.string(),
  riferimentoNormativo: z.object({
    legge: z.string(),
    articolo: z.string().optional(),
    comma: z.string().optional(),
  }),
  livelloDifficolta: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  tags: z.array(z.string()).default([]),
});
export type DomandaPL = z.infer<typeof DomandaPLSchema>;

// === Composizione Quiz ===

export const ComposizioneQuizSchemaPL = z.object({
  percentualeCore: z.number().min(0).max(100).default(70),
  percentualeRegionale: z.number().min(0).max(100).default(25),
  percentualeComunale: z.number().min(0).max(100).default(5),
});
export type ComposizioneQuizPL = z.infer<typeof ComposizioneQuizSchemaPL>;
