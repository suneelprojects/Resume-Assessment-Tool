import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBb8g7O8_qfdeOwjEtvysriTJx-zTdqu4Y",
  authDomain: "applicationtrackinsystem.firebaseapp.com",
  projectId: "applicationtrackinsystem",
  storageBucket: "applicationtrackinsystem.firebasestorage.app",
  messagingSenderId: "551155467947",
  appId: "1:551155467947:web:343a3cbaba73d268f099ee"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut };
