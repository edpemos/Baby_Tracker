import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuración de prueba o vacía hasta que el usuario la reemplace
const firebaseConfig = {
  apiKey: "API_KEY_HERE",
  authDomain: "PROJECT_ID.firebaseapp.com",
  projectId: "PROJECT_ID",
  storageBucket: "PROJECT_ID.firebasestorage.app",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
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
