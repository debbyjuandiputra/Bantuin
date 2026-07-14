// ==========================================================
// BANTUIN — auth-keys.js — simpan kunci Authenticator (TOTP)
// ==========================================================
// Tabel Supabase: auth_keys
//   id        bigint identity primary key
//   user_id   integer references users(user_id)
//   judul     text     (nama/label kunci, plaintext — deskriptif untuk user)
//   kunci     text     (kunci TOTP terenkripsi AES-GCM via crypto.js)
//   urutan    integer  default 0 (untuk drag-reorder)
//   created_at timestamptz
// ==========================================================

const TABLE_AUTH_KEYS = 'auth_keys';

function requireKeyAuth(){
  const s = getSession();
  if(!s) return { ok:false, msg:'Silakan login terlebih dahulu untuk menyimpan kunci.' };
  return { ok:true, session:s };
}

async function listAuthKeys(){
  const auth = requireKeyAuth();
  if(!auth.ok) return { ok:false, msg:auth.msg, data:[] };

  const { data, error } = await sb
    .from(TABLE_AUTH_KEYS)
    .select('id, judul, kunci, urutan, created_at')
    .eq('user_id', auth.session.user_id)
    .order('urutan', { ascending:true });

  if(error) return { ok:false, msg: mapSupabaseError(error), data:[] };

  const result = [];
  for(const row of data){
    result.push({
      id: row.id,
      judul: row.judul,
      kunci: await decryptNoteField(row.kunci, auth.session.user_id),
      urutan: row.urutan || 0,
      created_at: row.created_at
    });
  }
  return { ok:true, data: result };
}

async function saveAuthKey({ id, judul, kunci }){
  const auth = requireKeyAuth();
  if(!auth.ok) return { ok:false, msg:auth.msg };

  const cleanJudul = (judul || '').trim();
  const cleanKunci = (kunci || '').trim();
  if(!cleanJudul) return { ok:false, msg:'Judul kunci wajib diisi.' };
  if(!cleanKunci)  return { ok:false, msg:'Kunci (secret) wajib diisi.' };

  try{
    const encKunci = await encryptNoteField(cleanKunci, auth.session.user_id);

    if(id){
      const { error } = await sb
        .from(TABLE_AUTH_KEYS)
        .update({ judul: cleanJudul, kunci: encKunci })
        .eq('id', id)
        .eq('user_id', auth.session.user_id);
      if(error) return { ok:false, msg: mapSupabaseError(error) };
      return { ok:true, id };
    }

    const { data: last } = await sb
      .from(TABLE_AUTH_KEYS)
      .select('urutan')
      .eq('user_id', auth.session.user_id)
      .order('urutan', { ascending:false })
      .limit(1)
      .maybeSingle();
    const nextUrutan = (last ? (last.urutan || 0) : 0) + 1;

    const { data, error } = await sb
      .from(TABLE_AUTH_KEYS)
      .insert({ user_id: auth.session.user_id, judul: cleanJudul, kunci: encKunci,
                urutan: nextUrutan, created_at: nowWIB() })
      .select('id')
      .single();
    if(error) return { ok:false, msg: mapSupabaseError(error) };
    return { ok:true, id: data.id };
  }catch(err){
    return { ok:false, msg: mapSupabaseError(err) };
  }
}

async function deleteAuthKey(id){
  const auth = requireKeyAuth();
  if(!auth.ok) return { ok:false, msg:auth.msg };

  const { error } = await sb
    .from(TABLE_AUTH_KEYS)
    .delete()
    .eq('id', id)
    .eq('user_id', auth.session.user_id);

  if(error) return { ok:false, msg: mapSupabaseError(error) };
  return { ok:true };
}

async function saveAuthKeyOrder(orderedIds){
  const auth = requireKeyAuth();
  if(!auth.ok) return;

  for(let i = 0; i < orderedIds.length; i++){
    await sb.from(TABLE_AUTH_KEYS)
      .update({ urutan: i })
      .eq('id', orderedIds[i])
      .eq('user_id', auth.session.user_id);
  }
}
