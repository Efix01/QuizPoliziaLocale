import { z } from 'zod';

export const loginUserSchema = z.object({
  email: z.string().email('Inserisci un indirizzo email valido'),
  password: z.string().min(6, 'La password deve avere almeno 6 caratteri'),
});

export type LoginUser = z.infer<typeof loginUserSchema>;

export const registerUserSchema = z.object({
  email: z.string().email('Inserisci un indirizzo email valido'),
  password: z.string().min(6, 'La password deve avere almeno 6 caratteri'),
  displayName: z.string().min(2, 'Il nome deve avere almeno 2 caratteri'),
});

export type RegisterUser = z.infer<typeof registerUserSchema>;
