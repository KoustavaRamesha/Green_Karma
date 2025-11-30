import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyANqzbG3-13xc35__7cYTdI3NaaLmya6J4",
    authDomain: "green-kar.firebaseapp.com",
    projectId: "green-kar",
    storageBucket: "green-kar.firebasestorage.app",
    messagingSenderId: "151070089624",
    appId: "1:151070089624:web:da28f99be14418529c8bed",
    measurementId: "G-PPTR41JZVM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
