// ==========================================================
// BANTUIN — store.js (versi Supabase, login username-only, guest mode)
// ==========================================================
// Cara kerja:
// - Aplikasi bisa dipakai TANPA login (mode tamu) — semua fitur di
//   index.html (beranda) & halaman fitur bisa langsung diakses siapa saja.
// - Kalau user memilih login/daftar, cukup ketik USERNAME (tanpa password).
// - Username di-hash (SHA-256) sebelum dikirim/disimpan ke Supabase,
//   jadi developer yang buka tabel di dashboard Supabase tidak
//   melihat username asli, hanya hash-nya.
// - Kalau hash belum ada di tabel -> otomatis dibuatkan akun baru
//   (Daftar) + di-generate UID publik acak 7 digit.
// - Kalau hash sudah ada -> user itu "masuk" (Masuk).
// - Sesi login disimpan di localStorage perangkat (bukan di server),
//   jadi ini murni identitas ringan, BUKAN akun dengan proteksi
//   sungguhan — siapapun yang tahu/ketik username yang sama akan
//   dianggap sebagai user yang sama.
// - Tema (terang/gelap) tetap disimpan lokal di perangkat.
// - User yang sudah login boleh menambahkan Nama Lengkap & Email
//   (opsional) dan boleh klaim promo Canva Pro 1 Hari (1 email hanya
//   bisa klaim 1 kali). Setiap klik fitur oleh user yang login dicatat
//   ke tabel feature_clicks untuk kebutuhan statistik penggunaan.
// ==========================================================

const TABLE_NAME = 'users';                 // sesuaikan jika nama tabel Anda berbeda
const TABLE_CLAIM = 'email_canva';
const TABLE_CLICKS = 'feature_clicks';
const SESSION_KEY = 'bantuin_session';
const DB_THEME = 'bantuin_theme';

