import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,        // 🔥 Mantiene la sesión guardada
    autoRefreshToken: true,      // 🔥 Renueva sesión automáticamente
    detectSessionInUrl: true,    // 🔥 Necesario para que funcione el login
  },
});
