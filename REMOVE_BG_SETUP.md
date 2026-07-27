# Setup Hapus Latar Belakang — Bantuin
Panduan deploy Supabase Edge Function sebagai proxy remove.bg API.

---

## Langkah 1 — Daftar & Ambil API Key remove.bg

1. Buka https://www.remove.bg/dashboard/api-keys
2. Daftar akun (gratis)
3. Copy API key-mu (format: `xxxxxxxxxxxxxxxxxxxx`)
4. Gratis **50 gambar/bulan**, reset otomatis tiap bulan

---

## Langkah 2 — Install Supabase CLI

```bash
# Kalau belum punya, install dulu
npm install -g supabase

# Login ke akun Supabase kamu
supabase login
```

---

## Langkah 3 — Link project ke Supabase

```bash
# Masuk ke folder project Bantuin
cd /path/ke/folder/bantuin

# Link ke project Supabase (Project ID ada di Settings > General di dashboard)
supabase link --project-ref <project-id-kamu>
```

---

## Langkah 4 — Set API Key sebagai Secret

```bash
# Simpan API key remove.bg sebagai environment variable di Supabase
# JANGAN taruh key ini di kode — cukup di sini saja
supabase secrets set REMOVEBG_API_KEY=api_key_kamu_di_sini
```

Verifikasi sudah tersimpan:
```bash
supabase secrets list
```

---

## Langkah 5 — Deploy Edge Function

```bash
# Deploy fungsi remove-background
# --no-verify-jwt artinya tidak perlu login untuk pakai fungsi ini
supabase functions deploy remove-background --no-verify-jwt
```

Setelah berhasil, URL fungsi kamu akan jadi:
```
https://<project-ref>.supabase.co/functions/v1/remove-background
```

---

## Langkah 6 — Test (Opsional)

Test via curl sebelum pasang di HTML:
```bash
curl -X POST https://<project-ref>.supabase.co/functions/v1/remove-background \
  -F "image_file=@/path/ke/foto.jpg" \
  --output hasil.png

# Kalau berhasil, file hasil.png akan muncul tanpa background
```

---

## Langkah 7 — Update HTML (sudah otomatis)

File `pages/hapus-latar-belakang.html` sudah otomatis mengambil URL dari
`SUPABASE_URL` yang ada di `js/supabase-config.js`, jadi tidak perlu edit
apapun selama project-ref di supabase-config.js sudah benar.

```js
// Baris ini di hapus-latar-belakang.html sudah otomatis:
const EDGE_FN_URL = SUPABASE_URL + '/functions/v1/remove-background';
```

---

## Troubleshooting

| Error | Penyebab | Solusi |
|-------|----------|--------|
| `API key belum dikonfigurasi` | Secret belum di-set | Ulangi Langkah 4 |
| `402` / kuota habis | 50 gambar/bulan habis | Tunggu reset awal bulan |
| `CORS error` | Origin diblokir | Pastikan deploy dengan `--no-verify-jwt` |
| `500` dari server | Error di Edge Function | Cek log: `supabase functions logs remove-background` |

Cek log Edge Function:
```bash
supabase functions logs remove-background --tail
```

---

## Struktur File

```
project/
├── supabase/
│   └── functions/
│       └── remove-background/
│           └── index.ts        ← Edge Function (proxy API key)
├── pages/
│   └── hapus-latar-belakang.html  ← Frontend (sudah diupdate)
└── js/
    └── supabase-config.js      ← URL Supabase (sudah ada)
```
