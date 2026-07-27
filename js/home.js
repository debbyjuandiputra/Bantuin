// ==========================================================
// BANTUIN — home.js
// ==========================================================
applyStoredTheme();

// Home.html bisa diakses tanpa login (mode tamu). Sesi hanya dibaca,
// tidak ada redirect paksa seperti requireAuth().
const currentSession = getSession();

if(currentSession){
  document.getElementById('profileStatusLabel').textContent = 'Masuk sebagai';
  document.getElementById('profileNameTag').textContent = currentSession.username;
  document.getElementById('profileMenuLoggedIn').classList.remove('hidden');
  document.getElementById('profileMenuGuest').classList.add('hidden');
} else {
  document.getElementById('profileStatusLabel').textContent = 'Status';
  document.getElementById('profileNameTag').textContent = 'Tamu';
  document.getElementById('profileMenuLoggedIn').classList.add('hidden');
  document.getElementById('profileMenuGuest').classList.remove('hidden');
}

function goLoginPage(){ window.location.href = 'login.html'; }

// ---------------- Data fitur ----------------
const ICONS = {
  doc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  premium: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15 8.5 22 9.5 17 14.5 18.5 21.5 12 18 5.5 21.5 7 14.5 2 9.5 9 8.5 12 2"/></svg>`,
  ruler: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="8" rx="1"/><path d="M7 8v4M11 8v4M15 8v4"/></svg>`,
  scan: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="3" y1="12" x2="21" y2="12"/></svg>`,
  code: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
  link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  todo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="6" height="6" rx="1"/><path d="M13 6h8M13 18h8"/><rect x="3" y="13" width="6" height="6" rx="1"/></svg>`,
  alarm: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M5 3 2 6M22 6l-3-3"/></svg>`,
  calc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8" y2="10"/><line x1="12" y1="10" x2="12" y2="10"/><line x1="16" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="8" y2="14"/><line x1="12" y1="14" x2="12" y2="14"/><line x1="16" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="8" y2="18"/><line x1="12" y1="18" x2="12" y2="18"/><line x1="16" y1="18" x2="16" y2="18"/></svg>`,
  stats: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="20" x2="4" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="20" y1="20" x2="20" y2="14"/></svg>`,
  bg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
  uuid: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12h.01M12 12h.01M16 12h.01"/></svg>`,
  auth: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`,
  notes: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>`,
  palette: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="8" cy="10" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="7" r="1.5" fill="currentColor" stroke="none"/><circle cx="16" cy="10" r="1.5" fill="currentColor" stroke="none"/><path d="M12 22c-2 0-4-2-4-4 0-1 1-2 4-2 3 0 4 1 4 2 0 2-2 4-4 4z"/></svg>`,
  globe:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  binary:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="8" height="5" rx="1"/><rect x="2" y="13" width="8" height="5" rx="1"/><path d="M14 6h5a2 2 0 0 1 0 4h-5v-4zM14 13h6a2 2 0 0 1 0 5h-6v-5z"/></svg>`,
  qr: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><line x1="14" y1="14" x2="14" y2="14.01"/><line x1="18" y1="14" x2="18" y2="14.01"/><line x1="14" y1="18" x2="14" y2="18.01"/><line x1="18" y1="18" x2="18" y2="18.01"/><line x1="21" y1="14" x2="21" y2="21"/><line x1="14" y1="21" x2="21" y2="21"/></svg>`
};

const FEATURES = [
  // ---- AKTIF ----
  { id:'konversi-dokumen', title:'Konversi File', desc:'PDF ⇄ DOCX, XLSX ⇄ CSV', cat:['dokumen'], icon:ICONS.doc, active:true, page:'pages/konversi-dokumen.html' },
  { id:'catatan', title:'Catatan', desc:'Tulis, format & ekspor catatanmu', cat:['dokumen'], icon:ICONS.notes, active:true, page:'pages/catatan.html' },
  { id:'cek-karakter', title:'Cek Panjang Karakter', desc:'Karakter, kalimat & paragraf', cat:['perhitungan','dokumen'], icon:ICONS.ruler, active:true, page:'pages/cek-karakter.html' },
  { id:'kalkulator-statistik', title:'Statistik', desc:'Mean, median, modus & lebih', cat:['perhitungan'], icon:ICONS.stats, active:true, page:'pages/statistik.html' },
  { id:'cek-palet-warna', title:'Cek Palet Warna', desc:'Ekstrak 10 warna dominan dari gambar', cat:['perhitungan'], icon:ICONS.palette, active:true, page:'pages/cek-palet-warna.html' },
  { id:'pencarian-ip', title:'Pencarian IP', desc:'Lokasi & info detail suatu IP/domain', cat:['lainnya'], icon:ICONS.globe, active:true, page:'pages/pencarian-ip.html' },
  { id:'konversi-biner', title:'Konversi Biner', desc:'Text ⇄ Biner, Desimal, HEX & Oktal', cat:['perhitungan','programming'], icon:ICONS.binary, active:true, page:'pages/konversi-biner.html' },
  { id:'aplikasi-premium', title:'Aplikasi Premium', desc:'CapCut Pro, Canva Pro & Zoom Pro', cat:['lainnya'], icon:ICONS.premium, active:true, page:'pages/aplikasi-premium.html' },
  { id:'kode-qr', title:'Kode QR', desc:'Buat & scan kode QR (kamera/unggah)', cat:['lainnya'], icon:ICONS.qr, active:true, page:'pages/kode-qr.html' },
  { id:'base64', title:'Base64 Encode & Decode', desc:'Konversi teks ke/dari Base64', cat:['programming'], icon:ICONS.code, active:true, page:'pages/base64.html' },
  { id:'url-encode', title:'URL Encode & Decode', desc:'Encode & decode karakter URL', cat:['programming'], icon:ICONS.link, active:true, page:'pages/url-encode.html' },
  { id:'uuid-generator', title:'UUID Generator', desc:'Buat ID unik instan', cat:['programming'], icon:ICONS.uuid, active:true, page:'pages/uuid-generator.html' },
  { id:'authenticator', title:'Generate Kode Authenticator', desc:'Kode OTP 2FA', cat:['programming'], icon:ICONS.auth, active:true, page:'pages/authenticator.html' },
  // ---- SEGERA HADIR ----
  { id:'scan-dokumen', title:'Scan Dokumen', desc:'Segera hadir', cat:['dokumen'], icon:ICONS.scan, active:false },
  { id:'todolist', title:'To Do List Modern', desc:'Segera hadir', cat:['penjadwalan'], icon:ICONS.todo, active:false },
  { id:'alarm', title:'Alarm dan Pengingat', desc:'Segera hadir', cat:['penjadwalan'], icon:ICONS.alarm, active:false },
  { id:'kalkulator-ilmiah', title:'Kalkulator Ilmiah', desc:'Segera hadir', cat:['perhitungan'], icon:ICONS.calc, active:false },
  { id:'kalkulator-modern', title:'Kalkulator Modern', desc:'Segera hadir', cat:['perhitungan'], icon:ICONS.calc, active:false },
  { id:'hapus-latar', title:'Hapus Latar Belakang', desc:'Hapus background foto otomatis pakai AI', cat:['lainnya'], icon:ICONS.bg, active:true, page:'pages/hapus-latar-belakang.html' },
];

let currentCat = 'semua';

function renderFeatures(){
  const grid = document.getElementById('featureGrid');
  const list = currentCat === 'semua' ? FEATURES : FEATURES.filter(f => f.cat.includes(currentCat));
  if(list.length === 0){
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">Belum ada fitur di kategori ini.</div>`;
    return;
  }
  grid.innerHTML = list.map(f => `
    <div class="feature-card ${f.active ? '' : 'disabled'}" ${f.active ? `onclick="openFeature('${f.id}','${f.page}')"` : ''}>
      ${f.active ? '' : '<span class="badge-soon">Segera</span>'}
      <div class="ic">${f.icon}</div>
      <b>${f.title}</b>
      <small>${f.desc}</small>
    </div>
  `).join('');
}

