"use client";

import { createClient } from "@supabase/supabase-js";

// 🚨 Así se leen las variables en Next.js (versión cliente)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // cliente liviano
  },
});
