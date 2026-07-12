# Panduan Setup Firebase untuk Bantuin

Aplikasi ini sekarang memakai **Firebase Authentication** (akun) dan
**Cloud Firestore** (profil & pemetaan username → email), menggantikan
localStorage. Ikuti langkah berikut agar login/daftar berfungsi.

## 1. Buat Project Firebase
1. Buka https://console.firebase.google.com
2. Klik **Add project**, beri nama misalnya `bantuin-app`, ikuti wizard sampai selesai.

## 2. Aktifkan Authentication
1. Di sidebar, buka **Build > Authentication**.
2. Klik **Get started**.
3. Pilih provider **Email/Password**, aktifkan (toggle Enable), simpan.

## 3. Buat Firestore Database
1. Di sidebar, buka **Build > Firestore Database**.
2. Klik **Create database**.
3. Pilih **Start in production mode** (kita akan pasang rules sendiri di langkah 5).
4. Pilih lokasi server (misalnya `asia-southeast2` untuk Indonesia), lanjutkan.

## 4. Tambahkan Web App & Salin Konfigurasi
1. Di halaman utama project (Project Overview), klik ikon **`</>`** (Web).
2. Beri nickname app, misalnya `bantuin-web`, klik **Register app**.
3. Firebase akan menampilkan blok kode `firebaseConfig = {...}` — salin
   seluruh isinya.
4. Buka file **`js/firebase-config.js`** di project ini, ganti nilai
   `GANTI_...` dengan nilai asli dari Firebase Anda.

## 5. Pasang Firestore Security Rules
1. Di **Firestore Database**, buka tab **Rules**.
2. Ganti isinya dengan aturan berikut, lalu klik **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Dokumen data user: hanya pemilik akun yang boleh baca/tulis datanya sendiri
    match /users/{userId} {
      allow read, update: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
    }

    // Pemetaan username -> uid/email: perlu dibaca publik untuk cek
    // ketersediaan username saat daftar & mencari email saat login.
    // Hanya boleh dibuat oleh pemilik akun yang sesuai, tidak boleh diubah/dihapus.
    match /usernames/{username} {
      allow read: if true;
      allow create: if request.auth != null && request.resource.data.uid == request.auth.uid;
      allow update, delete: if false;
    }
  }
}
```

Penjelasan singkat:
- Setiap user hanya bisa membaca & mengubah datanya sendiri di `users/{uid}`.
- Koleksi `usernames` dibuat bisa dibaca publik (tanpa login) karena proses
  cek ketersediaan username (saat daftar) dan pencarian email dari username
  (saat login) terjadi **sebelum** user berhasil masuk.
- Sekali dibuat, dokumen `usernames/{username}` tidak bisa diubah/dihapus
  siapa pun lewat client — supaya username tidak bisa "dibajak".

## 6. Uji Coba
1. Upload seluruh folder ini ke GitHub Pages (lihat README.md).
2. Buka website-nya, coba **Daftar** akun baru.
3. Cek di Firebase Console:
   - **Authentication > Users** — akan muncul akun baru (berdasarkan email).
   - **Firestore Database > Data** — akan muncul koleksi `users` dan `usernames`.

## Catatan
- Firebase pada tier gratis (**Spark Plan**) sudah cukup untuk aplikasi
  skala kecil–menengah.
- Karena login di aplikasi ini pakai **username**, sistem akan mencari
  email yang berpadanan lewat koleksi `usernames` lalu login ke Firebase
  memakai email tersebut — proses ini otomatis, pengguna tetap cukup
  mengetik username seperti biasa.
- Jangan bagikan isi `js/firebase-config.js` yang sudah diisi ke publik
  secara sembarangan sebagai representasi "kerahasiaan" — meski
  sebenarnya nilai `apiKey` Firebase memang didesain untuk terlihat di
  sisi client, keamanan data tetap dijaga lewat Firestore Rules di atas,
  bukan dengan menyembunyikan config ini.
