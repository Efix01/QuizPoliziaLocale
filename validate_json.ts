
import { DomandaPLSchema } from './src/types/pl';
import fs from 'fs';
import { z } from 'zod';

const data = JSON.parse(fs.readFileSync('./src/data/domandecore.json', 'utf8'));
const domande = data.domande;

const ArrayDomandeSchema = z.array(DomandaPLSchema);

console.log(`Validazione di ${domande.length} domande...`);

for (let i = 0; i < domande.length; i++) {
  const result = DomandaPLSchema.safeParse(domande[i]);
  if (!result.success) {
    console.error(`ERRORE nella domanda #${i} (ID: ${domande[i].id}):`);
    console.error(JSON.stringify(result.error.format(), null, 2));
    process.exit(1);
  }
}

console.log('Tutte le domande sono VALIDE!');
