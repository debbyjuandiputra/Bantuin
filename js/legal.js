// Teks Syarat & Ketentuan Penggunaan — Bantuin
// Disimpan sebagai konstanta JS (bukan fetch file) agar tetap tampil
// walau dijalankan offline di dalam WebView APK.

const LEGAL_TEXT = `Syarat dan Ketentuan Penggunaan
Terakhir diperbarui: 12 Juli 2026

Dengan menggunakan aplikasi ini — baik sebagai tamu maupun dengan membuat akun — Anda dianggap telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan berikut.

1. Penggunaan Layanan
Aplikasi ini menyediakan berbagai alat bantu bagi siswa, mahasiswa, dan pengguna umum, seperti konversi file, cek karakter, encode/decode, generator UUID, generator kode autentikator, serta fitur lainnya. Sebagian besar fitur dapat langsung digunakan tanpa membuat akun (mode tamu).

2. Akun Pengguna (Opsional)
Pembuatan akun bersifat opsional dan hanya diperlukan untuk fitur tertentu, seperti klaim promo Canva Pro 1 Hari. Pengguna bertanggung jawab atas kerahasiaan username yang dimilikinya, karena username adalah satu-satunya identitas untuk masuk ke akun (aplikasi ini tidak menggunakan password).
Pengguna wajib menggunakan username miliknya sendiri dan tidak menggunakan identitas milik orang lain tanpa izin.

3. Data Profil Tambahan (Opsional)
Setelah masuk, pengguna dapat menambahkan Nama Lengkap dan Email secara opsional melalui menu Edit Profil. Data ini tidak wajib diisi dan hanya digunakan untuk keperluan yang berkaitan dengan akun Anda, seperti identifikasi pada saat klaim promo.

4. Promo Canva Pro 1 Hari
Pengguna yang sudah masuk dapat mengajukan klaim promo Canva Pro 1 Hari dengan memasukkan email Canva miliknya. Satu email hanya berhak melakukan klaim sebanyak satu kali. Email yang sudah pernah dipakai untuk klaim tidak dapat digunakan kembali.

5. Fitur Catatan
Pengguna yang sudah masuk dapat menulis, menyimpan, mengedit, dan menghapus Catatan pribadi (judul wajib diisi, isi dapat diformat tebal/miring/garis bawah/daftar). Catatan disimpan di server menggunakan enkripsi sederhana sehingga isinya tidak tersimpan sebagai teks polos. Pengguna juga dapat mengekspor Catatan miliknya ke format .txt, .md, atau .docx untuk disimpan di perangkat sendiri. Lihat bagian "Catatan Privasi Data" di bawah untuk penjelasan lebih lanjut soal enkripsi ini.

6. Kewajiban Pengguna
Pengguna dilarang:
- Menggunakan aplikasi untuk kegiatan yang melanggar hukum.
- Menyalahgunakan layanan sehingga mengganggu pengguna lain.
- Mencoba memperoleh akses tanpa izin ke sistem aplikasi.
- Menyebarkan malware, virus, atau kode berbahaya melalui layanan.

7. Hak Pengembang
Pengembang berhak:
- Memperbarui atau menghentikan fitur tertentu.
- Menangguhkan atau menghapus akun yang terbukti melanggar ketentuan.
- Melakukan pemeliharaan sistem sewaktu-waktu.

8. Hak Kekayaan Intelektual
Seluruh hak cipta, desain, logo, ikon, serta konten aplikasi merupakan milik pengembang (DebDev) atau pihak yang memberikan izin penggunaannya.
Pengguna tidak diperbolehkan menyalin, memodifikasi, atau mendistribusikan bagian aplikasi tanpa izin.

9. Batasan Tanggung Jawab
Aplikasi disediakan sebagaimana adanya.
Pengembang tidak bertanggung jawab atas kerugian yang timbul akibat penggunaan aplikasi, kehilangan data, gangguan layanan, maupun kesalahan yang berasal dari perangkat atau jaringan pengguna.

10. Perubahan Layanan
Fitur dalam aplikasi dapat ditambah, diubah, atau dihapus sewaktu-waktu tanpa pemberitahuan terlebih dahulu.

11. Penghentian Akun
Pengembang dapat menonaktifkan akun yang melanggar syarat penggunaan atau ketentuan hukum yang berlaku.

12. Perubahan Syarat dan Ketentuan
Syarat dan Ketentuan ini dapat diperbarui sewaktu-waktu. Versi terbaru akan tersedia di dalam aplikasi.

13. Hukum yang Berlaku
Syarat dan Ketentuan ini diatur sesuai dengan hukum yang berlaku di Republik Indonesia.

—

Catatan Privasi Data
Sebagian besar fitur aplikasi ini dapat dipakai tanpa membuat akun sama sekali (mode tamu), dan tanpa data pribadi apa pun.

Jika Anda memilih membuat akun, Anda hanya perlu username — tanpa password. Username Anda diubah menjadi kode acak satu arah (hash) sebelum dikirim ke server, sehingga pengembang tidak dapat melihat username asli Anda. Sistem menyimpan kode acak tersebut, sebuah UID publik 7 digit, dan tanggal akun dibuat, menggunakan layanan Supabase.

Karena tidak menggunakan password, akun ini bersifat identitas ringan, bukan akun dengan proteksi penuh — siapa pun yang mengetik ulang username yang sama dapat masuk sebagai akun tersebut. Jangan gunakan username yang mudah ditebak orang lain jika Anda ingin menjaga privasi akun Anda.

Nama Lengkap dan Email bersifat opsional dan hanya tersimpan jika Anda mengisinya sendiri melalui menu Edit Profil. Data ini disimpan apa adanya (tidak di-hash) karena dipakai untuk keperluan identifikasi terkait akun Anda, misalnya klaim promo.

Jika Anda mengajukan klaim promo Canva Pro 1 Hari, email Canva yang Anda masukkan akan disimpan untuk memastikan satu email hanya dapat mengklaim promo tersebut satu kali.

Untuk pengguna yang sudah masuk, aplikasi mencatat fitur mana saja yang Anda klik beserta waktunya, semata-mata untuk keperluan statistik penggunaan aplikasi. Pencatatan ini tidak berlaku untuk pengguna yang belum masuk (tamu).

Jika Anda menggunakan fitur Catatan, judul dan isi catatan Anda dienkripsi (AES-GCM) sebelum dikirim dan disimpan di server, sehingga tidak tersimpan sebagai teks polos. Perlu diketahui: karena aplikasi ini tidak menggunakan password asli, kunci enkripsi diturunkan dari UID publik akun Anda yang tertanam di dalam kode aplikasi — bukan dari rahasia yang hanya Anda ketahui. Enkripsi ini melindungi data Anda dari pihak luar yang mungkin melihat data mentah di server, tapi bukan proteksi tingkat produksi terhadap pengembang aplikasi itu sendiri. Anda dapat mengekspor Catatan ke file .txt, .md, atau .docx kapan saja untuk disimpan sebagai cadangan pribadi di perangkat Anda.

Sebagian preferensi tampilan (seperti mode terang/gelap) tetap disimpan secara lokal di perangkat (local storage) karena tidak memerlukan sinkronisasi ke akun Anda.

Dengan menggunakan aplikasi ini, Anda menyetujui penyimpanan data sebagaimana dijelaskan di atas. Anda dapat menghubungi pengembang melalui menu Kontak apabila ingin data akun Anda dihapus dari sistem.`;
