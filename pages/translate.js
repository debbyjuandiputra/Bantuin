// ==========================================================
// BANTUIN — translate.js
// Fitur Terjemahan — 100% GRATIS, tanpa API key.
//
// Sumber terjemahan (2 lapis, supaya jarang gagal):
//   1) Supabase Edge Function "translate-proxy" (proxy ke mesin
//      Google Translate publik + kamus & alternatif terjemahan)
//   2) Fallback: MyMemory Translation API (gratis, CORS terbuka),
//      dipakai kalau lapis 1 gagal/timeout — hasil lebih sederhana
//      (tanpa kamus/alternatif) tapi tetap akurat untuk teks umum.
// ==========================================================

const TR_PROXY_URL = 'https://kubydmxgxmvyksyywypi.supabase.co/functions/v1/translate-proxy';
const TR_MYMEMORY_BASE = 'https://api.mymemory.translated.net/get';

const HIST_KEY = 'bantuin_translate_history';
const LANG_PREF_KEY = 'bantuin_translate_langs';
const HIST_MAX = 15;

let currentSource = 'auto';
let currentTarget = 'id';
let debounceTimer = null;
let activeRequestId = 0;
let lastResult = null; // { translatedText, detectedSourceLanguage, alternatives, dictionary }
let langModalMode = 'source';
let recognizer = null;
let isListening = false;

// ---------------- Init ----------------
(function init(){
  try{
    const saved = JSON.parse(localStorage.getItem(LANG_PREF_KEY) || 'null');
    if(saved && saved.source) currentSource = saved.source;
    if(saved && saved.target) currentTarget = saved.target;
  }catch(_){}
  updateLangButtons();
  renderHistory();
  document.getElementById('srcText').focus({ preventScroll:true });
})();

function saveLangPref(){
  localStorage.setItem(LANG_PREF_KEY, JSON.stringify({ source: currentSource, target: currentTarget }));
}

function updateLangButtons(){
  document.getElementById('srcLangLabel').textContent = trLangName(currentSource);
  document.getElementById('tgtLangLabel').textContent = trLangName(currentTarget);
}

// ---------------- Input teks ----------------
function onSrcInput(){
  const text = document.getElementById('srcText').value;
  document.getElementById('charCount').textContent = text.length;
  clearTimeout(debounceTimer);

  if(!text.trim()){
    showEmptyResult();
    return;
  }
  debounceTimer = setTimeout(() => runTranslate(text), 550);
}

function clearSrcText(){
  document.getElementById('srcText').value = '';
  document.getElementById('charCount').textContent = '0';
  document.getElementById('srcText').focus();
  showEmptyResult();
}

async function pasteFromClipboard(){
  try{
    const text = await navigator.clipboard.readText();
    if(!text) return;
    const ta = document.getElementById('srcText');
    ta.value = text.slice(0, 5000);
    document.getElementById('charCount').textContent = ta.value.length;
    runTranslate(ta.value);
  }catch(_){
    showToast('Tidak bisa mengakses clipboard. Tempel manual ya.');
  }
}

function showEmptyResult(){
  const el = document.getElementById('resultText');
  el.className = 'tr-result-text placeholder';
  el.textContent = 'Terjemahan akan muncul di sini';
  document.getElementById('detectedChip').style.display = 'none';
  document.getElementById('altWrap').style.display = 'none';
  document.getElementById('altWrap').innerHTML = '';
  document.getElementById('dictCard').style.display = 'none';
  lastResult = null;
}

function showLoading(){
  document.getElementById('resultText').outerHTML = `<div class="tr-loading-dots" id="resultText-loading"><span></span><span></span><span></span></div>`;
}

function restoreResultTextEl(){
  // Setelah loading dots dihapus/diganti, pastikan elemen #resultText selalu ada lagi
  if(!document.getElementById('resultText')){
    const wrap = document.getElementById('resultArea');
    wrap.innerHTML = `<div class="tr-result-text" id="resultText"></div>`;
  }
}

