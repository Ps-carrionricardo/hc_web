"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import "./dashboard.css";

type DestinoDni = "consulta" | "ficha" | null;

export default function Dashboard() {
  const router = useRouter();

  // Estado del modal, DNI y destino (consulta o ficha)
  const [modalDniAbierto, setModalDniAbierto] = useState(false);
  const [dni, setDni] = useState("");
  const [destino, setDestino] = useState<DestinoDni>(null);

  // Abrir modal para CONSULTA
  const abrirModalConsulta = () => {
    setDni("");
    setDestino("consulta");
    setModalDniAbierto(true);
  };

  // Abrir modal para FICHA CLÍNICA
  const abrirModalFicha = () => {
    setDni("");
    setDestino("ficha");
    setModalDniAbierto(true);
  };

  // Ir al destino según lo que se eligió
  const irADestino = () => {
    if (!dni || dni.length < 6) {
      alert("Ingrese un DNI válido");
      return;
    }

    if (destino === "consulta") {
      router.push(`/consulta-medica/${dni}`);
    } else if (destino === "ficha") {
      router.push(`/ficha-clinica/${dni}`);
    }

    setModalDniAbierto(false);
  };

  return (
    <div className="dash-wrapper">
      <h1 className="dash-title">Panel Principal</h1>

      <div className="dash-grid">
        {/* PADRÓN */}
        <div className="dash-card" onClick={() => router.push("/padron")}>
          <i className="bi bi-people-fill dash-icon"></i>
          <h2>Padrón de Pacientes</h2>
        </div>

        {/* CONSULTA MÉDICA (usa modal DNI) */}
        <div className="dash-card" onClick={abrirModalConsulta}>
          <i className="bi bi-journal-medical dash-icon"></i>
          <h2>Consulta Médica</h2>
        </div>

        {/* FICHA CLÍNICA (usa modal DNI) */}
        <div className="dash-card" onClick={abrirModalFicha}>
          <i className="bi bi-file-medical dash-icon"></i>
          <h2>Ficha Clínica</h2>
        </div>

        {/* AGENDA */}
        <div className="dash-card" onClick={() => router.push("/agenda")}>
          <i className="bi bi-calendar2-week dash-icon"></i>
          <h2>Agenda de Turnos</h2>
        </div>

        {/* REPORTE DEL DÍA */}
        <div className="dash-card glow" onClick={() => router.push("/reporte")}>
          <i className="bi bi-clipboard-data-fill dash-icon"></i>
          <h2>Reporte del Día</h2>
        </div>
      </div>

      {/* MODAL ÚNICO PARA DNI (Consulta o Ficha) */}
      {modalDniAbierto && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>
              {destino === "consulta"
                ? "Ingresar DNI para Consulta Médica"
                : "Ingresar DNI para Ficha Clínica"}
            </h3>

            <input
              type="text"
              className="modal-input"
              placeholder="Ej: 12345678"
              value={dni}
              onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
              maxLength={8}
            />

            <div className="modal-buttons">
              <button
                className="btn-cancel"
                onClick={() => setModalDniAbierto(false)}
              >
                Cancelar
              </button>

              <button className="btn-ok" onClick={irADestino}>
                {destino === "consulta"
                  ? "Ir a Consulta"
                  : "Ir a Ficha Clínica"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}