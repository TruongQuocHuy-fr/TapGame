import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence, EmailAuthProvider } from "firebase/auth"; // Nhập khẩu EmailAuthProvider
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'; // Thêm AsyncStorage
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Tắt console.warn cho cảnh báo Firebase Analytics
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0].includes("Firebase Analytics is not supported in this environment.")) {
    return; // Bỏ qua cảnh báo này
  }
  originalWarn(...args); // Ghi lại các cảnh báo khác
};

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD1o6e3vwfHvThz9A2eBiia-QDtZaUzWRc",
  authDomain: "tapgame-723d8.firebaseapp.com",
  projectId: "tapgame-723d8",
  storageBucket: "tapgame-723d8.appspot.com",
  messagingSenderId: "1005312092086",
  appId: "1:1005312092086:web:c74d60c8b0e00d663e4317",
  measurementId: "G-B54L1JH555"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// Initialize Firestore
const db = getFirestore(app);

// Initialize analytics only if it's supported
let analytics; // Declare analytics variable
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  } else {
    console.warn("Firebase Analytics is not supported in this environment.");
  }
});

// Xuất auth và EmailAuthProvider
export { auth, EmailAuthProvider, db, analytics };
