import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';

// Firebase configuration - Replace with your actual config
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "trustsense-demo.firebaseapp.com",
  databaseURL: "https://trustsense-demo-default-rtdb.firebaseio.com",
  projectId: "trustsense-demo",
  storageBucket: "trustsense-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const realtimeDb = getDatabase(app);

// Connect to emulators in development (optional)
if (import.meta.env.DEV) {
  try {
    // Uncomment these lines if using Firebase emulators
    // connectFirestoreEmulator(db, 'localhost', 8080);
    // connectAuthEmulator(auth, 'http://localhost:9099');
    // connectDatabaseEmulator(realtimeDb, 'localhost', 9000);
  } catch (error) {
    console.log('Firebase emulators already connected or not available');
  }
}

export default app;