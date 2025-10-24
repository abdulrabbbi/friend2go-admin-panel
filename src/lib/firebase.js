import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAJIPlYot8P07kFyh-1ee8NSCnrVAcX0R8",
  authDomain: "friends2go-3df47.firebaseapp.com",
  projectId: "friends2go-3df47",
  storageBucket: "friends2go-3df47.firebasestorage.app",
  messagingSenderId: "377108240787",
  appId: "1:377108240787:web:83f44c553aacdb5605f066",
};

let app;
let db;
let storage;
let auth;
let googleProvider;

try {
  console.log("[Firebase] Initializing Firebase app...");
  app = initializeApp(firebaseConfig);
  console.log("[Firebase] App initialized successfully");

  db = getFirestore(app);
  console.log("[Firebase] Firestore initialized");

  storage = getStorage(app);
  console.log("[Firebase] Storage initialized");

  auth = getAuth(app);
  console.log("[Firebase] Auth initialized");

  googleProvider = new GoogleAuthProvider();
  console.log("[Firebase] Google provider initialized");
} catch (error) {
  console.error("[Firebase] Initialization error:", error);
  // Create mock objects to prevent crashes
  console.warn("[Firebase] Using fallback mode - authentication will not work");
}

export { db, storage, auth, googleProvider };

export {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
};
