import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDZ8jMi-eTrpwfjjXJRFpcdUNeCoWNgkyY",
  authDomain: "baby-tracker-fd3f8.firebaseapp.com",
  projectId: "baby-tracker-fd3f8",
  storageBucket: "baby-tracker-fd3f8.firebasestorage.app",
  messagingSenderId: "742103120084",
  appId: "1:742103120084:web:303738e7239f17e10de341",
  measurementId: "G-4C27RGT43M"
};

let app;
let db = null;

try {
  if (firebaseConfig.apiKey !== "API_KEY_HERE") {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } else {
    console.warn("Firebase no está configurado. Por favor, añade la configuración en src/firebase.js");
  }
} catch (error) {
  console.error("Error inicializando Firebase:", error);
}

export { db };