// ---------------- Terjemahkan ----------------
async function runTranslate(text){
  const myId = ++activeRequestId;
  showLoading();

  let result = null;
  let errMsg = null;

  // Lapis 1: Edge Function proxy (Google Translate + kamus)
  try{
    result = await fetchViaProxy(text, currentSource, currentTarget);
  }catch(err){
    errMsg = err.message;
  }

  // Lapis 2: fallback MyMemory
  if(!result){
    try{
      result = await fetchViaMyMemory(text, currentSource, currentTarget);
    }catch(err){
      errMsg = err.message;
    }
  }

  if(myId !== activeRequestId) return; // ada request baru yang menyusul, buang hasil ini

  restoreResultTextEl();

  if(!result){
    const el = document.getElementById('resultText');
    el.className = 'tr-result-text placeholder';
    el.textContent = errMsg || 'Tidak bisa menerjemahkan. Periksa koneksi internet kamu.';
    return;
  }

  lastResult = result;
  renderResult(result);
  saveHistoryEntry(text, result);
}

function fetchWithTimeout(url, opts, ms){
  opts = opts || {}; ms = ms || 9000;
  const ctrl = new AbortController();
  const t = setTimeout(function(){ ctrl.abort(); }, ms);
  return fetch(url, Object.assign({}, opts, { signal: ctrl.signal })).finally(function(){ clearTimeout(t); });
}

async function fetchViaProxy(text, source, target){
  const res = await fetchWithTimeout(TR_PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, source, target })
  }, 9000);

  if(!res.ok) throw new Error('proxy gagal');
  const data = await res.json();
  if(data.error || !data.translatedText) throw new Error('proxy gagal');

  return {
    translatedText: data.translatedText,
    detectedSourceLanguage: data.detectedSourceLanguage || (source === 'auto' ? null : source),
    alternatives: Array.isArray(data.alternatives) ? data.alternatives : [],
    dictionary: Array.isArray(data.dictionary) ? data.dictionary : []
  };
}

async function fetchViaMyMemory(text, source, target){
  // MyMemory butuh kode langpair "sl|tl". Kalau source auto, minta deteksi
  // sederhana dulu lewat parameter "autodetect" (MyMemory tidak resmi
  // mendukungnya secara eksplisit) — gunakan 'auto' yang umum diterima
  // beberapa mirror; kalau gagal, fallback ke bahasa Inggris sebagai sumber.
  const srcCode = (source === 'auto') ? 'autodetect' : source;
  const langpair = `${srcCode}|${target}`;
  const url = `${TR_MYMEMORY_BASE}?q=${encodeURIComponent(text.slice(0,500))}&langpair=${encodeURIComponent(langpair)}`;

  const res = await fetchWithTimeout(url, {}, 9000);
  if(!res.ok) throw new Error('Tidak bisa terhubung ke server terjemahan cadangan.');
  const data = await res.json();

  const translated = data && data.responseData && data.responseData.translatedText;
  if(!translated) throw new Error('Tidak bisa menerjemahkan teks ini.');

  return {
    translatedText: translated,
    detectedSourceLanguage: (source === 'auto') ? null : source,
    alternatives: [],
    dictionary: []
  };
}

// ---------------- Render hasil ----------------
function renderResult(result){
  const el = document.getElementById('resultText');
  el.className = 'tr-result-text';
  el.textContent = result.translatedText;

  const chip = document.getElementById('detectedChip');
  if(currentSource === 'auto' && result.detectedSourceLanguage){
    chip.textContent = 'Terdeteksi: ' + trLangName(normalizeDetected(result.detectedSourceLanguage));
    chip.style.display = 'inline-block';
  }else{
    chip.style.display = 'none';
  }

  const altWrap = document.getElementById('altWrap');
  if(result.alternatives && result.alternatives.length){
    altWrap.style.display = 'flex';
    altWrap.innerHTML = result.alternatives.map(a =>
      `<button class="tr-alt-chip" onclick="useAlternative(this)">${escapeHtml(a)}</button>`
    ).join('');
  }else{
    altWrap.style.display = 'none';
    altWrap.innerHTML = '';
  }

  const dictCard = document.getElementById('dictCard');
  if(result.dictionary && result.dictionary.length){
    dictCard.style.display = 'block';
    document.getElementById('dictBody').innerHTML = result.dictionary.map(d => `
      <div class="tr-dict-pos">${escapeHtml(d.partOfSpeech || '')}</div>
      <div class="tr-dict-terms">
        ${(d.terms || []).map(t => `<span class="tr-dict-term">${escapeHtml(t)}</span>`).join('')}
      </div>
    `).join('');
  }else{
    dictCard.style.display = 'none';
    document.getElementById('dictBody').innerHTML = '';
  }
}

function normalizeDetected(code){
  // Google kadang mengirim kode tak-standar (mis. "iw" utk Ibrani) — sudah
  // sesuai daftar TR_LANGS kita, jadi cukup dikembalikan apa adanya.
  return code;
}

