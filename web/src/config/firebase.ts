import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBc3EZpxI9nKbhwHA1MxVaYQy2U8oIrJyM',
  authDomain: 'real-estate-9be10.firebaseapp.com',
  projectId: 'real-estate-9be10',
  storageBucket: 'real-estate-9be10.firebasestorage.app',
  messagingSenderId: '837801236644',
  appId: '1:837801236644:web:c34d1522400d6f7eb7ae31',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
