"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import BuscarPacienteModal from "../../components/BuscarPacienteModal/BuscarPacienteModal";
import "./dashboard.css";

export default function Dashboard() {
  const router = useRouter();

  const [rol, setRol] = useState<string | null | undefined>(undefined);
  const [modalConsulta, setModalConsulta] = useState(false);
  const [modalFicha, setModalFicha] = useState(false);

  // 🔥 VALIDACIÓN REAL DE SESIÓN
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        router.replace("/login");
        return;
      }

      const rolUser = data.session.user.user_metadata?.rol || null;
      setRol(rolUser);
    };

    checkSession();
  }, [router]);

  // LOADING
  if (rol === undefined) {
    return <div className="dash-wrapper">Cargando...</div>;
  }

  // FUNCIONES
  const irAConsulta = (dni: string) => {
    router.push(`/consulta-medica/${dni}`);
  };

  const irAFicha = (dni: string) => {
    router.push(`/ficha-clinica/${dni}`);
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  // UI PRINCIPAL
  return (
    <div className="dash-wrapper">

      <h1 className="dash-title">Bienvenido Dr. Cáceres</h1>

      <button className="btn-logout" onClick={cerrarSesion}>
        <i className="bi bi-box-arrow-right"></i> Cerrar sesión
      </button>

      <div className="dash-grid">

        {/* PADRÓN */}
        {rol === "admin" && (
          <div className="dash-card" onClick={() => router.push("/padron")}>
            <i className="bi bi-people-fill dash-icon"></i>
            <h2>Padrón de Pacientes</h2>
          </div>
        )}

        {/* AGENDA */}
        <div className="dash-card" onClick={() => router.push("/agenda")}>
          <i className="bi bi-calendar-week dash-icon"></i>
          <h2>Agenda</h2>
        </div>

        {/* CONSULTA */}
        {rol !== "secretaria" && (
          <div className="dash-card" onClick={() => setModalConsulta(true)}>
            <i className="bi bi-heart-pulse-fill dash-icon"></i>
            <h2>Consulta Médica</h2>
          </div>
        )}

        {/* FICHA */}
        <div className="dash-card" onClick={() => setModalFicha(true)}>
          <i className="bi bi-file-medical-fill dash-icon"></i>
          <h2>Ficha Clínica</h2>
        </div>

      </div>

      {/* MODALES */}
      <BuscarPacienteModal
        abierto={modalConsulta}
        cerrar={() => setModalConsulta(false)}
        accion={irAConsulta}
      />

      <BuscarPacienteModal
        abierto={modalFicha}
        cerrar={() => setModalFicha(false)}
        accion={irAFicha}
      />

    </div>
  );
}
