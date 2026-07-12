// ==========================================================
// BANTUIN — store.js (versi Firebase)
// Akun & profil disimpan di Firebase Authentication + Firestore.
// Tema (terang/gelap) tetap disimpan lokal di perangkat.
// ==========================================================

const DB_THEME = 'bantuin_theme';

let cachedUserData = null; // {uid, username, email, profile:{...}}

// ---------------- Pesan error Firebase → Bahasa Indonesia ----------------
function mapFirebaseError(err){
  switch(err.code){
    case 'auth/wrong-password': return 'Password salah.';
    case 'auth/user-not-found': return 'Akun tidak ditemukan.';
    case 'auth/invalid-credential': return 'Username atau password salah.';
    case 'auth/email-already-in-use': return 'Email sudah terdaftar.';
    case 'auth/weak-password': return 'Password terlalu lemah (minimal 6 karakter).';
    case 'auth/invalid-email': return 'Format email tidak valid.';
    case 'auth/network-request-failed': return 'Koneksi internet bermasalah.';
    case 'auth/too-many-requests': return 'Terlalu banyak percobaan. Coba lagi nanti.';
    default: return 'Terjadi kesalahan (' + (err.code || err.message) + ').';
  }
}

// ---------------- Registrasi ----------------
async function registerUser({username, password, email}){
  const key = username.toLowerCase();
  try{
    const unameDoc = await db.collection('usernames').doc(key).get();
    if(unameDoc.exists) return {ok:false, msg:'Username sudah digunakan.'};

    const cred = await auth.createUserWithEmailAndPassword(email, password);
    const uid = cred.user.uid;

    await db.collection('usernames').doc(key).set({ uid, email });
    await db.collection('users').doc(uid).set({
      username, email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      profile: {
        namaLengkap:'', namaPanggilan:'', asalInstansi:'',
        status:'', tglLahir:'', nisNim:'', bidang:''
      }
    });
    return {ok:true};
  }catch(err){
    return {ok:false, msg: mapFirebaseError(err)};
  }
}

// ---------------- Login ----------------
async function loginUser({username, password}){
  const key = username.toLowerCase();
  try{
    const unameDoc = await db.collection('usernames').doc(key).get();
    if(!unameDoc.exists) return {ok:false, msg:'Akun tidak ditemukan.'};
    const email = unameDoc.data().email;
    await auth.signInWithEmailAndPassword(email, password);
    return {ok:true};
  }catch(err){
    return {ok:false, msg: mapFirebaseError(err)};
  }
}

// ---------------- Data user aktif ----------------
async function fetchCurrentUserData(){
  const fbUser = auth.currentUser;
  if(!fbUser) { cachedUserData = null; return null; }
  const doc = await db.collection('users').doc(fbUser.uid).get();
  if(!doc.exists){ cachedUserData = null; return null; }
  cachedUserData = { uid: fbUser.uid, ...doc.data() };
  return cachedUserData;
}

function currentUserCached(){
  return cachedUserData;
}

async function updateProfile(newProfile){
  const fbUser = auth.currentUser;
  if(!fbUser) return false;
  const merged = {...(cachedUserData?.profile || {}), ...newProfile};
  await db.collection('users').doc(fbUser.uid).update({ profile: merged });
  if(cachedUserData) cachedUserData.profile = merged;
  return true;
}

function logoutUser(){
  return auth.signOut();
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
// Memakai Firebase onAuthStateChanged (async). Panggil dengan callback
// opsional yang menerima data user (username, email, profile, dst)
// setelah dipastikan login dan data berhasil diambil dari Firestore.
function requireAuth(onReady){
  auth.onAuthStateChanged(async (fbUser) => {
    if(!fbUser){
      window.location.href = (location.pathname.includes('/pages/') ? '../index.html' : 'index.html');
      return;
    }
    await fetchCurrentUserData();
    if(!cachedUserData){
      // Akun auth ada tapi dokumen Firestore tidak ditemukan — keluarkan paksa.
      await logoutUser();
      window.location.href = (location.pathname.includes('/pages/') ? '../index.html' : 'index.html');
      return;
    }
    if(onReady) onReady(cachedUserData);
  });
}

// Dipakai di index.html: jika sudah login, langsung lempar ke home.html
function redirectIfLoggedIn(target){
  auth.onAuthStateChanged((fbUser) => {
    if(fbUser) window.location.href = target;
  });
}
