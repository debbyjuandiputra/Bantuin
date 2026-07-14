// ==========================================================
// BANTUIN — notes.js — fitur Catatan (CRUD + pin + urutan + ekspor)
// ==========================================================
// Tabel Supabase: catatan
//   id          bigint identity primary key
//   user_id     integer  -> references users(user_id)
//   judul       text     -> terenkripsi (lihat crypto.js)
//   isi         text     -> terenkripsi, berisi HTML hasil editor
//   pin         boolean  default false
//   urutan      integer  default 0  (semakin kecil = semakin atas)
//   created_at  timestamptz
//   updated_at  timestamptz
// ==========================================================

const TABLE_NOTES = 'catatan';

// Helper: cek login & kembalikan pesan ramah jika belum
function requireNoteAuth(){
  const s = getSession();
  if(!s) return { ok:false, msg:'Silakan login terlebih dahulu.' };
  return { ok:true, session:s };
}

async function listNotes(){
  const auth = requireNoteAuth();
  if(!auth.ok) return { ok:false, msg:auth.msg, data:[] };

  const { data, error } = await sb
    .from(TABLE_NOTES)
    .select('id, judul, isi, pin, urutan, created_at, updated_at')
    .eq('user_id', auth.session.user_id)
    .order('pin', { ascending:false })
    .order('urutan', { ascending:true })
    .order('updated_at', { ascending:false });

  if(error) return { ok:false, msg: mapSupabaseError(error), data:[] };

  const result = [];
  for(const row of data){
    result.push({
      id: row.id,
      judul: await decryptNoteField(row.judul, auth.session.user_id),
      isi: await decryptNoteField(row.isi, auth.session.user_id),
      pin: row.pin || false,
      urutan: row.urutan || 0,
      created_at: row.created_at,
      updated_at: row.updated_at
    });
  }
  return { ok:true, data: result };
}

async function getNote(id){
  const auth = requireNoteAuth();
  if(!auth.ok) return { ok:false, msg:auth.msg };

  const { data, error } = await sb
    .from(TABLE_NOTES)
    .select('id, judul, isi, pin, urutan, created_at, updated_at')
    .eq('id', id)
    .eq('user_id', auth.session.user_id)
    .maybeSingle();

  if(error) return { ok:false, msg: mapSupabaseError(error) };
  if(!data) return { ok:false, msg:'Catatan tidak ditemukan.' };

  return {
    ok:true,
    data: {
      id: data.id,
      judul: await decryptNoteField(data.judul, auth.session.user_id),
      isi: await decryptNoteField(data.isi, auth.session.user_id),
      pin: data.pin || false,
      urutan: data.urutan || 0,
      created_at: data.created_at,
      updated_at: data.updated_at
    }
  };
}

async function saveNote({ id, judul, isiHtml }){
  const auth = requireNoteAuth();
  if(!auth.ok) return { ok:false, msg:auth.msg };

  const cleanJudul = (judul || '').trim();
  if(!cleanJudul) return { ok:false, msg:'Judul wajib diisi.' };

  try{
    const encJudul = await encryptNoteField(cleanJudul, auth.session.user_id);
    const encIsi   = await encryptNoteField(isiHtml || '', auth.session.user_id);
    const now = nowWIB();

    if(id){
      const { error } = await sb
        .from(TABLE_NOTES)
        .update({ judul: encJudul, isi: encIsi, updated_at: now })
        .eq('id', id)
        .eq('user_id', auth.session.user_id);
      if(error) return { ok:false, msg: mapSupabaseError(error) };
      return { ok:true, id };
    }

    // Baru: ambil urutan terbesar lalu +1 supaya catatan baru muncul di paling bawah
    const { data: last } = await sb
      .from(TABLE_NOTES)
      .select('urutan')
      .eq('user_id', auth.session.user_id)
      .order('urutan', { ascending:false })
      .limit(1)
      .maybeSingle();
    const nextUrutan = (last ? (last.urutan || 0) : 0) + 1;

    const { data, error } = await sb
      .from(TABLE_NOTES)
      .insert({ user_id: auth.session.user_id, judul: encJudul, isi: encIsi,
                pin: false, urutan: nextUrutan, created_at: now, updated_at: now })
      .select('id')
      .single();
    if(error) return { ok:false, msg: mapSupabaseError(error) };
    return { ok:true, id: data.id };
  }catch(err){
    return { ok:false, msg: mapSupabaseError(err) };
  }
}

async function deleteNote(id){
  const auth = requireNoteAuth();
  if(!auth.ok) return { ok:false, msg:auth.msg };

  const { error } = await sb
    .from(TABLE_NOTES)
    .delete()
    .eq('id', id)
    .eq('user_id', auth.session.user_id);

  if(error) return { ok:false, msg: mapSupabaseError(error) };
  return { ok:true };
}

async function updateNotePin(id, pinValue){
  const auth = requireNoteAuth();
  if(!auth.ok) return { ok:false, msg:auth.msg };

  const { error } = await sb
    .from(TABLE_NOTES)
    .update({ pin: pinValue, updated_at: nowWIB() })
    .eq('id', id)
    .eq('user_id', auth.session.user_id);

  if(error) return { ok:false, msg: mapSupabaseError(error) };
  return { ok:true };
}

// Simpan urutan baru setelah drag: update kolom `urutan` berdasarkan posisi array
async function saveNoteOrder(orderedIds){
  const auth = requireNoteAuth();
  if(!auth.ok) return;

  // Update satu per satu (Supabase JS v2 tidak mendukung bulk update per-row berbeda)
  for(let i = 0; i < orderedIds.length; i++){
    await sb.from(TABLE_NOTES)
      .update({ urutan: i })
      .eq('id', orderedIds[i])
      .eq('user_id', auth.session.user_id);
  }
}

// ---------------- Ekspor Catatan ----------------
function exportNoteAsTxt(judul, html){
  const text = judul + '\n' + '='.repeat(Math.max(judul.length, 3)) + '\n\n' + htmlToPlainText(html);
  downloadBlob(new Blob([text], { type:'text/plain;charset=utf-8' }), sanitizeFilename(judul) + '.txt');
}

function exportNoteAsMd(judul, html){
  const md = `# ${judul}\n\n` + htmlToMarkdown(html);
  downloadBlob(new Blob([md], { type:'text/markdown;charset=utf-8' }), sanitizeFilename(judul) + '.md');
}

async function exportNoteAsDocx(judul, html){
  if(typeof htmlDocx === 'undefined'){
    showToast('Modul ekspor DOCX gagal dimuat. Cek koneksi internet.');
    return;
  }
  const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
    <body><h1>${escapeHtml(judul)}</h1>${html || ''}</body></html>`;
  const blob = htmlDocx.asBlob(fullHtml);
  downloadBlob(blob, sanitizeFilename(judul) + '.docx');
}
