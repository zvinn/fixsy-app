// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

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

export { db, auth };
