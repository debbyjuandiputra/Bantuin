// ==========================================================
// BANTUIN — supabase-config.js
// ==========================================================
// URL dan key di bawah ini adalah "publishable key" (kunci publik),
// BUKAN secret key — memang aman untuk ditaruh langsung di kode
// client-side seperti ini (sama seperti cara kerja Firebase apiKey
// sebelumnya). Proteksi data sebenarnya diatur lewat Row Level
// Security (RLS) di sisi Supabase, bukan dengan menyembunyikan key ini.
// ==========================================================

const SUPABASE_URL = "https://kubydmxgxmvyksyywypi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_7u8paXqdYLcZan5LohB4mA_VR1_WS8n";

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
