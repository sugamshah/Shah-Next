import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
const firebaseConfig = {
  apiKey: "AIzaSyDYWLkBJ6idyVA-gDrpvZXFlNhrTl3BKqo",
  authDomain: "shah-communication.firebaseapp.com",
  databaseURL: "https://shah-communication-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "shah-communication",
  storageBucket: "shah-communication.firebasestorage.app",
  messagingSenderId: "368929029727",
  appId: "1:368929029727:web:4d7fd091d8b57a16d3e5ea",
  measurementId: "G-08PPMGBLLN"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

export { app, auth, db, storage };
