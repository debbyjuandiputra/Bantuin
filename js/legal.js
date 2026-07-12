// Teks Syarat & Ketentuan Penggunaan — Bantuin
// Disimpan sebagai konstanta JS (bukan fetch file) agar tetap tampil
// walau dijalankan offline di dalam WebView APK.

const LEGAL_TEXT = `Syarat dan Ketentuan Penggunaan
Terakhir diperbarui: 11 Juli 2026

Dengan membuat akun atau menggunakan aplikasi ini, Anda dianggap telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan berikut.

1. Penggunaan Layanan
Aplikasi ini menyediakan berbagai alat bantu bagi siswa, mahasiswa, dan pengguna umum, seperti konversi file, pemindaian dokumen, kalkulator, generator UUID, generator kode autentikator, pengingat, serta fitur lainnya.

2. Akun Pengguna
Pengguna bertanggung jawab atas kerahasiaan username yang dimilikinya, karena username adalah satu-satunya identitas untuk masuk ke akun (aplikasi ini tidak menggunakan password).
Pengguna wajib menggunakan username miliknya sendiri dan tidak menggunakan identitas milik orang lain tanpa izin.

3. Kewajiban Pengguna
Pengguna dilarang:
- Menggunakan aplikasi untuk kegiatan yang melanggar hukum.
- Menyalahgunakan layanan sehingga mengganggu pengguna lain.
- Mencoba memperoleh akses tanpa izin ke sistem aplikasi.
- Menyebarkan malware, virus, atau kode berbahaya melalui layanan.

4. Hak Pengembang
Pengembang berhak:
- Memperbarui atau menghentikan fitur tertentu.
- Menangguhkan atau menghapus akun yang terbukti melanggar ketentuan.
- Melakukan pemeliharaan sistem sewaktu-waktu.

5. Hak Kekayaan Intelektual
Seluruh hak cipta, desain, logo, ikon, serta konten aplikasi merupakan milik pengembang (DebDev) atau pihak yang memberikan izin penggunaannya.
Pengguna tidak diperbolehkan menyalin, memodifikasi, atau mendistribusikan bagian aplikasi tanpa izin.

6. Batasan Tanggung Jawab
Aplikasi disediakan sebagaimana adanya.
Pengembang tidak bertanggung jawab atas kerugian yang timbul akibat penggunaan aplikasi, kehilangan data, gangguan layanan, maupun kesalahan yang berasal dari perangkat atau jaringan pengguna.

7. Perubahan Layanan
Fitur dalam aplikasi dapat ditambah, diubah, atau dihapus sewaktu-waktu tanpa pemberitahuan terlebih dahulu.

8. Penghentian Akun
Pengembang dapat menonaktifkan akun yang melanggar syarat penggunaan atau ketentuan hukum yang berlaku.

9. Perubahan Syarat dan Ketentuan
Syarat dan Ketentuan ini dapat diperbarui sewaktu-waktu. Versi terbaru akan tersedia di dalam aplikasi.

10. Hukum yang Berlaku
Syarat dan Ketentuan ini diatur sesuai dengan hukum yang berlaku di Republik Indonesia.

—

Catatan Privasi Data
Aplikasi ini tidak mewajibkan data pribadi apa pun. Anda hanya perlu membuat username untuk masuk — tanpa nama lengkap, email, NIM, atau password. Username Anda diubah menjadi kode acak satu arah (hash) sebelum dikirim ke server, sehingga pengembang tidak dapat melihat username asli Anda. Sistem hanya menyimpan kode acak tersebut, sebuah UID publik 7 digit, dan tanggal akun dibuat, menggunakan layanan Supabase.

Karena tidak menggunakan password, akun ini bersifat identitas ringan, bukan akun dengan proteksi penuh — siapa pun yang mengetik ulang username yang sama dapat masuk sebagai akun tersebut. Jangan gunakan username yang mudah ditebak orang lain jika Anda ingin menjaga privasi akun Anda.

Sebagian preferensi tampilan (seperti mode terang/gelap) tetap disimpan secara lokal di perangkat (local storage) karena tidak memerlukan sinkronisasi ke akun Anda.

Dengan menggunakan aplikasi ini, Anda menyetujui penyimpanan data sebagaimana dijelaskan di atas. Anda dapat menghubungi pengembang melalui menu Kontak apabila ingin data akun Anda dihapus dari sistem.`;
