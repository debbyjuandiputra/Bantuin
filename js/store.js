// ==========================================================
// BANTUIN — store.js (versi Supabase, login username-only)
// ==========================================================
// Cara kerja:
// - User hanya mengetik USERNAME (tanpa password).
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
// ==========================================================

const TABLE_NAME = 'users';       // sesuaikan jika nama tabel Anda berbeda
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

// ---------------- Generate UID publik 7 digit ----------------
function generateUserId7(){
  return Math.floor(1000000 + Math.random() * 9000000); // 1000000 - 9999999
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
      .select('id')
      .eq('username', hash)
      .maybeSingle();
    if(checkErr) return {ok:false, msg: mapSupabaseError(checkErr)};
    if(existing) return {ok:false, msg:'Username sudah digunakan.'};

    // Coba insert dengan UID publik acak, retry jika bentrok (unique constraint)
    let lastErr = null;
    for(let i = 0; i < 5; i++){
      const userId = generateUserId7();
      const { data: inserted, error: insertErr } = await sb
        .from(TABLE_NAME)
        .insert({ username: hash, user_id: userId })
        .select('user_id, created_at')
        .single();

      if(!insertErr){
        saveSession({
          username: clean,
          user_id: inserted.user_id,
          created_at: inserted.created_at
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
      .select('user_id, created_at')
      .eq('username', hash)
      .maybeSingle();

    if(error) return {ok:false, msg: mapSupabaseError(error)};
    if(!data) return {ok:false, msg:'Username tidak ditemukan. Silakan daftar dulu.'};

    saveSession({
      username: clean,
      user_id: data.user_id,
      created_at: data.created_at
    });
    return {ok:true};
  }catch(err){
    return {ok:false, msg: mapSupabaseError(err)};
  }
}

function logoutUser(){
  clearSession();
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
// Sinkron (baca localStorage langsung) — dipanggil dengan callback
// opsional yang menerima {username, user_id, created_at}.
function requireAuth(onReady){
  const session = getSession();
  if(!session){
    window.location.href = (location.pathname.includes('/pages/') ? '../index.html' : 'index.html');
    return;
  }
  if(onReady) onReady(session);
}

// Dipakai di index.html: jika sudah login, langsung lempar ke home.html
function redirectIfLoggedIn(target){
  if(getSession()) window.location.href = target;
}
