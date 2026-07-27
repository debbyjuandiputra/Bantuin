// ==========================================================
// BANTUIN — Supabase Edge Function: remove-background
// Proxy aman untuk remove.bg API.
// API key TIDAK pernah keluar ke browser — hanya ada di sini.
//
// Deploy:
//   supabase functions deploy remove-background --no-verify-jwt
//
// Set secret:
//   supabase secrets set REMOVEBG_API_KEY=your_api_key_here
// ==========================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",   // ganti ke domain kamu kalau mau lebih ketat
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req: Request) => {
  // Handle preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const apiKey = Deno.env.get("REMOVEBG_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key belum dikonfigurasi di server." }), {
        status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Ambil gambar dari request (multipart/form-data)
    const formData = await req.formData();
    const imageFile = formData.get("image_file");

    if (!imageFile || !(imageFile instanceof File)) {
      return new Response(JSON.stringify({ error: "File gambar tidak ditemukan di request." }), {
        status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Validasi ukuran (maks 8 MB)
    if (imageFile.size > 8 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: "Ukuran gambar maksimal 8 MB." }), {
        status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Kirim ke remove.bg
    const bgForm = new FormData();
    bgForm.append("image_file", imageFile);
    bgForm.append("size", "auto");

    const bgRes = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": apiKey },
      body: bgForm,
    });

    if (!bgRes.ok) {
      // Teruskan pesan error dari remove.bg
      const errText = await bgRes.text();
      let errMsg = "Gagal memproses gambar di server.";
      try {
        const errJson = JSON.parse(errText);
        errMsg = errJson?.errors?.[0]?.title || errMsg;
      } catch (_) { /* abaikan */ }

      return new Response(JSON.stringify({ error: errMsg }), {
        status: bgRes.status,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Kembalikan gambar PNG hasil remove background langsung ke browser
    const resultBuffer = await bgRes.arrayBuffer();
    return new Response(resultBuffer, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "image/png",
        "Content-Disposition": 'attachment; filename="bantuin-hapus-latar-belakang.png"',
      },
    });

  } catch (err) {
    console.error("Edge Function error:", err);
    return new Response(JSON.stringify({ error: "Terjadi kesalahan di server. Coba lagi nanti." }), {
      status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
