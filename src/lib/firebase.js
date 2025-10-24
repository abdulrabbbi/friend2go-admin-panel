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
  storageBucket: "friends2go-3df47.firebasestorage.app", // ✅ correct bucket
  messagingSenderId: "377108240787",
  appId: "1:377108240787:web:83f44c553aacdb5605f066",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app); // ✅ don’t override bucket name
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
};
