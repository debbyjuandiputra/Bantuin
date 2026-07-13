// ==========================================================
// BANTUIN — notes.js — fitur Catatan (CRUD + ekspor)
// ==========================================================
// Tabel Supabase: catatan (lihat SUPABASE_SETUP.md untuk skema & RLS)
//   id          bigint identity primary key
//   user_id     integer  -> references users(user_id)
//   judul       text     -> terenkripsi (lihat crypto.js)
//   isi         text     -> terenkripsi, berisi HTML hasil editor (bold/italic/underline/list)
//   created_at  timestamptz
//   updated_at  timestamptz
//
// Fitur Catatan WAJIB login (tidak ada mode tamu) karena catatan
// melekat ke user_id akun. Halaman pemanggil harus membungkus
// pemakaian fungsi-fungsi ini dengan requireAuth().
// ==========================================================

const TABLE_NOTES = 'catatan';

async function listNotes(){
  const session = getSession();
  if(!session) return { ok:false, msg:'Anda harus masuk terlebih dahulu.', data:[] };

  const { data, error } = await sb
    .from(TABLE_NOTES)
    .select('id, judul, isi, created_at, updated_at')
    .eq('user_id', session.user_id)
    .order('updated_at', { ascending:false });

  if(error) return { ok:false, msg: mapSupabaseError(error), data:[] };

  const result = [];
  for(const row of data){
    result.push({
      id: row.id,
      judul: await decryptNoteField(row.judul, session.user_id),
      isi: await decryptNoteField(row.isi, session.user_id),
      created_at: row.created_at,
      updated_at: row.updated_at
    });
  }
  return { ok:true, data: result };
}

async function getNote(id){
  const session = getSession();
  if(!session) return { ok:false, msg:'Anda harus masuk terlebih dahulu.' };

  const { data, error } = await sb
    .from(TABLE_NOTES)
    .select('id, judul, isi, created_at, updated_at')
    .eq('id', id)
    .eq('user_id', session.user_id)
    .maybeSingle();

  if(error) return { ok:false, msg: mapSupabaseError(error) };
  if(!data) return { ok:false, msg:'Catatan tidak ditemukan.' };

  return {
    ok:true,
    data: {
      id: data.id,
      judul: await decryptNoteField(data.judul, session.user_id),
      isi: await decryptNoteField(data.isi, session.user_id),
      created_at: data.created_at,
      updated_at: data.updated_at
    }
  };
}

// id kosong/null -> buat catatan baru. id terisi -> update catatan milik user itu sendiri.
async function saveNote({ id, judul, isiHtml }){
  const session = getSession();
  if(!session) return { ok:false, msg:'Anda harus masuk terlebih dahulu.' };

  const cleanJudul = (judul || '').trim();
  if(!cleanJudul) return { ok:false, msg:'Judul wajib diisi.' };

  try{
    const encJudul = await encryptNoteField(cleanJudul, session.user_id);
    const encIsi = await encryptNoteField(isiHtml || '', session.user_id);
    const now = nowWIB();

    if(id){
      const { error } = await sb
        .from(TABLE_NOTES)
        .update({ judul: encJudul, isi: encIsi, updated_at: now })
        .eq('id', id)
        .eq('user_id', session.user_id);
      if(error) return { ok:false, msg: mapSupabaseError(error) };
      return { ok:true, id };
    }

    const { data, error } = await sb
      .from(TABLE_NOTES)
      .insert({ user_id: session.user_id, judul: encJudul, isi: encIsi, created_at: now, updated_at: now })
      .select('id')
      .single();
    if(error) return { ok:false, msg: mapSupabaseError(error) };
    return { ok:true, id: data.id };
  }catch(err){
    return { ok:false, msg: mapSupabaseError(err) };
  }
}

async function deleteNote(id){
  const session = getSession();
  if(!session) return { ok:false, msg:'Anda harus masuk terlebih dahulu.' };

  const { error } = await sb
    .from(TABLE_NOTES)
    .delete()
    .eq('id', id)
    .eq('user_id', session.user_id);

  if(error) return { ok:false, msg: mapSupabaseError(error) };
  return { ok:true };
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
