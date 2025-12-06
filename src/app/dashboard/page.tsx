"use client";

import { useRouter } from "next/navigation";
import "./dashboard.css";

export default function Dashboard() {
  const router = useRouter();

  return (
    <div className="dash-wrapper">

      <h1 className="dash-title">Panel Principal</h1>

      <div className="dash-grid">

        {/* PADRÓN */}
        <div className="dash-card" onClick={() => router.push("/padron")}>
          <i className="bi bi-people-fill dash-icon"></i>
          <h2>Padrón</h2>
        </div>

        {/* AGENDA */}
        <div className="dash-card" onClick={() => router.push("/agenda")}>
          <i className="bi bi-calendar2-week-fill dash-icon"></i>
          <h2>Agenda</h2>
        </div>

        {/* CONSULTA MÉDICA */}
        <div className="dash-card" onClick={() => router.push("/consulta-medica")}>
          <i className="bi bi-clipboard2-pulse-fill dash-icon"></i>
          <h2>Consulta Médica</h2>
        </div>

        {/* FICHA CLÍNICA */}
        <div className="dash-card" onClick={() => router.push("/ficha-clinica")}>
          <i className="bi bi-file-medical-fill dash-icon"></i>
          <h2>Ficha Clínica</h2>
        </div>

        {/* 🚀 NUEVA TARJETA: REPORTE DEL DÍA (CON GLOW) */}
        <div className="dash-card glow" onClick={() => router.push("/reporte")}>
          <i className="bi bi-clipboard-data-fill dash-icon"></i>
          <h2>Reporte del Día</h2>
        </div>

      </div>
    </div>
  );
}
