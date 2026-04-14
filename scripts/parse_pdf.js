import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import path from 'path';

async function readPdfs() {
    console.log("Inizia lettura PDFs...");
    const dir = path.join(process.cwd(), 'public', '.logica');
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.pdf'));

    for (const file of files) {
        console.log(`\n\n=== LETTURA PDF: ${file} ===\n`);
        const dataBuffer = fs.readFileSync(path.join(dir, file));
        try {
            const data = await pdf(dataBuffer, { max: 5 }); // Legge solo le prime 5 pagine per fare un campione
            console.log(data.text.substring(0, 3000)); 
            console.log("... [TRONCATO] ...");
        } catch (e) {
            console.log("Errore:", e);
        }
    }
}

readPdfs();
