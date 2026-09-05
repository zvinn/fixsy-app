import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getMessaging, getToken } from "firebase/messaging";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDe--mP0szbc4n2U1ywQB6QaPV9NKv8Pe0",
  authDomain: "fixsy-fefcb.firebaseapp.com",
  projectId: "fixsy-fefcb",
  storageBucket: "fixsy-fefcb.firebasestorage.app",
  messagingSenderId: "688567914798",
  appId: "1:688567914798:web:f9a87a545015a9a837aabf",
  measurementId: "G-R62C56SY2T"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
let messaging = null;
// try {
//   messaging = getMessaging(app);
// } catch (error) {
//   console.warn("Firebase Messaging not supported (HTTP).", error);
// }
const storage = getStorage(app);

export { db, auth, messaging, getToken, storage };
