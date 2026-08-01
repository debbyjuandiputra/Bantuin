// ==========================================================
// BANTUIN — Supabase Edge Function: kbbi-proxy
// Proxy aman untuk Anthropic API (KBBI VI Daring).
// API key Anthropic TIDAK pernah keluar ke browser.
//
// Deploy:
//   supabase functions deploy kbbi-proxy --no-verify-jwt
//
// Set secret:
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxxxxxx
// ==========================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key belum dikonfigurasi di server." }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { kata, filter } = body;

    if (!kata || typeof kata !== "string" || kata.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Parameter 'kata' wajib diisi." }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const kataBersih = kata.trim().toLowerCase().slice(0, 100);
    const filterAktif = typeof filter === "string" ? filter : "semua";

    const filterInstruction =
      filterAktif !== "semua"
        ? `Fokuskan pencarian pada: ${
            filterAktif === "entri-dasar"
              ? "entri/kata dasar saja"
              : filterAktif
          }.`
        : "Tampilkan semua jenis entri yang relevan.";

    const prompt = `Kamu adalah sistem KBBI VI Daring (Kamus Besar Bahasa Indonesia Edisi VI) dengan ejaan EYD Edisi V. Berikan informasi LENGKAP dan AKURAT untuk kata "${kataBersih}".

${filterInstruction}

Kembalikan JSON SAJA (tanpa markdown, tanpa backtick, tanpa penjelasan apapun sebelum atau sesudah JSON), dengan struktur berikut PERSIS:

{
  "kata": "kata yang dicari",
  "ditemukan": true,
  "entri_dasar": {
    "kata": "bentuk baku",
    "pelafalan": "/pe.la.fal.an/",
    "kelas_kata": ["nomina"],
    "label_ragam": null,
    "etimologi": "asal kata atau null",
    "makna": [
      {
        "nomor": 1,
        "definisi": "definisi lengkap",
        "bidang": null,
        "ragam": null,
        "contoh": "contoh kalimat"
      }
    ]
  },
  "kata_turunan": [
    { "kata": "turunan", "kelas_kata": ["verba"], "makna_singkat": "definisi singkat" }
  ],
  "gabungan_kata": [
    { "frase": "gabungan kata", "makna": "maknanya" }
  ],
  "peribahasa": [
    { "teks": "bunyi peribahasa", "makna": "maknanya" }
  ],
  "idiom": [
    { "teks": "idiom", "makna": "maknanya" }
  ],
  "ungkapan": [
    { "teks": "ungkapan", "makna": "maknanya" }
  ],
  "varian": ["bentuk lain"],
  "tesaurus": {
    "sinonim": ["kata1"],
    "antonim": ["kata2"],
    "kata_terkait": ["kata3"]
  },
  "catatan_ejaan": null
}

Jika kata BENAR-BENAR tidak ada di KBBI VI, kembalikan HANYA: {"kata":"${kataBersih}","ditemukan":false}
Berikan data selengkap dan seakurat mungkin sesuai KBBI VI resmi.`;

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error("Anthropic API error:", errText);
      return new Response(
        JSON.stringify({ error: "Gagal menghubungi server AI. Coba lagi." }),
        { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const anthropicData = await anthropicRes.json();
    const text = (anthropicData.content || [])
      .map((b: { type: string; text?: string }) => b.text || "")
      .join("");

    // Bersihkan markdown fence kalau ada
    const clean = text.replace(/```json|```/gi, "").trim();

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(clean);
    } catch (_) {
      console.error("JSON parse error, raw:", clean.slice(0, 300));
      return new Response(
        JSON.stringify({ error: "Respons AI tidak valid. Coba lagi." }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Edge Function error:", err);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan di server. Coba lagi nanti." }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