// Dipanggil saat kartu fitur diklik: catat klik (kalau sudah login),
// cek apakah saatnya menampilkan pop-up rating (kelipatan 7 klik & belum
// pernah rating), lalu buka halaman fiturnya. Tamu tetap bisa langsung
// membuka fitur (tidak pernah kena pop-up rating).
async function openFeature(featureId, page){
  const session = getSession();
  await logFeatureClick(featureId);

  if(session){
    try{
      const count = await getFeatureClickCount(session.user_id);
      if(count > 0 && count % 7 === 0){
        const already = await hasRated(session.user_id);
        if(!already){
          showRatingPopup(() => { location.href = page; });
          return; // navigasi ditunda sampai pop-up ditutup
        }
      }
    }catch(err){
      // gagal cek -> lanjut navigasi seperti biasa, jangan blokir pengguna
    }
  }

  location.href = page;
}

function setCategory(cat, el){
  currentCat = cat;
  document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderFeatures();
}

renderFeatures();

// ---------------- Hamburger / Side menu ----------------
const overlay = document.getElementById('overlay');
const sideMenu = document.getElementById('sideMenu');
const profileDrop = document.getElementById('profileDrop');

function openMenu(){ sideMenu.classList.add('show'); overlay.classList.add('show'); }
function closeMenu(){ sideMenu.classList.remove('show'); overlay.classList.remove('show'); }
function closeAllOverlays(){ closeMenu(); profileDrop.classList.remove('show'); overlay.classList.remove('show'); }

