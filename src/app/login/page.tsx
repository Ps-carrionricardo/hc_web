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

    // 1) Buscar solo por email
    const { data, error: err } = await supabase
      .from("usuario")
      .select("*")
      .eq("email", email)
      .single();

    if (err || !data) {
      setError("Usuario o contraseña incorrectos");
      return;
    }

    // 2) Validar la contraseña manualmente
    if (data.password !== password) {
      setError("Usuario o contraseña incorrectos");
      return;
    }

    // 3) Guardar el rol en localStorage
    localStorage.setItem("rol", data.rol);

    // 4) Redirigir al dashboard
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
