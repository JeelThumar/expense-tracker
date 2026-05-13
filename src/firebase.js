import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDSuaIdFhY3h4iVhz54bp4cS_aHp4LB-Yc",
  authDomain: "trecker-525a3.firebaseapp.com",
  projectId: "trecker-525a3",
  storageBucket: "trecker-525a3.firebasestorage.app",
  messagingSenderId: "27984277850",
  appId: "1:27984277850:web:b78b0ce3ded81ffb7c4363",
  measurementId: "G-D0KB203CD3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);