function useAlternative(btn){
  const text = btn.textContent;
  const el = document.getElementById('resultText');
  el.textContent = text;
  if(lastResult) lastResult.translatedText = text;
}

// ---------------- Salin & suara ----------------
function copyResult(){
  const el = document.getElementById('resultText');
  if(!el || el.classList.contains('placeholder') || !el.textContent.trim()){
    showToast('Belum ada hasil untuk disalin');
    return;
  }
  copyText(el.textContent);
}

function speakText(which){
  if(!('speechSynthesis' in window)){
    showToast('Perangkat tidak mendukung text-to-speech');
    return;
  }
  let text, langCode;
  if(which === 'src'){
    text = document.getElementById('srcText').value;
    langCode = (currentSource === 'auto' && lastResult && lastResult.detectedSourceLanguage)
      ? lastResult.detectedSourceLanguage : currentSource;
  }else{
    const el = document.getElementById('resultText');
    text = (el && !el.classList.contains('placeholder')) ? el.textContent : '';
    langCode = currentTarget;
  }
  if(!text || !text.trim()){
    showToast('Tidak ada teks untuk dibacakan');
    return;
  }

  speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = mapToSpeechLang(langCode === 'auto' ? 'en' : langCode);
  speechSynthesis.speak(utter);
}

function mapToSpeechLang(code){
  // Konversi kode bahasa Google Translate ke tag BCP-47 yang lazim dipakai
  // Web Speech API. Kalau tidak ada di peta, gunakan kode apa adanya.
  const map = {
    id:'id-ID', en:'en-US', ja:'ja-JP', ko:'ko-KR', 'zh-CN':'zh-CN', 'zh-TW':'zh-TW',
    ar:'ar-SA', fr:'fr-FR', de:'de-DE', es:'es-ES', pt:'pt-PT', ru:'ru-RU', it:'it-IT',
    nl:'nl-NL', tr:'tr-TR', vi:'vi-VN', th:'th-TH', hi:'hi-IN', ms:'ms-MY', tl:'fil-PH',
    fa:'fa-IR', pl:'pl-PL', uk:'uk-UA', sv:'sv-SE', fi:'fi-FI', da:'da-DK', no:'no-NO',
    el:'el-GR', he:'he-IL', iw:'he-IL', cs:'cs-CZ', ro:'ro-RO', hu:'hu-HU', bn:'bn-BD',
    ta:'ta-IN', te:'te-IN', ur:'ur-PK', jw:'jv-ID', su:'su-ID'
  };
  return map[code] || code;
}

// ---------------- Input suara (mic) ----------------
function toggleVoiceInput(){
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SpeechRecognition){
    showToast('Perangkat tidak mendukung input suara');
    return;
  }
  const micBtn = document.getElementById('micBtn');

  if(isListening){
    recognizer && recognizer.stop();
    return;
  }

  recognizer = new SpeechRecognition();
  recognizer.lang = mapToSpeechLang(currentSource === 'auto' ? 'id' : currentSource);
  recognizer.interimResults = false;
  recognizer.maxAlternatives = 1;

  recognizer.onstart = () => { isListening = true; micBtn.classList.add('active'); };
  recognizer.onend = () => { isListening = false; micBtn.classList.remove('active'); };
  recognizer.onerror = () => { isListening = false; micBtn.classList.remove('active'); showToast('Tidak bisa menangkap suara'); };
  recognizer.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    const ta = document.getElementById('srcText');
    ta.value = (ta.value ? ta.value + ' ' : '') + transcript;
    document.getElementById('charCount').textContent = ta.value.length;
    runTranslate(ta.value);
  };

  try{ recognizer.start(); }
  catch(_){ showToast('Tidak bisa memulai input suara'); }
}

// ---------------- Tukar bahasa ----------------
function swapLanguages(){
  if(currentSource === 'auto'){
    showToast('Tidak bisa menukar dari mode "Deteksi Bahasa"');
    return;
  }
  const tmp = currentSource;
  currentSource = currentTarget;
  currentTarget = tmp;
  updateLangButtons();
  saveLangPref();

  const srcTa = document.getElementById('srcText');
  const resEl = document.getElementById('resultText');
  const newSrcText = (resEl && !resEl.classList.contains('placeholder')) ? resEl.textContent : '';
  const oldSrcText = srcTa.value;

  srcTa.value = newSrcText;
  document.getElementById('charCount').textContent = srcTa.value.length;

  if(srcTa.value.trim()){
    runTranslate(srcTa.value);
  }else if(oldSrcText.trim()){
    showEmptyResult();
  }
}

