import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getMessaging, getToken } from "firebase/messaging";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAnHVuBwkFiHgUihFvFpf3SwNNbfPjRIhc",
  authDomain: "fixsy-app-1d3b7.firebaseapp.com",
  projectId: "fixsy-app-1d3b7",
  storageBucket: "fixsy-app-1d3b7.firebasestorage.app",
  messagingSenderId: "618012473906",
  appId: "1:618012473906:web:f5bfe5bee5afa89cff5a2b"
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
