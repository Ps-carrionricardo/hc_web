"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FormLogin() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const router = useRouter();

  const handleSubmit = (e: any) => {
    e.preventDefault();

    // Usuario temporal:
    if (user === "admin" && pass === "1234") {
      const userData = {
        username: "admin",
        role: "admin",
      };
      localStorage.setItem("user", JSON.stringify(userData));
      router.push("/dashboard");
      return;
    }

    if (user === "prof" && pass === "1234") {
      const userData = {
        username: "prof",
        role: "profesional",
      };
      localStorage.setItem("user", JSON.stringify(userData));
      router.push("/dashboard");
      return;
    }

    alert("Usuario o contraseña incorrectos");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Usuario"
        value={user}
        onChange={(e) => setUser(e.target.value)}
        className="border p-2"
      />

      <input
        type="password"
        placeholder="Contraseña"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        className="border p-2"
      />

      <button type="submit" className="bg-blue-500 text-white p-2">
        Entrar
      </button>
    </form>
  );
}
