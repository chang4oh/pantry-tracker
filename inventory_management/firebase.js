// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
//import { getAnalytics, logEvent } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB5uJvltEvs-X2tNdOqQIDt8UA2F4U3iAU",
  authDomain: "inventory-management-6d47c.firebaseapp.com",
  projectId: "inventory-management-6d47c",
  storageBucket: "inventory-management-6d47c.appspot.com",
  messagingSenderId: "1084899817931",
  appId: "1:1084899817931:web:84949d957b3ac7d3e29e4e",
  measurementId: "G-Q9HHTPT7YE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
//const analytics = getAnalytics(app);
//logEvent(analytics, 'notification_received');

export { firestore };