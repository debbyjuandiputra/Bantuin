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
  bg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
  uuid: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12h.01M12 12h.01M16 12h.01"/></svg>`,
  auth: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`,
  notes: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>`
};

const FEATURES = [
  // ---- AKTIF ----
  { id:'konversi-dokumen', title:'Konversi File', desc:'PDF ⇄ DOCX, XLSX ⇄ CSV', cat:['dokumen'], icon:ICONS.doc, active:true, page:'pages/konversi-dokumen.html' },
  { id:'catatan', title:'Catatan', desc:'Tulis, format & ekspor catatanmu', cat:['dokumen'], icon:ICONS.notes, active:true, page:'pages/catatan.html' },
  { id:'cek-karakter', title:'Cek Panjang Karakter', desc:'Karakter, kalimat & paragraf', cat:['perhitungan','dokumen'], icon:ICONS.ruler, active:true, page:'pages/cek-karakter.html' },
  { id:'base64', title:'Base64 Encode & Decode', desc:'Konversi teks ke/dari Base64', cat:['programming'], icon:ICONS.code, active:true, page:'pages/base64.html' },
  { id:'url-encode', title:'URL Encode & Decode', desc:'Encode & decode karakter URL', cat:['programming'], icon:ICONS.link, active:true, page:'pages/url-encode.html' },
  { id:'kalkulator-statistik', title:'Statistik', desc:'Mean, median, modus & lebih', cat:['perhitungan'], icon:ICONS.stats, active:true, page:'pages/statistik.html' },
  { id:'uuid-generator', title:'UUID Generator', desc:'Buat ID unik instan', cat:['programming'], icon:ICONS.uuid, active:true, page:'pages/uuid-generator.html' },
  { id:'authenticator', title:'Generate Kode Authenticator', desc:'Kode OTP 2FA', cat:['programming'], icon:ICONS.auth, active:true, page:'pages/authenticator.html' },
  { id:'aplikasi-premium', title:'Aplikasi Premium', desc:'CapCut Pro, Canva Pro & Zoom Pro', cat:['lainnya'], icon:ICONS.premium, active:true, page:'pages/aplikasi-premium.html' },
  // ---- SEGERA HADIR ----
  { id:'scan-dokumen', title:'Scan Dokumen', desc:'Segera hadir', cat:['dokumen'], icon:ICONS.scan, active:false },
  { id:'todolist', title:'To Do List Modern', desc:'Segera hadir', cat:['penjadwalan'], icon:ICONS.todo, active:false },
  { id:'alarm', title:'Alarm dan Pengingat', desc:'Segera hadir', cat:['penjadwalan'], icon:ICONS.alarm, active:false },
  { id:'kalkulator-ilmiah', title:'Kalkulator Ilmiah', desc:'Segera hadir', cat:['perhitungan'], icon:ICONS.calc, active:false },
  { id:'kalkulator-modern', title:'Kalkulator Modern', desc:'Segera hadir', cat:['perhitungan'], icon:ICONS.calc, active:false },
  { id:'hapus-latar', title:'Hapus Latar Belakang', desc:'Segera hadir', cat:['lainnya'], icon:ICONS.bg, active:false },
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
// lalu buka halaman fiturnya. Tamu tetap bisa langsung membuka fitur.
function openFeature(featureId, page){
  logFeatureClick(featureId);
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
const WHATSNEW_KEY = 'bantuin_whatsnew_seen_v3';

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
