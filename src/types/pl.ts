import { z } from 'zod';
import { ParametriEsameSchema, isoDateString } from './common';

// Ri-esportazione (SSOT ora in common.ts)
export { ParametriEsameSchema };
export type { ParametriEsame } from './common';

// === Categorie (enum tipizzato) ===

export const CategoriaIdSchema = z.enum([
  'cds', 'tuel', 'l241', 'l689', 'penale',
  'reg_generale', 'com_generale'
]);
export type CategoriaId = z.infer<typeof CategoriaIdSchema>;

// === Composizione Quiz ===

export const ComposizioneQuizSchemaPL = z.object({
  percentualeCore: z.number().min(0).max(100).default(70),
  percentualeRegionale: z.number().min(0).max(100).default(25),
  percentualeComunale: z.number().min(0).max(100).default(5),
}).refine(
  ({ percentualeCore, percentualeRegionale, percentualeComunale }) =>
    percentualeCore + percentualeRegionale + percentualeComunale === 100,
  { message: 'Le percentuali devono sommare a 100' }
);
export type ComposizioneQuizPL = z.infer<typeof ComposizioneQuizSchemaPL>;

// === Profilo PL — UNICO schema (sostituisce anche PLConfigSchema) ===

export const ProfiloPLSchema = z.object({
  regioneId: z.string(),
  comuneId: z.string().optional(),
  nomeRegione: z.string(),
  nomeComune: z.string().optional(),
  parametriEsame: ParametriEsameSchema,
  composizioneQuiz: ComposizioneQuizSchemaPL.optional(),
  updatedAt: isoDateString.optional(),
});
export type ProfiloPL = z.infer<typeof ProfiloPLSchema>;

// === Domanda PL ===

const BaseDomandaSchema = z.object({
  id: z.string(),
  categoriaId: CategoriaIdSchema,
  sottoCategoriaId: z.string().optional(),
  testo: z.string().min(5),
  opzioni: z.array(z.string()).length(4),
  rispostaCorretta: z.number().int().min(0).max(3),
  spiegazione: z.string().min(10),
  riferimentoNormativo: z.object({
    legge: z.string(),
    articolo: z.string().optional(),
    comma: z.string().optional(),
  }),
  livelloDifficolta: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  tags: z.array(z.string()).default([]),
});

export const DomandaPLSchema = z.discriminatedUnion('strato', [
  BaseDomandaSchema.extend({ strato: z.literal('core') }),
  BaseDomandaSchema.extend({ strato: z.literal('regionale'), regioneId: z.string() }),
  BaseDomandaSchema.extend({ strato: z.literal('comunale'), regioneId: z.string(), comuneId: z.string() }),
]);
export type DomandaPL = z.infer<typeof DomandaPLSchema>;

// Array helper per validazione bulk
export const ArrayDomandeSchema = z.array(DomandaPLSchema);
