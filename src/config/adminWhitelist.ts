/**
 * Whitelist degli Amministratori "Cyborg".
 * Inserisci qui le email abilitate ad operare sul CMS privato e sugli Update Normativi.
 * Vengono validate sia qui sul frontend, sia nel Backend da `firestore.rules`.
 */

export const ADMIN_WHITELIST: string[] = [
  "efix01@gmail.com", 
];

export function isUserAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_WHITELIST.includes(email.toLowerCase());
}
