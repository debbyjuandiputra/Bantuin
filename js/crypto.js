// ==========================================================
// BANTUIN — crypto.js — enkripsi sederhana untuk fitur Catatan
// ==========================================================
// PENTING — baca dulu sebelum pakai:
// Ini BUKAN end-to-end encryption tingkat produksi. Karena Bantuin
// tidak memakai password asli (lihat catatan di store.js — login
// hanya berbasis username yang di-hash), tidak ada rahasia yang
// betul-betul hanya diketahui pengguna untuk dijadikan kunci.
//
// Kunci enkripsi di sini diturunkan (PBKDF2) dari kombinasi:
//   NOTE_PEPPER (tertanam di kode aplikasi ini) + user_id (UID publik,
//   terlihat di halaman Profil)
// lalu dipakai untuk AES-GCM 256-bit.
//
// Tujuannya: supaya judul & isi catatan TIDAK tersimpan sebagai teks
// polos kalau seseorang membuka langsung tabel `catatan` di Supabase
// Dashboard. Tapi karena kunci bisa diturunkan ulang oleh siapa pun
// yang punya source code ini + tahu UID publik user, ini tetap
// tergolong "enkripsi sederhana" — bukan proteksi yang tahan terhadap
// developer/pemilik project itu sendiri.
//
// JANGAN ubah nilai NOTE_PEPPER setelah ada catatan tersimpan — semua
// catatan lama tidak akan bisa didekripsi lagi kalau pepper berubah.
// ==========================================================

const NOTE_PEPPER = 'Bantuin-Catatan-Pepper-v1';

async function deriveNoteKey(userId){
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(NOTE_PEPPER + ':' + userId),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name:'PBKDF2', salt: enc.encode('bantuin-notes-salt'), iterations: 100000, hash:'SHA-256' },
    baseKey,
    { name:'AES-GCM', length:256 },
    false,
    ['encrypt','decrypt']
  );
}

function bufToB64(buf){
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
function b64ToBuf(b64){
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

// Mengembalikan string "ivBase64:cipherBase64" untuk disimpan ke kolom text.
async function encryptNoteField(plainText, userId){
  const text = plainText || '';
  const key = await deriveNoteKey(userId);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const cipherBuf = await crypto.subtle.encrypt({ name:'AES-GCM', iv }, key, enc.encode(text));
  return bufToB64(iv) + ':' + bufToB64(cipherBuf);
}

// Menerima string "ivBase64:cipherBase64" dari kolom text, kembalikan teks asli.
async function decryptNoteField(stored, userId){
  if(!stored) return '';
  try{
    const [ivB64, dataB64] = stored.split(':');
    if(!ivB64 || !dataB64) return '';
    const key = await deriveNoteKey(userId);
    const iv = b64ToBuf(ivB64);
    const dataBuf = b64ToBuf(dataB64);
    const plainBuf = await crypto.subtle.decrypt({ name:'AES-GCM', iv }, key, dataBuf);
    return new TextDecoder().decode(plainBuf);
  }catch(e){
    return '(Gagal mendekripsi catatan ini)';
  }
}
