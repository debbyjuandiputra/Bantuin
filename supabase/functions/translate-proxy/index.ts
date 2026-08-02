// ==========================================================
// BANTUIN — Supabase Edge Function: translate-proxy
// Proxy GRATIS ke mesin Google Translate publik (endpoint "gtx"
// yang dipakai ekstensi browser & aplikasi terjemahan gratis di
// seluruh dunia). TIDAK ada API key, TIDAK ada biaya sama sekali.
//
// Alasan pakai Edge Function (bukan fetch langsung dari WebView):
// endpoint translate.googleapis.com tidak mengirim header CORS,
// jadi kalau di-fetch langsung dari browser/WebView akan diblokir.
// Dari sisi server (Edge Function) tidak ada batasan CORS seperti
// itu, jadi proxy ini yang memanggilnya lalu meneruskan hasilnya
// dengan header CORS terbuka ke aplikasi.
//
// Deploy:
//   supabase functions deploy translate-proxy --no-verify-jwt
// ==========================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function jsonRes(obj: unknown, status = 200){
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

// ---- Parser hasil mentah Google Translate (format array bersarang) ----
function parseGoogleResult(body: any, fallbackSource: string){
  const result: any = {
    translatedText: "",
    detectedSourceLanguage: fallbackSource,
    alternatives: [] as string[],
    dictionary: [] as { partOfSpeech: string; terms: string[] }[],
  };

  try{
    if(Array.isArray(body[0])){
      result.translatedText = body[0]
        .map((seg: any) => (Array.isArray(seg) ? seg[0] : ""))
        .filter(Boolean)
        .join("");
    }
  }catch(_){ /* ignore */ }

  try{
    if(typeof body[2] === "string" && body[2]){
      result.detectedSourceLanguage = body[2];
    }else if(Array.isArray(body[2]) && body[2][0]){
      result.detectedSourceLanguage = body[2][0];
    }
  }catch(_){ /* ignore */ }

  // Alternatif terjemahan lain (biasanya muncul untuk kata/frasa pendek)
  try{
    if(Array.isArray(body[5])){
      const alts: string[] = [];
      body[5].forEach((group: any) => {
        if(Array.isArray(group) && Array.isArray(group[2])){
          group[2].forEach((alt: any) => {
            if(Array.isArray(alt) && typeof alt[0] === "string") alts.push(alt[0]);
          });
        }
      });
      result.alternatives = [...new Set(alts)].filter(a => a && a !== result.translatedText).slice(0, 8);
    }
  }catch(_){ /* ignore */ }

  // Kamus (kelas kata + sinonim) — muncul untuk kata tunggal
  try{
    if(Array.isArray(body[1])){
      result.dictionary = body[1].map((entry: any) => ({
        partOfSpeech: entry[0] || "",
        terms: Array.isArray(entry[1]) ? entry[1].slice(0, 12) : [],
      })).filter((e: any) => e.terms.length);
    }
  }catch(_){ /* ignore */ }

  return result;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return jsonRes({ error: "Method not allowed" }, 405);
  }

  try{
    const body = await req.json().catch(() => ({}));
    const text = typeof body.text === "string" ? body.text : "";
    const source = typeof body.source === "string" && body.source ? body.source : "auto";
    const target = typeof body.target === "string" && body.target ? body.target : "id";

    if(!text.trim()){
      return jsonRes({ error: "Parameter 'text' wajib diisi." }, 400);
    }
    if(text.length > 5000){
      return jsonRes({ error: "Teks terlalu panjang (maksimal 5000 karakter)." }, 400);
    }

    const params = new URLSearchParams();
    params.set("client", "gtx");
    params.set("sl", source);
    params.set("tl", target);
    params.set("q", text);
    ["t", "bd", "ex", "ld", "qca", "rw", "rm", "ss"].forEach(d => params.append("dt", d));

    const upstream = await fetch(`https://translate.googleapis.com/translate_a/single?${params.toString()}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BantuinApp/1.0)" },
    });

    if(!upstream.ok){
      return jsonRes({ error: "Gagal menghubungi server terjemahan. Coba lagi." }, 502);
    }

    const raw = await upstream.json();
    const parsed = parseGoogleResult(raw, source);

    if(!parsed.translatedText){
      return jsonRes({ error: "Tidak bisa menerjemahkan teks ini. Coba lagi." }, 500);
    }

    return jsonRes(parsed, 200);
  }catch(err){
    console.error("translate-proxy error:", err);
    return jsonRes({ error: "Terjadi kesalahan di server. Coba lagi nanti." }, 500);
  }
});
