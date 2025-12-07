"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function FixRolPage() {
  useEffect(() => {
    const fix = async () => {
      const { data, error } = await supabase.auth.updateUser({
        data: { rol: "admin" }
      });

      console.log("RESULTADO:", data, error);
      alert("Listo! Rol actualizado a ADMIN.");
    };

    fix();
  }, []);

  return <div>Arreglando rol...</div>;
}