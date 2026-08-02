// ==========================================================
// BANTUIN — Supabase Edge Function: kbbi-proxy
// Proxy GRATIS ke kbbi.raf555.dev (API KBBI publik, tanpa API key,
// tanpa biaya sama sekali). Fungsi ini hanya untuk menghindari
// masalah CORS/koneksi langsung dari WebView ke domain luar —
// bukan untuk menyembunyikan API key berbayar (sudah tidak ada lagi).
//
// Deploy:
//   supabase functions deploy kbbi-proxy --no-verify-jwt
// ==========================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const RAF555_BASE = "https://kbbi.raf555.dev/api/v1";

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
    const body = await req.json().catch(() => ({}));
    const { kata } = body;

    if (!kata || typeof kata !== "string" || kata.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Parameter 'kata' wajib diisi." }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const kataBersih = kata.trim().toLowerCase().slice(0, 100);
    const encoded = encodeURIComponent(kataBersih);

    const upstream = await fetch(`${RAF555_BASE}/entry/${encoded}`, {
      headers: { "Accept": "application/json" },
    });

    if (upstream.status === 404) {
      return new Response(
        JSON.stringify({ lemma: kataBersih, entries: [], ditemukan: false }),
        { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (!upstream.ok) {
      return new Response(
        JSON.stringify({ error: "Gagal menghubungi server KBBI. Coba lagi." }),
        { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const raw = await upstream.json();

    return new Response(JSON.stringify(raw), {
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
