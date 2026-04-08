import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBvhQOpqa78A6DSC22IF1grQtxE7uH3-1Y",
  authDomain: "breakeven-c03de.firebaseapp.com",
  projectId: "breakeven-c03de",
  storageBucket: "breakeven-c03de.appspot.com",
  messagingSenderId: "29856648816",
  appId: "1:29856648816:web:588e787926cc039b9eaeb5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore
export const db = getFirestore(app);

//  Firebase Authentication (THIS WAS MISSING)
export const auth = getAuth(app);
