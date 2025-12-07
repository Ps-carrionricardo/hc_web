"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import "./estilos.css";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 🔥 LOGIN REAL DE SUPABASE AUTH
    const { data, error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (err) {
      setError("Usuario o contraseña incorrectos");
      return;
    }

    // 🔥 GUARDAR EL ROL (si usás roles custom)
    // Podés obtenerlo de user_metadata
    if (data.user?.user_metadata?.rol) {
      localStorage.setItem("rol", data.user.user_metadata.rol);
    }

    // 🔥 REDIRIGIR
    router.push("/dashboard");
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <div className="login-icon">🏥</div>
        <h2 className="login-title">Ingreso al sistema</h2>

        <form onSubmit={login} className="login-form">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="login-btn">
            Ingresar
          </button>
        </form>
        
      </div>
    </div>
  );
}