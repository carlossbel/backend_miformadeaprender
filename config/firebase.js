// config/firebase.js
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const { getAuth } = require('firebase/auth');
const admin = require('firebase-admin');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAPEUiI0EN_D-Ro4uOrzc94YmKk-LqBNjw",
  authDomain: "miformadeaprender-df31f.firebaseapp.com",
  projectId: "miformadeaprender-df31f",
  storageBucket: "miformadeaprender-df31f.firebasestorage.app",
  messagingSenderId: "346102753118",
  appId: "1:346102753118:web:58d29fa730a1b53b4e11cf",
  measurementId: "G-L6PHTQEWGR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);

// Initialize Firebase Admin
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Parse the JSON string from environment variable
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // Fallback for local development
  try {
    serviceAccount = require('../serviceAccountKey.json');
  } catch (error) {
    console.error('Service account file not found, and FIREBASE_SERVICE_ACCOUNT env var not set');
    throw error;
  }
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = {
  firestore,
  auth,
  app,
  admin
};