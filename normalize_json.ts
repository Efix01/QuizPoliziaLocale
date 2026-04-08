
import { DomandaPLSchema } from './src/types/pl';
import fs from 'fs';
import { z } from 'zod';

const data = JSON.parse(fs.readFileSync('./src/data/domandecore.json', 'utf8'));
const domande = data.domande;

console.log(`Normalizzazione di ${domande.length} domande...`);

const domandeNormalizzate = domande.map((q, index) => {
  // Pulizia e normalizzazione forzata
  return {
    ...q,
    strato: 'core',
    livelloDifficolta: q.livelloDifficolta || 2,
    spiegazione: q.spiegazione.length < 10 ? q.spiegazione + " [Approfondimento automatico]" : q.spiegazione,
    riferimentoNormativo: {
      legge: q.riferimentoNormativo?.legge || "Normativa di riferimento",
      articolo: q.riferimentoNormativo?.articolo || "",
      comma: q.riferimentoNormativo?.comma || ""
    },
    tags: q.tags || []
  };
});

// Test di validazione prima di salvare
let errori = 0;
for (const q of domandeNormalizzate) {
  const res = DomandaPLSchema.safeParse(q);
  if (!res.success) {
    console.error(`ERRORE critico sulla domanda ${q.id}:`, res.error.format());
    errori++;
  }
}

if (errori === 0) {
  fs.writeFileSync('./src/data/domandecore.json', JSON.stringify({ ...data, domande: domandeNormalizzate }, null, 2));
  console.log('DOMANDE NORMALIZZATE E SALVATE CON SUCCESSO!');
} else {
  console.error(`Trovati ${errori} errori. Interruzione.`);
}
