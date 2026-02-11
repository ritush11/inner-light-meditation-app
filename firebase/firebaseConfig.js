import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDiiFbkiNOojA8smsqboi1sh3BWshuOIr8",
  authDomain: "inner-light-262fa.firebaseapp.com",
  projectId: "inner-light-262fa",
  storageBucket: "inner-light-262fa.firebasestorage.app",
  messagingSenderId: "1045842116189",
  appId: "1:1045842116189:web:61dfd33e7ba4a6880897b4",
  measurementId: "G-XLG65N4T8T"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
