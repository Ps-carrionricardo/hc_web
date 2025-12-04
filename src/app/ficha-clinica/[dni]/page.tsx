"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import "./estilos.css";

type Paciente = {
  Apellido_y_Nombre: string;
  dni: string;
  Fecha_de_Nacimiento?: string;
  Edad?: number;
  Nro_de_Beneficio?: string;
  Telefono?: string;
};

type Turno = {
  id: number;
  fecha?: string;
  motivo_consulta?: string;
  examen_fisico?: string;
  diagnostico?: string;
  tratamiento?: string;
  observaciones?: string;
  ta_sistolica?: number | null;
  ta_diastolica?: number | null;
  peso?: number | null;
  estudios_urls?: string[] | null;
};

export default function FichaClinicaPage() {
  const params = useParams<{ dni: string }>();
  const router = useRouter();

  const dniParam = params?.dni;

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [ultimoDiagnostico, setUltimoDiagnostico] = useState<string>("—");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      if (!dniParam) return;
      setLoading(true);

      // Datos del paciente
      const { data: pacienteData } = await supabase
        .from("padron")
        .select("*")
        .eq("dni", dniParam)
        .single();

      setPaciente(pacienteData as Paciente);

      // Consultas médicas
      const { data: turnosData } = await supabase
        .from("turnos")
        .select("*")
        .eq("dni", dniParam)
        .order("fecha", { ascending: false }); // ← la última consulta según fecha

      if (turnosData) {
        setTurnos(turnosData as Turno[]);

        // Última consulta = primer elemento
        const ultima = turnosData[0];
        if (ultima?.diagnostico) {
          setUltimoDiagnostico(ultima.diagnostico);
        }
      }

      setLoading(false);
    };

    cargarDatos();
  }, [dniParam]);

  const calcularEdad = (fechaNac?: string, edadCampo?: number) => {
    if (edadCampo && edadCampo > 0) return edadCampo;
    if (!fechaNac) return null;
    const nacimiento = new Date(fechaNac);
    if (Number.isNaN(nacimiento.getTime())) return null;

    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();

    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const edadCalculada = calcularEdad(
    paciente?.Fecha_de_Nacimiento,
    paciente?.Edad
  );

  const handleImprimir = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="ficha-wrapper">
        <p>Cargando ficha clínica...</p>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="ficha-wrapper">
        <p>No se encontró el paciente.</p>
      </div>
    );
  }

  return (
    <div className="ficha-wrapper">

      {/* CABECERA SUPERIOR */}
      <div className="ficha-header no-print">
        <button
          className="ficha-btn-volver"
          onClick={() => router.push("/dashboard")}
        >
          ← Volver
        </button>
      </div>

      <div className="ficha-page">

        {/* ENCABEZADO AZUL */}
        <header className="ficha-encabezado">
          <div className="ficha-encabezado-icono">
            <i className="bi bi-hospital"></i>
          </div>
          <h1 className="ficha-titulo">FICHA MÉDICA</h1>
          <div className="ficha-obra-social">
            <span>Obra Social</span>
            <strong>PAMI</strong>
            <i className="bi bi-plus-lg"></i>
          </div>
        </header>

        {/* DATOS DEL MÉDICO */}
        <section className="ficha-medico">
          <p>Médico de Cabecera: Cáceres Daniel Marcelo</p>
          <p>Matrícula Prov.: 1553</p>
          <p>Matrícula Nac.: 146901</p>
        </section>

        {/* DATOS DEL PACIENTE */}
        <section className="ficha-bloque ficha-paciente">
          <div className="ficha-bloque-titulo verde">
            <i className="bi bi-person-fill ficha-icon"></i>
            <span>DATOS DEL PACIENTE</span>
          </div>

          <div className="ficha-paciente-body">
            <p><strong>Paciente:</strong> {paciente.Apellido_y_Nombre}</p>
            <p>
              <strong>DNI:</strong> {paciente.dni}  
              <strong>N° Afiliado:</strong> {paciente.Nro_de_Beneficio || "—"}
            </p>

            <p>
              <strong>Fecha de nacimiento:</strong>{" "}
              {paciente.Fecha_de_Nacimiento || "—"}  
              <strong>Edad:</strong> {edadCalculada ?? "—"} años
            </p>

            <p><strong>Teléfono:</strong> {paciente.Telefono || "—"}</p>
          </div>
        </section>

        {/* ANAMNESIS DINÁMICA */}
        <section className="ficha-bloque ficha-anamnesis">
          <div className="ficha-bloque-titulo violeta">
            <i className="bi bi-journal-medical ficha-icon"></i>
            <span>ANAMNESIS</span>
          </div>

          <div className="ficha-anamnesis-body">
            <p>
              Paciente que se presenta a consulta con un diagnóstico principal de:{" "}
              <strong>{ultimoDiagnostico}</strong>, y control de sus patologías de base.
            </p>
          </div>
        </section>

        {/* HISTORIAL DE CONSULTAS */}
        <section className="ficha-bloque ficha-historial">
          <div className="ficha-bloque-titulo azul">
            <i className="bi bi-clock-history ficha-icon"></i>
            <span>HISTORIAL DE CONSULTAS</span>
          </div>

          <div className="ficha-consultas-lista">
            {turnos.length === 0 && <p>No hay consultas registradas.</p>}

            {turnos.map((t) => (
              <div key={t.id} className="ficha-consulta-card">

                {/* HEADER */}
                <div className="ficha-consulta-header">
                  <p><strong>Fecha:</strong> {t.fecha}</p>

                  <p>
                    <strong>TA:</strong>{" "}
                    {t.ta_sistolica && t.ta_diastolica
                      ? `${t.ta_sistolica}/${t.ta_diastolica} mmHg`
                      : "—"}
                    {"   "}
                    <strong>Peso:</strong>{" "}
                    {t.peso != null ? `${t.peso} Kg` : "—"}
                  </p>
                </div>

                {/* BODY */}
                <div className="ficha-consulta-body">
                  <p><strong>Motivo de consulta:</strong> {t.motivo_consulta || "—"}</p>

                  <p><strong>Examen físico:</strong> {t.examen_fisico || "—"}</p>

                  <p><strong>Diagnóstico:</strong> {t.diagnostico || "—"}</p>

                  {/* TRATAMIENTO COMO LISTA */}
                  <p><strong>Tratamiento / indicaciones:</strong></p>

                  {t.tratamiento ? (
                    <ul className="listaMedicamentos">
                      {t.tratamiento
                        .split(",")
                        .map((i) => i.trim())
                        .filter((i) => i.length > 0)
                        .map((med, idx) => (
                          <li key={idx}>{med}</li>
                        ))}
                    </ul>
                  ) : (
                    <p>—</p>
                  )}

                  <p><strong>Observaciones:</strong> {t.observaciones || "—"}</p>

                  {/* ESTUDIOS */}
                  <div className="ficha-consulta-estudios">
                    <strong>Estudios complementarios:</strong>{" "}
                    {t.estudios_urls && t.estudios_urls.length > 0 ? (
                      <ul>
                        {t.estudios_urls.map((url, index) => (
                          <li key={index}>
                            <a href={url} target="_blank">
                              Ver estudio {index + 1}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span>Sin particularidad</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ACCIONES */}
        <div className="ficha-acciones no-print">
          <button className="ficha-btn-imprimir" onClick={handleImprimir}>
            🖨 Imprimir ficha clínica
          </button>
        </div>

      </div>
    </div>
  );
}
