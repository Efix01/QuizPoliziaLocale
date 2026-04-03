import { doc, getDoc, setDoc, type WriteBatch, type Firestore, deleteField } from 'firebase/firestore';
import { commitInChunks } from './firestoreHelpers';

/**
 * Migrazione atomica dei progressi dalla versione V1 (embedded) alla V2 (sub-collections).
 * 
 * Sposta i dati 'srs' ed 'errori' dal documento /progressi/main alle sub-collections
 * /srsData/{id} ed /errori/{id} per rispettare il limite di 1MB di Firestore.
 */
export async function migrateProgressV1toV2(db: Firestore, uid: string): Promise<boolean> {
  const progressRef = doc(db, 'users', uid, 'progressi', 'main');
  const progressDoc = await getDoc(progressRef);

  if (!progressDoc.exists()) return false;

  const data = progressDoc.data();

  // Se ha già _schemaVersion >= 2, è già migrato
  if (data._schemaVersion && data._schemaVersion >= 2) return false;

  const srs = data.srs || {};
  const errori = data.errori || {};

  // Se non c'è nulla da migrare, marchiamo solo la versione e usciamo
  if (Object.keys(srs).length === 0 && Object.keys(errori).length === 0) {
    await setDoc(progressRef, { ...data, _schemaVersion: 2 }, { merge: true });
    return false;
  }

  console.info(`Migrazione V1→V2 avviata: ${Object.keys(srs).length} SRS, ${Object.keys(errori).length} errori`);

  const operations: Array<(batch: WriteBatch) => void> = [];

  // 1. Sposta SRS nelle subcollection
  Object.entries(srs).forEach(([id, val]) => {
    const ref = doc(db, 'users', uid, 'srsData', id);
    operations.push((batch) => batch.set(ref, val as Record<string, unknown>, { merge: true }));
  });

  // 2. Sposta errori nelle subcollection
  Object.entries(errori).forEach(([id, val]) => {
    const ref = doc(db, 'users', uid, 'errori', id);
    operations.push((batch) => batch.set(ref, val as Record<string, unknown>, { merge: true }));
  });

  // 3. Rimuovi i campi legacy dal documento principale e aggiorna la versione
  operations.push((batch) => {
    batch.update(progressRef, {
      srs: deleteField(),
      errori: deleteField(),
      _schemaVersion: 2,
      lastUpdated: new Date().toISOString()
    });
  });

  // 4. Esecuzione batch (gestisce il limite di 500 ops)
  await commitInChunks(db, operations);

  console.info('Migrazione V1→V2 completata con successo');
  return true;
}
