// ==========================================================
// BANTUIN — util.js — helper kecil yang dipakai di banyak halaman
// ==========================================================

function ensureToastEl(){
  let el = document.getElementById('bantuinToast');
  if(!el){
    el = document.createElement('div');
    el.id = 'bantuinToast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  return el;
}

function showToast(msg){
  const el = ensureToastEl();
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=> el.classList.remove('show'), 2000);
}

function copyText(text){
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(()=> showToast('Berhasil disalin')).catch(()=> fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text){
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position='fixed'; ta.style.opacity='0';
  document.body.appendChild(ta);
  ta.select();
  try{ document.execCommand('copy'); showToast('Berhasil disalin'); }
  catch(e){ showToast('Gagal menyalin'); }
  document.body.removeChild(ta);
}

function downloadBlob(blob, filename){
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  setTimeout(()=> URL.revokeObjectURL(url), 3000);
}

// ---------------- Waktu WIB (+7) ----------------
// Dipakai saat INSERT ke kolom timestamp tertentu (created_at di tabel
// users, clicked_at di tabel feature_clicks, created_at/updated_at di
// tabel catatan) supaya nilai yang tersimpan langsung menunjukkan jam
// WIB apa adanya ketika dilihat mentah di Supabase Dashboard (yang
// defaultnya menampilkan timestamptz dalam UTC, sering bikin bingung
// karena kelihatan "mundur 7 jam"). Konsekuensinya: nilai yang
// tersimpan BUKAN UTC yang sesungguhnya, jadi kalau ditampilkan lagi
// di aplikasi, WAJIB pakai formatStoredWIB() di bawah — JANGAN pakai
// toLocaleString()/toLocaleDateString() browser biasa, karena itu akan
// menggeser +7 sekali lagi (jadi salah 14 jam).
function nowWIB(){
  return new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString();
}

const BULAN_ID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

// Format tanggal/jam dari kolom yang sudah ditulis pakai nowWIB() di atas.
// Mengambil angka Tahun-Bulan-Tanggal-Jam-Menit APA ADANYA dari string ISO
// (tanpa reinterpretasi zona waktu oleh objek Date), supaya tidak ke-geser
// lagi oleh zona waktu browser.
function formatStoredWIB(iso, withTime){
  if(!iso) return '-';
  const m = String(iso).match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if(!m) return iso;
  const [, y, mo, d, h, mi] = m;
  const tanggal = `${parseInt(d,10)} ${BULAN_ID[parseInt(mo,10)-1]} ${y}`;
  return withTime ? `${tanggal}, ${h}.${mi} WIB` : tanggal;
}

// ---------------- Escape helper (dipakai di beberapa halaman) ----------------
function escapeHtml(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function escapeRegex(s){
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ---------------- Konversi HTML hasil editor Catatan ----------------
function htmlToPlainText(html){
  const div = document.createElement('div');
  div.innerHTML = html || '';
  div.querySelectorAll('br').forEach(el => el.replaceWith('\n'));
  div.querySelectorAll('p, div, li').forEach(el => el.appendChild(document.createTextNode('\n')));
  return div.textContent.replace(/\n{3,}/g, '\n\n').trim();
}

function htmlToMarkdown(html){
  const div = document.createElement('div');
  div.innerHTML = html || '';

  function walk(node){
    let out = '';
    node.childNodes.forEach(child => {
      if(child.nodeType === Node.TEXT_NODE){ out += child.textContent; return; }
      if(child.nodeType !== Node.ELEMENT_NODE) return;
      const tag = child.tagName.toLowerCase();
      const inner = walk(child);
      if(tag === 'b' || tag === 'strong') out += `**${inner}**`;
      else if(tag === 'i' || tag === 'em') out += `*${inner}*`;
      else if(tag === 'u') out += `<u>${inner}</u>`;
      else if(tag === 'br') out += '\n';
      else if(tag === 'li') out += `- ${inner}\n`;
      else if(tag === 'p' || tag === 'div') out += inner + '\n\n';
      else out += inner;
    });
    return out;
  }

  return walk(div).replace(/\n{3,}/g, '\n\n').trim();
}

function sanitizeFilename(name){
  const clean = (name || 'catatan').replace(/[\\/:*?"<>|]/g, '-').trim().slice(0, 60);
  return clean || 'catatan';
}
