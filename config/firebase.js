// config/firebase.js
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const { getAuth } = require('firebase/auth');

// Firebase configuration with environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyAPEUiI0EN_D-Ro4uOrzc94YmKk-LqBNjw",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "miformadeaprender-df31f.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "miformadeaprender-df31f",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "miformadeaprender-df31f.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "346102753118",
  appId: process.env.FIREBASE_APP_ID || "1:346102753118:web:58d29fa730a1b53b4e11cf",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-L6PHTQEWGR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);

module.exports = {
  firestore,
  auth,
  app
};