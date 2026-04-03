import { writeBatch, type Firestore, type WriteBatch } from 'firebase/firestore';

/**
 * Firestore writeBatch ha un limite di 500 operazioni.
 * Questa funzione divide automaticamente le operazioni in chunk per rispettare il limite.
 */
export async function commitInChunks(
  db: Firestore,
  operations: Array<(batch: WriteBatch) => void>,
  chunkSize = 490 // Margine di sicurezza rispetto al limite di 500
): Promise<void> {
  for (let i = 0; i < operations.length; i += chunkSize) {
    const batch = writeBatch(db);
    const chunk = operations.slice(i, i + chunkSize);
    chunk.forEach(op => op(batch));
    await batch.commit();
  }
}
