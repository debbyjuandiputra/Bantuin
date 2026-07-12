# Bantuin — Alat Bantu Siswa & Mahasiswa

Aplikasi web statis (HTML, CSS, JS murni — tanpa backend/server).

## Setup Supabase (wajib sebelum dipakai)
Login memakai username saja (tanpa password/email). Username di-hash sebelum
disimpan ke Supabase, ditambah UID publik acak 7 digit dan tanggal dibuat.
**Ikuti `SUPABASE_SETUP.md` terlebih dahulu** untuk membuat tabel & RLS di
project Supabase Anda. Key di `js/supabase-config.js` sudah diisi (publishable
key, aman untuk client-side).

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
- Login hanya pakai **username** (tanpa password). Username di-hash (SHA-256)
  sebelum dikirim, sehingga developer tidak melihat username asli lewat
  dashboard Supabase — lihat `SUPABASE_SETUP.md`. Sesi login disimpan lokal
  di perangkat (localStorage), bukan cookie/token server, jadi sistem ini
  bersifat identitas ringan (bukan akun dengan proteksi password sungguhan).
  Tema terang/gelap juga tetap disimpan lokal di perangkat.
- Fitur Konversi Dokumen, Cek Panjang Karakter, dan pembuatan PDF menggunakan
  pustaka pihak ketiga via CDN (mammoth.js, pdf.js, html2pdf.js, SheetJS) —
  pastikan APK memiliki izin akses internet agar pustaka ini dapat dimuat.
- Fitur berlabel "Segera" sengaja dinonaktifkan dan akan ditambahkan di
  pembaruan berikutnya: Scan Dokumen, To Do List Modern, Alarm & Pengingat,
  Kalkulator Ilmiah, Kalkulator Statistik, dan Hapus Latar Belakang.

Developer: Debby Juandi Putra (DebDev)
Kontak: bantuin.help@gmail.com
