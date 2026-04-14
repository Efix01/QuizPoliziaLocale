import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

// Function to read .env manually since dotenv is missing
async function loadEnv() {
  const envPath = '.env';
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const config = {};
  content.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value.length > 0) {
      config[key.trim()] = value.join('=').trim();
    }
  });
  return config;
}

async function verify() {
  console.log('--- Verifica Firestore (Manuale) ---');
  
  try {
    const env = await loadEnv();
    const firebaseConfig = {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.VITE_FIREBASE_APP_ID,
    };

    if (!firebaseConfig.apiKey) {
      throw new Error('Configurazione Firebase incompleta nel file .env');
    }

    console.log(`Connecting to: ${firebaseConfig.projectId}`);
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const querySnapshot = await getDocs(collection(db, 'domande_core'));
    const count = querySnapshot.size;
    
    console.log(`✅ Successo!`);
    console.log(`Numero di quiz trovati in 'domande_core': ${count}`);
    
    if (count === 25) {
      console.log('✨ Il conteggio corrisponde ai 25 quiz locali.');
    } else {
      console.log(`⚠️ Attenzione: Il conteggio online (${count}) differisce dai 25 locali.`);
    }

  } catch (error) {
    console.error('❌ Errore durante la verifica:', error);
    process.exit(1);
  }
}

verify();
