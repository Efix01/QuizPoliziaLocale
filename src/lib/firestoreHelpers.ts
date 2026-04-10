import { writeBatch, type DocumentReference, type WriteBatch } from 'firebase/firestore';
import { db } from './firebase';

export type FirestoreOperation = 
  | { type: 'set'; ref: DocumentReference; data: Record<string, unknown>; options?: { merge: boolean } }
  | { type: 'update'; ref: DocumentReference; data: Record<string, unknown> }
  | { type: 'delete'; ref: DocumentReference };

/**
 * Firestore writeBatch ha un limite di 500 operazioni.
 * Questa funzione divide automaticamente le operazioni in chunk.
 * Supporta sia il formato array di funzioni che l'array di oggetti operazione.
 */
export async function commitInChunks(
  operations: FirestoreOperation[] | Array<(batch: WriteBatch) => void>,
  chunkSize = 450
): Promise<void> {
  if (operations.length === 0) return;

  for (let i = 0; i < operations.length; i += chunkSize) {
    const batch = writeBatch(db);
    const chunk = operations.slice(i, i + chunkSize);

    chunk.forEach(op => {
      if (typeof op === 'function') {
        op(batch);
      } else {
        switch (op.type) {
          case 'set':
            batch.set(op.ref, op.data, op.options || {});
            break;
          case 'update':
            batch.update(op.ref, op.data);
            break;
          case 'delete':
            batch.delete(op.ref);
            break;
        }
      }
    });

    await batch.commit();
  }
}
