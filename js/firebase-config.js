// ==========================================================
// BANTUIN — firebase-config.js
// ==========================================================
// GANTI seluruh nilai di bawah ini dengan konfigurasi dari
// Firebase Console milik Anda sendiri:
//
// 1. Buka https://console.firebase.google.com
// 2. Buat project baru (atau pakai yang sudah ada)
// 3. Di halaman project, klik ikon "</>" (Add app > Web)
// 4. Beri nama app, lalu Firebase akan menampilkan objek
//    firebaseConfig seperti contoh di bawah — salin nilainya
//    ke sini.
// 5. Aktifkan Authentication > Sign-in method > Email/Password
// 6. Buat Firestore Database (mode production/locked disarankan)
// 7. Pasang Firestore Rules — lihat file FIREBASE_SETUP.md
// ==========================================================

const firebaseConfig = {
  apiKey: "GANTI_DENGAN_API_KEY_ANDA",
  authDomain: "GANTI_PROJECT.firebaseapp.com",
  projectId: "GANTI_PROJECT",
  storageBucket: "GANTI_PROJECT.appspot.com",
  messagingSenderId: "GANTI_SENDER_ID",
  appId: "GANTI_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
