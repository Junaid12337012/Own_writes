// src/firebase.ts
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getFunctions, Functions } from "firebase/functions";
// Note: We are not using getAnalytics in the service file, but it's good to have it initialized.
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration from your prompt
const firebaseConfig = {
  apiKey: "AIzaSyATvv5OqPfU2dOQ0oGS5z6RZrUicdekmVk",
  authDomain: "ownwrites-6a0bd.firebaseapp.com",
  projectId: "ownwrites-6a0bd",
  storageBucket: "ownwrites-6a0bd.appspot.com",
  messagingSenderId: "672901299039",
  appId: "1:672901299039:web:de0f5d5ba2827096ead4ea",
  measurementId: "G-X4VETCW81N"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Export the services you'll need throughout your app
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export const functions: Functions = getFunctions(app); // For calling Cloud Functions
export const analytics = getAnalytics(app);

export default app;
