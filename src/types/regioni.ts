import { z } from 'zod';
import { ParametriEsameSchema } from './common';

// ─── Bando concorso ───
export const BandoSchema = z.object({
  anno: z.number().int().positive(),
  posti: z.number().int().nonnegative(),
  fonte: z.string().nullable(),
  parametriEsame: ParametriEsameSchema, // SSoT: importato da progressi.ts
});
export type Bando = z.infer<typeof BandoSchema>;

// ─── Stato disponibilità domande ───
export const DisponibilitaDomandeSchema = z.object({
  disponibili: z.number().int().nonnegative(),
  stato: z.enum(['disponibile', 'coming_soon', 'non_previsto']),
});
export type DisponibilitaDomande = z.infer<typeof DisponibilitaDomandeSchema>;

// ─── Città (ex Comune) ───
export const CittaSchema = z.object({
  id: z.string(),
  nome: z.string(),
  provincia: z.string().length(2),
  popolazione: z.number().int().positive(),
  domandeComunali: DisponibilitaDomandeSchema,
  ultimoBando: BandoSchema.nullable(),
});
export type Citta = z.infer<typeof CittaSchema>;

// ─── Legge Regionale ───
export const LeggeRegionaleSchema = z.object({
  numero: z.string(),
  titolo: z.string(),
  dataApprovazione: z.string().nullable().optional(),
  link: z.string().nullable().optional(),
});

// ─── Altro Comune (fallback per città non in lista) ───
export const AltroComuneSchema = z.object({
  abilitato: z.boolean(),
  label: z.string(),
  descrizione: z.string(),
  parametriEsameDefault: ParametriEsameSchema,
});
export type AltroComune = z.infer<typeof AltroComuneSchema>;

// ─── Regione ───
export const RegioneSchema = z.object({
  id: z.string(),
  nome: z.string(),
  leggeRegionale: LeggeRegionaleSchema.optional(),
  domandeRegionali: DisponibilitaDomandeSchema,
  materialeStudio: z.boolean(),
  citta: z.array(CittaSchema),
  altroComune: AltroComuneSchema.optional(),
});
export type Regione = z.infer<typeof RegioneSchema>;

// ─── Meta (versioning catalogo) ───
export const CatalogoMetaSchema = z.object({
  version: z.string(),
  lastUpdate: z.string(),
  totaleRegioni: z.number().int().nonnegative(),
  totaleCitta: z.number().int().nonnegative(),
  note: z.string().optional(),
});

// ─── Root Schema ───
export const CatalogoRegioniSchema = z.object({
  meta: CatalogoMetaSchema,
  regioni: z.array(RegioneSchema),
});
export type CatalogoRegioni = z.infer<typeof CatalogoRegioniSchema>;
