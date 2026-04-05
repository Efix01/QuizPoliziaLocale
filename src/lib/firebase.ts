import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  CACHE_SIZE_UNLIMITED,
  connectFirestoreEmulator,
} from 'firebase/firestore';

// === Validazione variabili d'ambiente ===
const requiredEnvVars = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
} as const;

const missingVars = Object.entries(requiredEnvVars)
  .filter(([, v]) => !v)
  .map(([k]) => `VITE_FIREBASE_${k.toUpperCase()}`);

if (missingVars.length > 0) {
  throw new Error(`Firebase: variabili d'ambiente mancanti:\n${missingVars.join('\n')}`);
}

// === Inizializzazione ===
const app = initializeApp(requiredEnvVars);

// === App Check (reCAPTCHA v3) ===
if (typeof window !== 'undefined') {
  if (import.meta.env.DEV) {
    (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

  const siteKey = import.meta.env.VITE_FIREBASE_RECAPTCHA_SITE_KEY;
  if (siteKey) {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true
    });
  }
}

// === Auth ===
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({ prompt: 'select_account' });

// === Firestore con persistenza offline (PWA) ===
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  }),
});

// === Emulator in sviluppo ===
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATOR === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, 'localhost', 8080);
  console.info('🔧 Firebase Emulator attivo (Auth: 9099, Firestore: 8080)');
}

export default app;
