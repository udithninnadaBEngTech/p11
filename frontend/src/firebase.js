import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD820rn9fdXRf9-6_JgeJCW9_vx7tvlqU0",
  authDomain: "udithedu.firebaseapp.com",
  projectId: "udithedu",
  storageBucket: "udithedu.firebasestorage.app",
  messagingSenderId: "68765221493",
  appId: "1:68765221493:web:a847dc97aeb2966167ee3c",
  measurementId: "G-QTY8GRN06P"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };