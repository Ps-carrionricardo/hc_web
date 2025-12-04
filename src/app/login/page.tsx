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

  // -------------------------------------------
  // 🩵 LOGIN — FUNCIONA CON ENTER
  // -------------------------------------------
  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    console.log("Intentando login...");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("DATA:", data);
    console.log("ERROR:", error);

    if (error) {
      setError("Usuario o contraseña incorrectos");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <div className="login-icon">
          🏥
        </div>

        <h2 className="login-title">Ingreso al sistema</h2>

        {/* FORMULARIO COMPLETO */}
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