// ---------------- Riwayat ----------------
function getHistory(){
  try{ return JSON.parse(localStorage.getItem(HIST_KEY) || '[]'); }
  catch(_){ return []; }
}

function saveHistoryEntry(sourceText, result){
  const hist = getHistory();
  const entry = {
    source: currentSource,
    target: currentTarget,
    detected: result.detectedSourceLanguage || null,
    srcText: sourceText,
    tgtText: result.translatedText,
    ts: Date.now()
  };
  // Hindari duplikat berturut-turut persis sama
  if(hist[0] && hist[0].srcText === entry.srcText && hist[0].target === entry.target){
    hist[0] = entry;
  }else{
    hist.unshift(entry);
  }
  localStorage.setItem(HIST_KEY, JSON.stringify(hist.slice(0, HIST_MAX)));
  renderHistory();
}

function renderHistory(){
  const hist = getHistory();
  const list = document.getElementById('historyList');
  if(!hist.length){
    list.innerHTML = '<div class="tr-history-empty">Belum ada riwayat terjemahan.</div>';
    return;
  }
  list.innerHTML = hist.map((h, i) => {
    const srcLangLabel = h.source === 'auto' ? trLangName(h.detected || 'auto') : trLangName(h.source);
    return `
    <div class="tr-history-item" onclick="loadHistory(${i})">
      <div class="tr-history-langs">${escapeHtml(srcLangLabel)} → ${escapeHtml(trLangName(h.target))}</div>
      <div class="tr-history-src">${escapeHtml(h.srcText)}</div>
      <div class="tr-history-tgt">${escapeHtml(h.tgtText)}</div>
    </div>`;
  }).join('');
}

function loadHistory(i){
  const hist = getHistory();
  const h = hist[i];
  if(!h) return;
  currentSource = h.source;
  currentTarget = h.target;
  updateLangButtons();
  saveLangPref();

  const ta = document.getElementById('srcText');
  ta.value = h.srcText;
  document.getElementById('charCount').textContent = ta.value.length;
  runTranslate(ta.value);
  window.scrollTo({ top:0, behavior:'smooth' });
}

function clearHistory(){
  localStorage.removeItem(HIST_KEY);
  renderHistory();
}

// ---------------- Modal pilih bahasa ----------------
function openLangModal(mode){
  langModalMode = mode;
  document.getElementById('langModalTitle').textContent = mode === 'source' ? 'Terjemahkan Dari' : 'Terjemahkan Ke';
  document.getElementById('langSearchInput').value = '';
  document.getElementById('langModalOverlay').classList.add('show');
  renderLangList();
  setTimeout(() => document.getElementById('langSearchInput').focus(), 150);
}

function closeLangModal(){
  document.getElementById('langModalOverlay').classList.remove('show');
}

function renderLangList(){
  const q = document.getElementById('langSearchInput').value.trim().toLowerCase();
  const listEl = document.getElementById('langModalList');
  const current = langModalMode === 'source' ? currentSource : currentTarget;

  let items = TR_LANGS.slice();
  if(langModalMode === 'source') items = [TR_AUTO, ...items];

  if(q){
    items = items.filter(l => l.name.toLowerCase().includes(q) || l.code.toLowerCase().includes(q));
  }

  if(!items.length){
    listEl.innerHTML = '<div class="tr-modal-empty">Bahasa tidak ditemukan.</div>';
    return;
  }

  listEl.innerHTML = items.map(l => `
    <button class="tr-modal-item ${l.code === current ? 'selected' : ''}" onclick="selectLang('${l.code}')">
      <span>${escapeHtml(l.name)}</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    </button>
  `).join('');
}

function selectLang(code){
  if(langModalMode === 'source'){
    if(code === currentTarget && code !== 'auto'){
      // tukar otomatis kalau user pilih bahasa yang sama dengan target
      currentTarget = currentSource === 'auto' ? 'id' : currentSource;
    }
    currentSource = code;
  }else{
    if(code === currentSource && currentSource !== 'auto'){
      currentSource = currentTarget;
    }
    currentTarget = code;
  }
  updateLangButtons();
  saveLangPref();
  closeLangModal();

  const ta = document.getElementById('srcText');
  if(ta.value.trim()) runTranslate(ta.value);
}
