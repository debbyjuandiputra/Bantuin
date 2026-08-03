// ==========================================================
// BANTUIN — Supabase Edge Function: opensky-proxy
// Proxy GRATIS ke opensky-network.org/api/states/all.
// OpenSky tidak mengirim header Access-Control-Allow-Origin,
// jadi fetch langsung dari WebView/browser akan selalu gagal
// karena CORS — fungsi ini hanya meneruskan permintaan dari
// server (Deno), lalu menambahkan header CORS untuk client kita.
//
// Deploy:
//   supabase functions deploy opensky-proxy --no-verify-jwt
// ==========================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const OPENSKY_BASE = "https://opensky-network.org/api/states/all";

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
    const { lamin, lomin, lamax, lomax } = body;

    const params = new URLSearchParams();
    if ([lamin, lomin, lamax, lomax].every((v) => typeof v === "number" && !Number.isNaN(v))) {
      params.set("lamin", String(lamin));
      params.set("lomin", String(lomin));
      params.set("lamax", String(lamax));
      params.set("lomax", String(lomax));
    }

    const upstream = await fetch(`${OPENSKY_BASE}?${params.toString()}`, {
      headers: { "Accept": "application/json" },
    });

    if (upstream.status === 429) {
      return new Response(
        JSON.stringify({ error: "Kuota permintaan ke OpenSky Network sudah habis untuk saat ini. Coba lagi nanti." }),
        { status: 429, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (!upstream.ok) {
      return new Response(
        JSON.stringify({ error: `Gagal menghubungi OpenSky Network (status ${upstream.status}).` }),
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
