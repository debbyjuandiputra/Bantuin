# Setup Supabase — Bantuin

Aplikasi ini memakai Supabase untuk:
- Login opsional berbasis **username (dalam bentuk hash)**, **UID publik acak 7 digit**, dan **tanggal akun dibuat**.
- Data profil opsional: **Nama Lengkap** dan **Email** (disimpan apa adanya, tanpa di-hash — karena dipakai untuk keperluan identifikasi, misalnya klaim promo).
- Klaim promo **Canva Pro 1 Hari** (1 email hanya boleh klaim 1 kali).
- Catatan klik fitur (`feature_clicks`) untuk statistik penggunaan, khusus user yang sudah login.

Aplikasi bisa dipakai **tanpa login sama sekali** (mode tamu) untuk sebagian besar fitur. Login hanya diperlukan untuk fitur yang butuh identitas, seperti klaim promo.

Key yang dipakai di `js/supabase-config.js` adalah **publishable key** (kunci publik),
bukan secret key — aman ditaruh langsung di kode client-side. Proteksi data yang
sesungguhnya diatur lewat **Row Level Security (RLS)** di bawah ini, bukan dengan
menyembunyikan key tersebut.

> **Catatan penting soal tipe data `user_id`:** Anda mungkin membayangkan `user_id`
> di tabel `email_canva` dan `feature_clicks` bertipe `text`. Namun karena kolom
> `user_id` di tabel `users` sudah bertipe `integer` (UID publik 7 digit) sejak
> awal, kolom `user_id` di kedua tabel baru ini **ikut dibuat `integer`** juga —
> foreign key di Postgres mengharuskan tipe data yang cocok dengan kolom yang
> dirujuk. Nilainya tetap berupa angka 7 digit yang sama seperti yang tampil di
> halaman Profil.

## 1. (Migrasi) Sesuaikan tabel `users` yang sudah ada

Jika tabel `users` Anda sudah ada dari versi sebelumnya (dengan kolom `id uuid`
sebagai primary key), jalankan migrasi berikut di **SQL Editor**:

```sql
-- Hapus primary key lama (id uuid) dan jadikan user_id sebagai primary key
alter table public.users drop constraint users_pkey;
alter table public.users drop column id;
alter table public.users add primary key (user_id);

-- Tambah kolom profil opsional
alter table public.users add column if not exists nama text;
alter table public.users add column if not exists email text;
```

Jika Anda baru membuat project Supabase dari nol (belum ada tabel `users` sama
sekali), langsung jalankan SQL final di bawah ini tanpa perlu migrasi:

```sql
create table if not exists public.users (
  user_id integer primary key,          -- UID publik acak 7 digit
  username text not null unique,        -- hash SHA-256 dari username asli
  nama text,                            -- opsional, diisi user lewat Edit Profil
  email text,                           -- opsional, diisi user lewat Edit Profil
  created_at timestamptz not null default now()
);

-- Batasi agar user_id selalu 7 digit (1000000 - 9999999)
alter table public.users
  add constraint user_id_7_digit check (user_id between 1000000 and 9999999);
```

## 2. Buat tabel `email_canva` (klaim promo Canva Pro 1 Hari)

```sql
create table if not exists public.email_canva (
  email text primary key,               -- 1 email hanya boleh klaim 1 kali
  user_id integer not null references public.users(user_id),
  created_at timestamptz not null default now()
);
```

## 3. Buat tabel `feature_clicks` (catatan klik fitur)

```sql
create table if not exists public.feature_clicks (
  id bigint generated always as identity primary key,
  user_id integer not null references public.users(user_id),
  feature text not null,                -- nama/id fitur yang diklik
  clicked_at timestamptz not null default now()
);
```

## 4. Aktifkan Row Level Security (RLS)

```sql
-- ---------- users ----------
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

-- Izinkan update untuk menyimpan Nama Lengkap & Email opsional lewat Edit Profil
create policy "Siapa saja boleh update profil"
  on public.users for update
  to anon
  using (true)
  with check (true);

-- Tidak ada policy DELETE -> baris tidak bisa dihapus lewat aplikasi.

-- ---------- email_canva ----------
alter table public.email_canva enable row level security;

-- Izinkan insert klaim baru. Duplikat email otomatis ditolak oleh
-- primary key (email text primary key) -> aplikasi menampilkan
-- "Tidak bisa klaim dengan email ini."
create policy "Siapa saja boleh mengajukan klaim"
  on public.email_canva for insert
  to anon
  with check (true);

-- Tidak ada policy SELECT/UPDATE/DELETE -> daftar email klaim tidak bisa
-- dibaca ulang lewat aplikasi (lebih privat), dan tidak bisa diubah/dihapus.

-- ---------- feature_clicks ----------
alter table public.feature_clicks enable row level security;

-- Izinkan insert catatan klik fitur.
create policy "Siapa saja boleh mencatat klik fitur"
  on public.feature_clicks for insert
  to anon
  with check (true);

-- Tidak ada policy SELECT/UPDATE/DELETE -> data klik tidak bisa dibaca,
-- diubah, atau dihapus lewat aplikasi (hanya lewat dashboard Supabase Anda).
```

> Karena tidak ada password/token asli yang membuktikan kepemilikan akun,
> `select` dan `update` pada tabel `users` memang harus terbuka untuk semua
> (dipakai untuk mencocokkan hash saat login dan menyimpan Nama/Email opsional).
> Yang membuat username tetap privat adalah proses **hashing di sisi client**
> (`js/store.js`) — nilai yang tersimpan di kolom `username` bukan teks asli,
> jadi tidak terbaca meski tabel bisa di-select. Nama & Email TIDAK di-hash
> karena memang dimaksudkan untuk terbaca (dipakai developer untuk kebutuhan
> terkait akun, misalnya pengiriman hadiah klaim promo).

## 5. Cek key di `js/supabase-config.js`

Pastikan `SUPABASE_URL` dan `SUPABASE_PUBLISHABLE_KEY` di `js/supabase-config.js`
sesuai dengan project Supabase Anda (Dashboard > Project Settings > API).

## 6. Selesai

Tidak perlu Supabase Auth. Sistem login username-only, klaim promo, dan
catatan klik fitur semuanya ditangani penuh oleh `js/store.js`:
- `registerUsername` / `loginUsername` → hash username → cek/insert ke tabel `users` → simpan sesi di `localStorage` perangkat.
- `updateProfile` → simpan Nama Lengkap & Email opsional ke tabel `users`.
- `claimCanva` → insert ke tabel `email_canva`, ditolak otomatis kalau email sudah pernah klaim.
- `logFeatureClick` → insert ke tabel `feature_clicks`, hanya berjalan kalau ada sesi login aktif.
