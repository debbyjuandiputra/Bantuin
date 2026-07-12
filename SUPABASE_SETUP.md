# Setup Supabase — Bantuin

Aplikasi ini memakai Supabase hanya untuk menyimpan **username (dalam bentuk hash)**,
**UID publik acak 7 digit**, dan **tanggal akun dibuat**. Tidak ada password, email,
atau data pribadi lain yang dikirim ke server.

Key yang dipakai di `js/supabase-config.js` adalah **publishable key** (kunci publik),
bukan secret key — aman ditaruh langsung di kode client-side. Proteksi data yang
sesungguhnya diatur lewat **Row Level Security (RLS)** di bawah ini, bukan dengan
menyembunyikan key tersebut.

## 1. Buat tabel

Jalankan SQL berikut di **Supabase Dashboard > SQL Editor**:

```sql
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,        -- hash SHA-256 dari username asli
  user_id integer not null unique,      -- UID publik acak 7 digit
  created_at timestamptz not null default now()
);

-- Batasi agar user_id selalu 7 digit (1000000 - 9999999)
alter table public.users
  add constraint user_id_7_digit check (user_id between 1000000 and 9999999);
```

## 2. Aktifkan Row Level Security (RLS)

```sql
alter table public.users enable row level security;

-- Izinkan siapa saja membuat akun baru (insert)
create policy "Siapa saja boleh daftar"
  on public.users for insert
  to anon
  with check (true);

-- Izinkan siapa saja mengecek apakah sebuah hash username sudah terdaftar
-- (dibutuhkan untuk proses login & cek duplikat saat daftar)
create policy "Siapa saja boleh cek login"
  on public.users for select
  to anon
  using (true);

-- Tidak ada policy UPDATE / DELETE -> baris tidak bisa diubah/dihapus lewat aplikasi.
```

> Karena tidak ada password/token asli yang membuktikan kepemilikan akun,
> `select` memang harus terbuka untuk semua (dipakai untuk mencocokkan hash saat
> login). Yang membuat username tetap privat adalah proses **hashing di sisi
> client** (`js/store.js`) — nilai yang tersimpan di kolom `username` bukan teks
> asli, jadi tidak terbaca meski tabel bisa di-select.

## 3. Cek key di `js/supabase-config.js`

Pastikan `SUPABASE_URL` dan `SUPABASE_PUBLISHABLE_KEY` di `js/supabase-config.js`
sesuai dengan project Supabase Anda (Dashboard > Project Settings > API).

## 4. Selesai

Tidak perlu Supabase Auth. Sistem login username-only ditangani penuh oleh
`js/store.js` (hash username → cek/insert ke tabel `users` → simpan sesi di
`localStorage` perangkat).
