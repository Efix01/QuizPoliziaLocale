import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ==========================================
// 1. Lettura manuale di .env (no dotenv serve)
// ==========================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../../.env");

const envVars = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) envVars[match[1].trim()] = match[2].trim();
  });
} else {
  console.error("❌ File .env non trovato!");
  process.exit(1);
}

// Configurazione Firebase
const firebaseConfig = {
  apiKey: envVars.VITE_FIREBASE_API_KEY,
  authDomain: envVars.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: envVars.VITE_FIREBASE_PROJECT_ID,
  storageBucket: envVars.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envVars.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: envVars.VITE_FIREBASE_APP_ID,
};

// ==========================================
// 2. Inizializzazione Firebase
// ==========================================
console.log("🔥 Booting Firebase (Migrazione Attiva)...");
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==========================================
// 3. Funzioni di Lettura e Caricamento
// ==========================================
const dataDir = path.resolve(__dirname, "../data");

// Utility: parse sicuro
const safelyLoadJson = (filePath) => {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, "utf-8");
  try {
    const parsed = JSON.parse(content);
    return parsed.domande || [];
  } catch (e) {
    console.error(`❌ Errore parsing ${filePath}`);
    return [];
  }
};

// Carica Core
const uploadCore = async () => {
  const corePath = path.join(dataDir, "domandecore.json");
  const domande = safelyLoadJson(corePath);
  console.log(`⏳ Caricamento ${domande.length} domande CORE in 'domande_core'...`);
  
  let success = 0;
  for (const d of domande) {
    try {
      await setDoc(doc(db, "domande_core", d.id), d);
      success++;
    } catch (err) {
      console.error(`Errore caricamento ${d.id}:`, err);
    }
  }
  console.log(`✅ Core completato: ${success}/${domande.length}`);
};

// Carica Regionali
const uploadRegionali = async () => {
  const regioniDir = path.join(dataDir, "regioni");
  if (!fs.existsSync(regioniDir)) return;
  
  const regioni = fs.readdirSync(regioniDir).filter(f => !f.startsWith("."));
  for (const reg of regioni) {
    const filePath = path.join(regioniDir, reg, "domanderegionali.json");
    if (!fs.existsSync(filePath)) continue;
    
    const domande = safelyLoadJson(filePath);
    console.log(`⏳ Caricamento ${domande.length} domande REGIONALI (${reg}) in 'domande_core'...`);
    let success = 0;
    for (const d of domande) {
      try {
        const fullDoc = { ...d, strato: "regionale", regioneId: reg };
        await setDoc(doc(db, "domande_core", d.id), fullDoc);
        success++;
      } catch (err) {
        console.error(`Errore caricamento ${d.id}:`, err);
      }
    }
    console.log(`✅ Regionale ${reg} completato: ${success}/${domande.length}`);
  }
};

// Carica Comunali
const uploadComunali = async () => {
  const comuniDir = path.join(dataDir, "comuni");
  if (!fs.existsSync(comuniDir)) return;
  
  const comuni = fs.readdirSync(comuniDir).filter(f => !f.startsWith("."));
  for (const com of comuni) {
    const filePath = path.join(comuniDir, com, "domandecomunali.json");
    if (!fs.existsSync(filePath)) continue;
    
    const domande = safelyLoadJson(filePath);
    console.log(`⏳ Caricamento ${domande.length} domande COMUNALI (${com}) in 'domande_core'...`);
    let success = 0;
    for (const d of domande) {
      try {
        const fullDoc = { ...d, strato: "comunale", comuneId: com };
        await setDoc(doc(db, "domande_core", d.id), fullDoc);
        success++;
      } catch (err) {
        console.error(`Errore caricamento ${d.id}:`, err);
      }
    }
    console.log(`✅ Comunale ${com} completato: ${success}/${domande.length}`);
  }
};

// ==========================================
// 4. Avvio esecuzione totale
// ==========================================
const runMigration = async () => {
  console.log("=========================================");
  console.log("   🚀 INIZIO MIGRAZIONE JSON -> FIRESTORE ");
  console.log("=========================================");
  await uploadCore();
  await uploadRegionali();
  await uploadComunali();
  console.log("=========================================");
  console.log("   🎉 MIGRAZIONE COMPLETATA    ");
  console.log("=========================================");
  process.exit(0);
};

runMigration();
