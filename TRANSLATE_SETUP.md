# Setup Fitur Terjemahan — 100% GRATIS

Fitur Terjemahan ada di menu **Lainnya** di halaman utama, dan
sepenuhnya gratis — tidak ada API key berbayar apapun.

## Cara kerja (2 lapis, supaya jarang gagal)

1. **Lapis 1 (utama):** Supabase Edge Function `translate-proxy`
   milik project Bantuin — proxy gratis ke mesin Google Translate
   publik. Karena diproses lewat server (bukan langsung dari
   WebView), hasilnya lebih lengkap: teks terjemahan, deteksi
   bahasa otomatis, kamus/sinonim per kata, dan alternatif
   terjemahan lain.
2. **Lapis 2 (cadangan):** kalau lapis 1 gagal/timeout, aplikasi
   otomatis fallback ke **MyMemory Translation API** (gratis,
   bisa diakses langsung dari browser tanpa proxy) — hasil lebih
   sederhana (tanpa kamus/alternatif) tapi tetap akurat.

## Fitur yang tersedia

- Terjemahan 100+ bahasa (daftar sama seperti Google Translate)
- Deteksi bahasa otomatis
- Tukar bahasa & teks sekali tap
- Kamus & sinonim untuk kata/frasa pendek
- Alternatif terjemahan lain (tap untuk mengganti hasil)
- Dengarkan teks asli maupun hasil terjemahan (text-to-speech)
- Input suara (bicara langsung, otomatis diterjemahkan)
- Tempel dari clipboard, salin hasil
- Riwayat 15 terjemahan terakhir (tersimpan di perangkat)

## Deploy Edge Function

```bash
supabase login
supabase link --project-ref kubydmxgxmvyksyywypi
supabase functions deploy translate-proxy --no-verify-jwt
```

Tidak perlu set secret/API key apapun.

## Verifikasi

```bash
curl -X POST \
  https://kubydmxgxmvyksyywypi.supabase.co/functions/v1/translate-proxy \
  -H "Content-Type: application/json" \
  -d '{"text":"selamat pagi","source":"id","target":"en"}'
```

## Troubleshooting

| Error | Penyebab | Solusi |
|-------|----------|--------|
| "Tidak bisa menerjemahkan..." | Kedua lapis gagal | Cek koneksi internet perangkat |
| Kamus/alternatif tidak muncul | Lapis 1 gagal, fallback ke lapis 2 aktif | Normal — lapis 2 memang tidak menyediakan kamus |
| Input suara tidak berfungsi | Browser/WebView tidak mendukung Web Speech API | Fitur ini butuh dukungan `SpeechRecognition`, tidak semua WebView Android mendukungnya |
| Text-to-speech tidak bersuara | Perangkat belum ada paket suara utk bahasa tsb | Install paket text-to-speech bahasa terkait di pengaturan Android |
