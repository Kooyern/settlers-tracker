import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyATKEDZXZyMTFlI5T5JVCgeHg5VuQ047kw",
  authDomain: "settlers-ede0a.firebaseapp.com",
  projectId: "settlers-ede0a",
  storageBucket: "settlers-ede0a.firebasestorage.app",
  messagingSenderId: "921095298966",
  appId: "1:921095298966:web:ab00a64d20cd72c1f7c7b7",
  measurementId: "G-0B5N47FNJM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
