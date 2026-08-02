# Setup KBBI VI Daring — 100% GRATIS

Fitur KBBI sekarang **sepenuhnya gratis**, tidak butuh API key
berbayar apapun. Sumber datanya adalah API publik
`kbbi.raf555.dev` (mirror resmi dari Aplikasi KBBI v6.x).

Ada 2 lapis pengambilan data supaya pencarian tidak gampang gagal:

1. **Lapis 1 (utama):** lewat Supabase Edge Function `kbbi-proxy`
   milik project Bantuin sendiri — ini hanya proxy sederhana ke
   `kbbi.raf555.dev`, tujuannya menghindari kemungkinan koneksi
   langsung dari WebView diblokir (CORS/network policy Android).
2. **Lapis 2 (cadangan):** kalau lapis 1 gagal atau timeout,
   browser/WebView akan fetch langsung ke `kbbi.raf555.dev`.

Kalau kedua lapis gagal (misalnya user tidak ada koneksi internet
sama sekali), aplikasi akan menampilkan pesan error yang jelas,
bukan lagi generic "Failed to fetch".

---

## Langkah-langkah (opsional, untuk deploy ulang Edge Function)

Edge Function `kbbi-proxy` sudah tidak butuh API key sama sekali.
Kalau kamu perlu deploy ulang (misal setelah update kode):

```bash
# Install CLI (jika belum)
npm install -g supabase

# Login ke akun Supabase
supabase login

# Link ke project Bantuin
supabase link --project-ref kubydmxgxmvyksyywypi

# Deploy edge function (tidak perlu set secret apapun lagi)
supabase functions deploy kbbi-proxy --no-verify-jwt
```

---

## Verifikasi

Test proxy dengan curl:

```bash
curl -X POST \
  https://kubydmxgxmvyksyywypi.supabase.co/functions/v1/kbbi-proxy \
  -H "Content-Type: application/json" \
  -d '{"kata":"makan"}'
```

Atau langsung ke sumber data (tanpa proxy sama sekali):

```bash
curl https://kbbi.raf555.dev/api/v1/entry/makan
```

Keduanya gratis dan tidak butuh API key.

---

## Troubleshooting

| Error | Penyebab | Solusi |
|-------|----------|--------|
| "Tidak bisa terhubung ke server KBBI" | Kedua lapis (proxy & fallback) gagal | Cek koneksi internet perangkat |
| "Koneksi lambat/terputus" | Timeout 8 detik terlampaui | Coba lagi, biasanya jaringan lambat |
| Kata tidak ditemukan | Memang tidak ada di KBBI VI, atau salah eja | Cek ejaan kata |

Log Edge Function bisa dilihat di:
https://supabase.com/dashboard/project/kubydmxgxmvyksyywypi/functions
