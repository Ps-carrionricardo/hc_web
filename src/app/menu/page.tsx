"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LogoutButton from "@/components/LogoutButton";

export default function MenuPage() {
  const [user, setUser] = useState<{ username?: string; role?: string } | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    setUser(raw ? JSON.parse(raw) : null);
  }, []);

  if (!user) return null; // o redirect al login

  const role = user.role;

  // Lógica para mostrar botones según rol
  const canAccessFicha = role === "administrador" || role === "profesional";
  const canAccessConsulta = role === "administrador" || role === "profesional" || role === "recepcion";
  const canAccessPadron = role === "administrador";

  return (
    <div style={{ padding: 20 }}>
      <h1>Menú Principal</h1>
      <p>Usuario: {user.username} — Rol: {user.role}</p>

      <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
        {canAccessFicha && (
          <Link href="/ficha-clinica"><button>Ficha Clínica</button></Link>
        )}

        {canAccessConsulta && (
          <Link href="/consulta-medica"><button>Consulta Médica</button></Link>
        )}

        {canAccessPadron && (
          <Link href="/padron"><button>Padrón</button></Link>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <LogoutButton />
      </div>
    </div>
  );
}