document.getElementById('hamburgerBtn').addEventListener('click', openMenu);
overlay.addEventListener('click', closeAllOverlays);

document.getElementById('profileBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  profileDrop.classList.toggle('show');
});
document.addEventListener('click', (e) => {
  if(!profileDrop.contains(e.target) && e.target.id !== 'profileBtn'){
    profileDrop.classList.remove('show');
  }
});

// ---------------- Theme switch ----------------
function refreshThemeIcon(){
  const isDark = getTheme() === 'dark';
  document.getElementById('themeKnobIcon').innerHTML = isDark
    ? `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
}
document.getElementById('themeSwitch').addEventListener('click', () => {
  toggleTheme();
  refreshThemeIcon();
});
refreshThemeIcon();

// ---------------- Profil aksi ----------------
function goProfile(){ window.location.href = 'profil.html'; }
function doLogout(){
  logoutUser();
  window.location.href = 'index.html';
}

// ---------------- Modal Unduhan ----------------
function openUnduhan(){
  document.getElementById('unduhanModal').classList.add('show');
  closeAllOverlays();
  renderUnduhanList();
}
function closeUnduhanModal(){ document.getElementById('unduhanModal').classList.remove('show'); }

async function renderUnduhanList(){
  const wrap = document.getElementById('unduhanList');
  wrap.innerHTML = `<div class="empty-state">Memuat...</div>`;
  const items = await getDownloadRecords();
  if(!items.length){
    wrap.innerHTML = `<div class="empty-state">Belum ada file yang diunduh.</div>`;
    return;
  }
  wrap.innerHTML = items.map(it => `
    <div class="download-item">
      <div class="dl-info">
        <b>${escapeHtml(it.filename)}</b>
        <span>${formatFileSize(it.size)} &bull; ${formatExpiryLabel(it.created_at)}</span>
      </div>
      <div class="dl-actions">
        <button class="icon-btn" onclick="shareDownloadedFile(${it.id})" aria-label="Bagikan">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="10.5" x2="15.4" y2="6.5"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/></svg>
        </button>
        <button class="icon-btn" onclick="redownloadFile(${it.id})" aria-label="Unduh ulang">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>
        <button class="icon-btn" onclick="removeUnduhanItem(${it.id})" aria-label="Hapus" style="color:var(--danger)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
        </button>
      </div>
    </div>
  `).join('');
}

// Bagikan file lewat dialog Share bawaan OS (Android/iOS) — ini biasanya JAUH
// lebih andal dipakai di dalam aplikasi WebView (Median.co dkk) dibanding
// trigger <a download> pada blob URL, karena beberapa versi WebView Android
// tidak selalu meneruskan unduhan blob: ke Download Manager sistem. Lewat
// Share, pengguna bisa pilih "Simpan ke File/Downloads", kirim ke WhatsApp,
// simpan ke Galeri (untuk gambar), dll — jalur yang jauh lebih konsisten.
async function shareDownloadedFile(id){
  const items = await getDownloadRecords();
  const item = items.find(i => i.id === id);
  if(!item) return;

  try{
    const file = new File([item.blob], item.filename, { type: item.blob.type || 'application/octet-stream' });
    if(navigator.canShare && navigator.canShare({ files:[file] })){
      await navigator.share({ files:[file], title: item.filename });
    } else if(navigator.share){
      await navigator.share({ title: item.filename, text: `File: ${item.filename}` });
      showToast('Perangkat ini tidak mendukung berbagi file langsung.');
    } else {
      showToast('Fitur bagikan tidak didukung di perangkat/aplikasi ini.');
    }
  }catch(e){
    if(e.name !== 'AbortError') showToast('Gagal membagikan file.');
  }
}

async function redownloadFile(id){
  const items = await getDownloadRecords();
  const item = items.find(i => i.id === id);
  if(!item) return;
  const url = URL.createObjectURL(item.blob);
  const a = document.createElement('a');
  a.href = url; a.download = item.filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  setTimeout(()=> URL.revokeObjectURL(url), 3000);
  showToast('Mengunduh ulang...');
}

async function removeUnduhanItem(id){
  await deleteDownloadRecord(id);
  renderUnduhanList();
}

// ---------------- Modal Kebijakan ----------------
function openPolicy(){
  document.getElementById('legalTextHolder').textContent = LEGAL_TEXT;
  document.getElementById('policyModal').classList.add('show');
  closeAllOverlays();
}
function closePolicyModal(){ document.getElementById('policyModal').classList.remove('show'); }

// ---------------- Modal Donasi ----------------
function openDonasi(){
  document.getElementById('donasiModal').classList.add('show');
  closeAllOverlays();
}
function closeDonasiModal(){ document.getElementById('donasiModal').classList.remove('show'); }

function copyRek(rek){ copyText(rek); }

// ---------------- Modal Kontak ----------------
function openKontak(){
  document.getElementById('kontakModal').classList.add('show');
  closeAllOverlays();
}
function closeKontakModal(){ document.getElementById('kontakModal').classList.remove('show'); }

// ---------------- Modal Promo Login (tamu) ----------------
function closeLoginPromoModal(){ document.getElementById('loginPromoModal').classList.remove('show'); }

// ---------------- Modal Apa yang Baru (tampil sekali per perangkat) ----------------
const WHATSNEW_KEY = 'bantuin_whatsnew_seen_v5';

function closeWhatsNewModal(){
  document.getElementById('whatsNewModal').classList.remove('show');
  localStorage.setItem(WHATSNEW_KEY, '1');
  scheduleGuestPromo();
}

function scheduleGuestPromo(){
  // Untuk tamu, ajak login supaya bisa klaim Canva Pro 1 Hari.
  // Ditunda supaya tidak tabrakan/tumpuk dengan modal What's New.
  if(!currentSession){
    setTimeout(function(){
      document.getElementById('loginPromoModal').classList.add('show');
    }, 1200);
  }
}

if(!localStorage.getItem(WHATSNEW_KEY)){
  setTimeout(function(){
    document.getElementById('whatsNewModal').classList.add('show');
  }, 700);
} else {
  scheduleGuestPromo();
}

// ---------------- Modal Klaim Canva Pro (setelah login) ----------------
function closeClaimCanvaModal(){ document.getElementById('claimCanvaModal').classList.remove('show'); }

async function handleClaimCanva(e){
  e.preventDefault();
  const email = document.getElementById('claimCanvaEmail').value.trim();
  const msg = document.getElementById('claimCanvaMsg');
  const btn = document.getElementById('claimCanvaBtn');
  msg.textContent = '';
  btn.disabled = true; btn.textContent = 'Memproses...';

  const res = await claimCanva(email);

  btn.disabled = false; btn.textContent = 'Ajukan Klaim';

  if(res.ok){
    msg.style.color = 'var(--success)';
    msg.textContent = res.msg;
    setTimeout(closeClaimCanvaModal, 4000);
  } else {
    msg.style.color = 'var(--danger)';
    msg.textContent = res.msg;
  }
  return false;
}

// Jika baru saja berhasil login/daftar, tampilkan pop-up klaim Canva Pro.
if(currentSession && sessionStorage.getItem('bantuin_show_claim')){
  sessionStorage.removeItem('bantuin_show_claim');
  setTimeout(function(){
    document.getElementById('claimCanvaModal').classList.add('show');
  }, 600);
}

// ==========================================================
// Pop-up Rating — muncul untuk user login yang total klik fiturnya
// (feature_clicks) kelipatan 7 dan belum pernah kasih rating.
// Dipicu dari openFeature() di atas, sebelum berpindah halaman.
// ==========================================================
let selectedRating = 0;
let pendingNavigateAfterRating = null;

function showRatingPopup(onDone){
  pendingNavigateAfterRating = onDone || null;
  selectedRating = 0;
  renderStars();
  document.getElementById('ratingMsg').textContent = '';
  document.getElementById('ratingPesan').value = '';
  document.getElementById('ratingModal').classList.add('show');
}

function closeRatingPopupAndContinue(){
  document.getElementById('ratingModal').classList.remove('show');
  const cont = pendingNavigateAfterRating;
  pendingNavigateAfterRating = null;
  if(cont) cont();
}

function selectStar(n){
  selectedRating = n;
  renderStars();
}

function renderStars(){
  const wrap = document.getElementById('ratingStars');
  if(!wrap) return;
  wrap.innerHTML = [1,2,3,4,5].map(n => `
    <button type="button" class="star-btn ${n <= selectedRating ? 'filled' : ''}" onclick="selectStar(${n})" aria-label="${n} bintang">
      <svg viewBox="0 0 24 24" fill="${n <= selectedRating ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15 8.5 22 9.5 17 14.5 18.5 21.5 12 18 5.5 21.5 7 14.5 2 9.5 9 8.5 12 2"/></svg>
    </button>
  `).join('');
}

async function submitRatingPopup(){
  const msg = document.getElementById('ratingMsg');
  const btn = document.getElementById('ratingSubmitBtn');
  const pesan = document.getElementById('ratingPesan').value;

  if(selectedRating < 1){
    msg.style.color = 'var(--danger)';
    msg.textContent = 'Pilih rating bintang terlebih dahulu.';
    return;
  }

  msg.textContent = '';
  btn.disabled = true; btn.textContent = 'Mengirim...';

  const res = await submitRating(selectedRating, pesan);

  btn.disabled = false; btn.textContent = 'Kirim Rating';

  if(res.ok){
    msg.style.color = 'var(--success)';
    msg.textContent = 'Terima kasih atas ratingnya!';
    setTimeout(closeRatingPopupAndContinue, 1200);
  } else {
    msg.style.color = 'var(--danger)';
    msg.textContent = res.msg;
  }
}

function skipRatingPopup(){
  closeRatingPopupAndContinue();
}