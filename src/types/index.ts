// === Single point of import per tutti i tipi ===

export {
  // Da progressi.ts
  isoDateString,
  ParametriEsameSchema,
  UserProfileSchema,
  CategoriaStatsSchema,
  GlobalProgressSchema,
  SRSItemSchema,
  ErroreLogSchema,
  RisultatoRispostaSchema,
  LocalStorageProgressSchema,
} from './progressi';

export type {
  ParametriEsame,
  UserProfile,
  CategoriaStats,
  GlobalProgress,
  SRSItem,
  ErroreLog,
  RisultatoRisposta,
  LocalStorageProgress,
} from './progressi';

export {
  // Da pl.ts
  CategoriaIdSchema,
  ComposizioneQuizSchemaPL,
  ProfiloPLSchema,
  DomandaPLSchema,
  ArrayDomandeSchema,
} from './pl';

export type {
  CategoriaId,
  ComposizioneQuizPL,
  ProfiloPL,
  DomandaPL,
} from './pl';
