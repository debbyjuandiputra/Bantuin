# Bantuin — Alat Bantu Siswa & Mahasiswa

Aplikasi web statis (HTML, CSS, JS murni — tanpa backend/server).

## Setup Supabase (wajib sebelum dipakai)
Aplikasi bisa dipakai langsung tanpa login (mode tamu) untuk sebagian besar
fitur. Login bersifat opsional dan hanya memakai username (tanpa
password/email). Username di-hash sebelum disimpan ke Supabase, ditambah UID
publik acak 7 digit dan tanggal dibuat. **Ikuti `SUPABASE_SETUP.md` terlebih
dahulu** untuk membuat tabel & RLS di project Supabase Anda (tabel `users`,
`email_canva`, dan `feature_clicks`). Key di `js/supabase-config.js` sudah
diisi (publishable key, aman untuk client-side).

## Cara Hosting (GitHub Pages)
1. Buat repository baru di GitHub, misal `bantuin-app`.
2. Upload semua isi folder ini (index.html, home.html, css/, js/, pages/, assets/) ke root repository.
3. Masuk ke Settings > Pages, pilih branch `main` folder `/root`, simpan.
4. Buka URL GitHub Pages yang diberikan (contoh: `https://username.github.io/bantuin-app/`).

## Cara Convert ke APK (AppGeyser)
1. Buka appgeyser.com, pilih template "Website".
2. Masukkan URL GitHub Pages di atas sebagai sumber.
3. Isi nama aplikasi "Bantuin" dan unggah `assets/icon.png` sebagai ikon.
4. Generate APK.

## Catatan Teknis
- **Mode tamu**: `home.html` dan seluruh halaman fitur bisa diakses langsung
  tanpa login. Halaman Profil & Edit Profil tetap wajib login karena memang
  spesifik ke akun.
- Login hanya pakai **username** (tanpa password), bersifat opsional. Username
  di-hash (SHA-256) sebelum dikirim, sehingga developer tidak melihat username
  asli lewat dashboard Supabase — lihat `SUPABASE_SETUP.md`. Sesi login
  disimpan lokal di perangkat (localStorage), bukan cookie/token server, jadi
  sistem ini bersifat identitas ringan (bukan akun dengan proteksi password
  sungguhan). Tema terang/gelap juga tetap disimpan lokal di perangkat.
- Setelah login, user boleh mengisi **Nama Lengkap** & **Email** secara
  opsional lewat menu Edit Profil (disimpan di tabel `users`, kolom `nama`
  dan `email`).
- Untuk tamu (belum login), sesekali muncul pop-up ajakan login untuk klaim
  promo **Canva Pro 1 Hari**. Setelah berhasil login/daftar, muncul pop-up
  untuk memasukkan email Canva guna mengajukan klaim (disimpan di tabel
  `email_canva`; 1 email hanya bisa klaim 1 kali).
- Setiap fitur yang diklik oleh user yang sudah login dicatat ke tabel
  `feature_clicks` (user_id, nama fitur, waktu klik) untuk keperluan
  statistik penggunaan. Tidak berlaku untuk tamu.
- Fitur Konversi Dokumen, Cek Panjang Karakter, dan pembuatan PDF menggunakan
  pustaka pihak ketiga via CDN (mammoth.js, pdf.js, html2pdf.js, SheetJS) —
  pastikan APK memiliki izin akses internet agar pustaka ini dapat dimuat.
- Fitur berlabel "Segera" sengaja dinonaktifkan dan akan ditambahkan di
  pembaruan berikutnya: Scan Dokumen, To Do List Modern, Alarm & Pengingat,
  Kalkulator Ilmiah, Kalkulator Statistik, dan Hapus Latar Belakang.

Developer: Debby Juandi Putra (DebDev)
Kontak: bantuin.help@gmail.com
