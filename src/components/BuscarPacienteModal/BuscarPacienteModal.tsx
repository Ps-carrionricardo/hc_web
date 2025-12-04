"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import "./modal.css";

type Props = {
  abierto: boolean;
  cerrar: () => void;
  accion: (dni: string) => void; // acción que ejecutás al seleccionar DNI
};

export default function BuscarPacienteModal({ abierto, cerrar, accion }: Props) {
  const [dni, setDni] = useState("");
  const [error, setError] = useState("");

  const buscarPaciente = async () => {
    setError("");

    if (dni.trim() === "") {
      setError("Debes ingresar un DNI");
      return;
    }

    const { data, error: err } = await supabase
      .from("padron")
      .select("*")
      .eq("dni", dni)
      .single();

    if (err || !data) {
      setError("No se encontró ningún paciente con ese DNI");
      return;
    }

    // Si lo encuentra, ejecuta la acción enviada por props
    accion(dni);
    cerrar();
  };

  if (!abierto) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-contenido">
        <h2 className="modal-titulo">Buscar paciente por DNI</h2>

        <input
          type="text"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          placeholder="Ingrese DNI"
          className="modal-input"
        />

        {error && <p className="modal-error">{error}</p>}

        <div className="modal-botones">
          <button className="modal-btn-confirmar" onClick={buscarPaciente}>
            Buscar
          </button>

          <button className="modal-btn-cerrar" onClick={cerrar}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
