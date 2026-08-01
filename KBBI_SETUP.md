# Setup KBBI VI Daring — Edge Function

Fitur KBBI menggunakan Supabase Edge Function sebagai proxy
ke Anthropic API. Ini memastikan API key tidak pernah
terekspos ke browser/WebView.

---

## Langkah-langkah

### 1. Dapatkan Anthropic API Key

Daftar/login di https://console.anthropic.com
→ API Keys → Create Key
Salin key yang dihasilkan (dimulai dengan `sk-ant-...`)

---

### 2. Deploy Edge Function

Pastikan Supabase CLI sudah terinstall dan kamu sudah login:

```bash
# Install CLI (jika belum)
npm install -g supabase

# Login ke akun Supabase
supabase login

# Link ke project Bantuin
supabase link --project-ref kubydmxgxmvyksyywypi

# Set API key Anthropic sebagai secret
supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx

# Deploy edge function
supabase functions deploy kbbi-proxy --no-verify-jwt
```

---

### 3. Verifikasi

Setelah deploy berhasil, test dengan curl:

```bash
curl -X POST \
  https://kubydmxgxmvyksyywypi.supabase.co/functions/v1/kbbi-proxy \
  -H "Content-Type: application/json" \
  -d '{"kata":"makan","filter":"semua"}'
```

Jika berhasil, akan muncul JSON data KBBI untuk kata "makan".

---

### 4. Selesai!

Buka halaman KBBI di aplikasi Bantuin dan coba cari kata.
Tidak ada perubahan kode lagi yang diperlukan.

---

## Troubleshooting

| Error | Penyebab | Solusi |
|-------|----------|--------|
| `Failed to fetch` | Edge function belum di-deploy | Jalankan langkah 2 |
| `API key belum dikonfigurasi` | Secret belum di-set | Jalankan `supabase secrets set` |
| `Respons AI tidak valid` | Model timeout | Coba lagi, atau cek log di Supabase Dashboard |

Log bisa dilihat di: https://supabase.com/dashboard/project/kubydmxgxmvyksyywypi/functions
