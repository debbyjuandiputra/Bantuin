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
