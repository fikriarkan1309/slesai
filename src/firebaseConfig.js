import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyCd1nebtln8mQjrz0VAVLRGhWSSiePW7kU',
  authDomain: 'slesai.firebaseapp.com',
  databaseURL:
    'https://slesai-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'slesai',
  storageBucket: 'slesai.firebasestorage.app',
  messagingSenderId: '977228310518',
  appId: '1:977228310518:web:8c2f148e642cedbcf689d7',
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Ekspor Auth dan Database untuk digunakan di komponen lain
export const auth = getAuth(app);
export const database = getDatabase(app);