// ---------------- Hash username (SHA-256, sederhana & satu arah) ----------------
async function sha256Hex(text){
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function normalizeUsername(username){
  return (username || '').trim().toLowerCase();
}

// ---------------- Generate UID publik sekuensial ----------------
// UID = user_id terbesar di tabel + random(1..10)
// Jika belum ada user sama sekali, mulai dari 1000001.
async function generateNextUserId(){
  const { data, error } = await sb
    .from(TABLE_NAME)
    .select('user_id')
    .order('user_id', { ascending: false })
    .limit(1)
    .maybeSingle();

  const lastId = (data && !error) ? data.user_id : 1000000;
  const randomStep = Math.floor(Math.random() * 10) + 1; // 1 – 10
  return lastId + randomStep;
}

// ---------------- Pesan error Supabase → Bahasa Indonesia ----------------
function mapSupabaseError(err){
  if(!err) return 'Terjadi kesalahan tidak diketahui.';
  if(err.code === '23505') return 'Username sudah digunakan, coba lagi.';
  if(err.message && /Failed to fetch|NetworkError/i.test(err.message)){
    return 'Koneksi internet bermasalah. Pastikan HP terhubung ke internet.';
  }
  return 'Terjadi kesalahan (' + (err.message || err.code || 'unknown') + ').';
}

// ---------------- Sesi lokal (localStorage) ----------------
function saveSession(session){
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}
function getSession(){
  try{
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }catch(e){ return null; }
}
function clearSession(){
  localStorage.removeItem(SESSION_KEY);
}

// ---------------- Registrasi (buat username baru) ----------------
async function registerUsername({username}){
  const clean = normalizeUsername(username);
  if(!clean) return {ok:false, msg:'Username tidak boleh kosong.'};

  try{
    const hash = await sha256Hex(clean);

    const { data: existing, error: checkErr } = await sb
      .from(TABLE_NAME)
      .select('user_id')
      .eq('username', hash)
      .maybeSingle();
    if(checkErr) return {ok:false, msg: mapSupabaseError(checkErr)};
    if(existing) return {ok:false, msg:'Username sudah digunakan.'};

    // Ambil ID sekuensial (max user_id + random 1-10), retry jika bentrok
    let lastErr = null;
    for(let i = 0; i < 3; i++){
      const userId = await generateNextUserId();
      const { data: inserted, error: insertErr } = await sb
        .from(TABLE_NAME)
        .insert({ username: hash, user_id: userId, created_at: nowWIB() })
        .select('user_id, created_at, nama, email')
        .single();

      if(!insertErr){
        saveSession({
          username: clean,
          user_id: inserted.user_id,
          created_at: inserted.created_at,
          nama: inserted.nama || '',
          email: inserted.email || ''
        });
        return {ok:true};
      }
      lastErr = insertErr;
      if(insertErr.code !== '23505') break; // error selain "sudah dipakai" -> berhenti
    }
    return {ok:false, msg: mapSupabaseError(lastErr)};
  }catch(err){
    return {ok:false, msg: mapSupabaseError(err)};
  }
}

// ---------------- Login (username sudah ada) ----------------
async function loginUsername({username}){
  const clean = normalizeUsername(username);
  if(!clean) return {ok:false, msg:'Username tidak boleh kosong.'};

  try{
    const hash = await sha256Hex(clean);
    const { data, error } = await sb
      .from(TABLE_NAME)
      .select('user_id, created_at, nama, email')
      .eq('username', hash)
      .maybeSingle();

    if(error) return {ok:false, msg: mapSupabaseError(error)};
    if(!data) return {ok:false, msg:'Username tidak ditemukan. Silakan daftar dulu.'};

    saveSession({
      username: clean,
      user_id: data.user_id,
      created_at: data.created_at,
      nama: data.nama || '',
      email: data.email || ''
    });
    return {ok:true};
  }catch(err){
    return {ok:false, msg: mapSupabaseError(err)};
  }
}

function logoutUser(){
  clearSession();
}

// ---------------- Update profil (Nama Lengkap & Email, opsional) ----------------
async function updateProfile({nama, email}){
  const session = getSession();
  if(!session) return {ok:false, msg:'Anda harus masuk terlebih dahulu.'};

  try{
    const { error } = await sb
      .from(TABLE_NAME)
      .update({ nama: nama || null, email: email || null })
      .eq('user_id', session.user_id);

    if(error) return {ok:false, msg: mapSupabaseError(error)};

    session.nama = nama || '';
    session.email = email || '';
    saveSession(session);
    return {ok:true};
  }catch(err){
    return {ok:false, msg: mapSupabaseError(err)};
  }
}

// ---------------- Klaim promo Canva Pro 1 Hari ----------------
// 1 email hanya berhak klaim 1 kali (email jadi primary key di tabel email_canva).
// Hanya bisa dipakai oleh user yang sudah login.
async function claimCanva(email){
  const session = getSession();
  if(!session) return {ok:false, msg:'Anda harus masuk terlebih dahulu.'};

  const clean = (email || '').trim().toLowerCase();
  if(!clean) return {ok:false, msg:'Email tidak boleh kosong.'};

  try{
    const { error } = await sb
      .from(TABLE_CLAIM)
      .insert({ email: clean, user_id: session.user_id });

    if(error){
      if(error.code === '23505') return {ok:false, msg:'Tidak bisa klaim dengan email ini.'};
      return {ok:false, msg: mapSupabaseError(error)};
    }
    return {ok:true, msg:'Pengajuan berhasil! Tautan undangan akan dikirim melalui gmail!'};
  }catch(err){
    return {ok:false, msg: mapSupabaseError(err)};
  }
}

// ---------------- Catat klik fitur ----------------
// Hanya bekerja untuk user yang sudah login. Gagal diam-diam (silent fail)
// supaya tidak mengganggu pengalaman pengguna kalau pencatatan gagal.
const ADMIN_UIDS = [1000001, 1000002];

async function logFeatureClick(feature){
  const session = getSession();
  if(!session) return;
  if(ADMIN_UIDS.includes(session.user_id)) return; // akun admin, skip pencatatan
  try{
    await sb.from(TABLE_CLICKS).insert({ user_id: session.user_id, feature: feature, clicked_at: nowWIB() });
  }catch(err){
    // silent fail
  }
}

// ---------------- Tema (tetap lokal) ----------------
function getTheme(){
  return localStorage.getItem(DB_THEME) || 'light';
}
function setTheme(mode){
  localStorage.setItem(DB_THEME, mode);
  document.documentElement.setAttribute('data-theme', mode);
}
function applyStoredTheme(){
  document.documentElement.setAttribute('data-theme', getTheme());
}
function toggleTheme(){
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}

// ---------------- Proteksi halaman ----------------
// Dipakai HANYA di halaman yang benar-benar wajib login (mis. profil.html,
// edit-profil.html). Halaman fitur & index.html (beranda) TIDAK memakai ini lagi
// karena sekarang bisa diakses tanpa login (mode tamu) — gunakan
// getSession() langsung di sana untuk mengecek status login opsional.
// Sinkron (baca localStorage langsung) — dipanggil dengan callback
// opsional yang menerima {username, user_id, created_at, nama, email}.
function requireAuth(onReady){
  const session = getSession();
  if(!session){
    window.location.href = (location.pathname.includes('/pages/') ? '../login.html' : 'login.html');
    return;
  }
  if(onReady) onReady(session);
}

// Dipakai di login.html: jika sudah login, langsung lempar ke index.html (beranda)
function redirectIfLoggedIn(target){
  if(getSession()) window.location.href = target;
}
