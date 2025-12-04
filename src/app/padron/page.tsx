"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import ConsultaMedicaModal from "@/components/ConsultaMedicaModal/ConsultaMedicaModal";

import "./padron-light.css";
import "./padron-dark.css";

export default function PadronPage() {
  const [padron, setPadron] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");

  // tema: "dark" o "light"
  const [tema, setTema] = useState("dark");

  // modal consulta
  const [modalConsultaAbierto, setModalConsultaAbierto] = useState(false);
  const [consultaDni, setConsultaDni] = useState("");
  const [consultaNombre, setConsultaNombre] = useState("");

  const [toast, setToast] = useState("");

  /** ================================
   * CARGA PADRÓN DE SUPABASE
   =================================*/
  useEffect(() => {
    const fetchPadron = async () => {
      const { data, error } = await supabase.from("padron").select("*");
      if (error) console.error(error);
      else setPadron(data);
    };

    fetchPadron();
  }, []);

  /** ================================
   * BUSCADOR DINÁMICO
   =================================*/
  const pacientesFiltrados = padron.filter((p) => {
    const nombre = p.Apellido_y_Nombre?.toLowerCase() || "";
    const dni = p.dni?.toString() || "";
    const texto = busqueda.toLowerCase();

    return nombre.includes(texto) || dni.includes(texto);
  });

  /** ================================
   * ABRIR MODAL CONSULTA
   =================================*/
  const abrirModalConsulta = (dni: any, nombre: any) => {
    setConsultaDni(dni);
    setConsultaNombre(nombre);
    setModalConsultaAbierto(true);
  };

  const cerrarModalConsulta = () => {
    setModalConsultaAbierto(false);
  };

  /** ================================
   * GUARDAR CONSULTA EN SUPABASE
   =================================*/
  const guardarConsulta = async (formData: any) => {
    try {
      const { error } = await supabase.from("consultas").insert({
        dni: consultaDni,
        nombre: consultaNombre,
        motivo_consulta: formData.motivo,
        examen_fisico: formData.examen,
        diagnostico: formData.diagnostico,
        tratamiento: formData.tratamiento,
        observaciones: formData.observaciones,
        ta_sistolica: formData.ta_sistolica,
        ta_diastolica: formData.ta_diastolica,
        peso: formData.peso,
        estudios_urls: formData.estudios,
      });

      if (error) throw error;

      setToast("Consulta médica guardada correctamente ✔");
      cerrarModalConsulta();
      setTimeout(() => setToast(""), 2500);
    } catch (err) {
      console.error(err);
      setToast("Error al guardar la consulta ❌");
      setTimeout(() => setToast(""), 2500);
    }
  };

  /** ================================
   * RENDER
   =================================*/
  return (
    <div className={`padron-container ${tema}`}>
      {/* SWITCH DE TEMA */}
      <div className="theme-switch">
        <button
          className="theme-button"
          onClick={() => setTema(tema === "dark" ? "light" : "dark")}
        >
          {tema === "dark" ? "☀ Tema Claro" : "🌙 Tema Oscuro"}
        </button>
      </div>

      <h1 className="padron-title">Padrón de Pacientes</h1>

      {toast && <div className="padron-toast">{toast}</div>}

      {/* BUSCADOR */}
      <input
        type="text"
        placeholder="Buscar por DNI o Nombre"
        className="padron-buscador"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {/* TABLA */}
      <div className="padron-tabla">
        <table>
          <thead>
            <tr>
              <th>DNI</th>
              <th>Nombre</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {pacientesFiltrados.map((p, i) => (
              <tr key={i}>
                <td>{p.dni}</td>
                <td>{p.Apellido_y_Nombre}</td>

                <td>
                  <button
                    className="btn-consulta"
                    onClick={() => abrirModalConsulta(p.dni, p.Apellido_y_Nombre)}
                  >
                    🩺 Nueva consulta
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL CONSULTA */}
      {modalConsultaAbierto && (
        <ConsultaMedicaModal
          isOpen={modalConsultaAbierto}
          onClose={cerrarModalConsulta}
          paciente={{
            dni: consultaDni,
            Apellido_y_Nombre: consultaNombre,
          }}
          onSave={guardarConsulta}
        />
      )}
    </div>
  );
}
