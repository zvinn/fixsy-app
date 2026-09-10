import { initializeApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import { getMessaging, getToken, Messaging } from "firebase/messaging";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Validate Firebase configuration before initialization
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check for missing required Firebase credentials
const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'] as const;
const missingFields = requiredFields.filter(field => !firebaseConfig[field]);

if (missingFields.length > 0) {
  const errorMsg = `
╔════════════════════════════════════════════════════════════════╗
║  ❌ Firebase Configuration Error                              ║
╚════════════════════════════════════════════════════════════════╝

Missing required environment variables:
${missingFields.map(f => `  • VITE_FIREBASE_${f.replace(/([A-Z])/g, '_$1').toUpperCase()}`).join('\n')}

To fix this:
1. Check your .env file in the project root
2. Copy values from Firebase Console → Project Settings → General
3. Restart the dev server after updating .env

Current config status:
  apiKey: ${firebaseConfig.apiKey ? '✓ Set' : '✗ Missing'}
  authDomain: ${firebaseConfig.authDomain ? '✓ Set' : '✗ Missing'}
  projectId: ${firebaseConfig.projectId ? '✓ Set' : '✗ Missing'}
  storageBucket: ${firebaseConfig.storageBucket ? '✓ Set' : '✗ Missing'}
  messagingSenderId: ${firebaseConfig.messagingSenderId ? '✓ Set' : '✗ Missing'}
  appId: ${firebaseConfig.appId ? '✓ Set' : '✗ Missing'}
  `;

  console.error(errorMsg);
  console.warn("[Firebase Resilience] Missing credentials, setting fallback demo values.");
  firebaseConfig.apiKey = firebaseConfig.apiKey || "demo-api-key";
  firebaseConfig.authDomain = firebaseConfig.authDomain || "fixsy-app.firebaseapp.com";
  firebaseConfig.projectId = firebaseConfig.projectId || "fixsy-app";
  firebaseConfig.appId = firebaseConfig.appId || "1:123456789:web:abcdef";
}

const app = initializeApp(firebaseConfig);
const db: Firestore = getFirestore(app);
const auth: Auth = getAuth(app);
let messaging: Messaging | null = null;

try {
  messaging = getMessaging(app);
} catch (error) {
  if (import.meta.env.DEV) {
    console.warn("Firebase Messaging not supported (HTTP).", error);
  }
}

const storage: FirebaseStorage = getStorage(app);

export { db, auth, messaging, getToken, storage };
