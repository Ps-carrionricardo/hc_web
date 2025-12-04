"use client";

import { useState } from "react";
import "./modal.css";

export default function BuscarPacienteModal({ abierto, cerrar, accion }) {
  const [dni, setDni] = useState("");
  const [error, setError] = useState("");

  const validarEnviar = () => {
    if (!dni.trim()) {
      setError("Ingrese un DNI válido");
      return;
    }

    setError("");
    accion(dni); // Llamamos la acción del dashboard
    cerrar();    // Cerramos modal
  };

  if (!abierto) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Búsqueda por DNI</h2>

        <input
          type="text"
          className="modal-input"
          placeholder="Ingrese DNI"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
        />

        {error && <p className="modal-error">{error}</p>}

        <div className="modal-actions">
          <button className="btn-cancelar" onClick={cerrar}>
            Cancelar
          </button>

          <button className="btn-confirmar" onClick={validarEnviar}>
            Buscar
          </button>
        </div>
      </div>
    </div>
  );
}
