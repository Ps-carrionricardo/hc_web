"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import "./estilo_moderno.css";  // 🔵 ← Nuevo CSS moderno

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
  const [ultimoMotivo, setUltimoMotivo] = useState<string>("—");
  const [proximaConsulta, setProximaConsulta] = useState<string>("—");
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

      // Turnos
      const { data: turnosData } = await supabase
        .from("turnos")
        .select("*")
        .eq("dni", dniParam)
        .order("fecha", { ascending: false });

      if (turnosData) {
        setTurnos(turnosData as Turno[]);
        const ultima = turnosData[0];

        if (ultima?.motivo_consulta) {
          setUltimoMotivo(ultima.motivo_consulta);
        }

        // Próxima consulta (última + 31 días)
        if (ultima?.fecha) {
          const fechaUltima = new Date(ultima.fecha);
          const fechaProxima = new Date(fechaUltima);
          fechaProxima.setDate(fechaUltima.getDate() + 31);
          setProximaConsulta(fechaProxima.toISOString().split("T")[0]);
        }
      }

      setLoading(false);
    };

    cargarDatos();
  }, [dniParam]);

  if (loading) return <div className="cargando">Cargando Ficha...</div>;
  if (!paciente) return <div className="cargando">Paciente no encontrado</div>;

  return (
    <div className="ficha-container">

      {/* ENCABEZADO PRINCIPAL */}
      <header className="ficha-header-modern">
        <div className="header-left">
          <i className="bi bi-hospital large-icon"></i>
          <h1>FICHA MÉDICA</h1>
        </div>

        <div className="header-right">
          <span>Obra Social</span>
          <strong>PAMI</strong>
          <i className="bi bi-plus-lg"></i>
        </div>
      </header>

      {/* DATOS DEL MÉDICO */}
      <section className="card medico-card">
        <h2><i className="bi bi-person-vcard"></i> DATOS DEL MÉDICO</h2>
        <p><strong>Médico:</strong> Cáceres Daniel Marcelo</p>
        <p><strong>Matrícula Prov.:</strong> 1553</p>
        <p><strong>Matrícula Nac.:</strong> 146901</p>
      </section>

      {/* DATOS DEL PACIENTE */}
      <section className="card paciente-card">
        <h2><i className="bi bi-person-fill"></i> DATOS DEL PACIENTE</h2>

        <div className="fila">
          <p><strong>Paciente:</strong> {paciente.Apellido_y_Nombre}</p>
          <p><strong>DNI:</strong> {paciente.dni}</p>
        </div>

        <div className="fila">
          <p><strong>N° Afiliado:</strong> {paciente.Nro_de_Beneficio || "—"}</p>
          <p><strong>Teléfono:</strong> {paciente.Telefono || "—"}</p>
        </div>

        <div className="fila">
          <p><strong>Fecha de Nacimiento:</strong> {paciente.Fecha_de_Nacimiento || "—"}</p>
          <p><strong>Edad:</strong> {paciente.Edad || "—"} Años</p>
        </div>
      </section>

      {/* ANAMNESIS */}
      <section className="card anamnesis-card amarillo">
        <h2><i className="bi bi-journal-medical"></i> ANAMNESIS</h2>
        <p>
          Paciente que se presenta con motivo principal de:
          <strong> {ultimoMotivo}</strong>.
        </p>
      </section>

      {/* HISTORIAL DE CONSULTAS */}
      <section className="card historial-card azul">
        <h2><i className="bi bi-clock-history"></i> HISTORIAL DE CONSULTAS</h2>

        {turnos.length === 0 && <p>No hay consultas registradas.</p>}

        {turnos.map((t) => (
          <div key={t.id} className="consulta-item">
            <div className="consulta-header">
              <p><strong>Fecha:</strong> {t.fecha}</p>
              <p><strong>TA:</strong> {t.ta_sistolica}/{t.ta_diastolica} mmHg</p>
              <p><strong>Peso:</strong> {t.peso || "—"} Kg</p>
            </div>

            <p><strong>Motivo:</strong> {t.motivo_consulta}</p>
            <p><strong>Examen Físico:</strong> {t.examen_fisico}</p>
            <p><strong>Diagnóstico:</strong> {t.diagnostico}</p>
            <p><strong>Tratamiento:</strong> {t.tratamiento}</p>
            <p><strong>Observaciones:</strong> {t.observaciones}</p>

            <div>
              <strong>Estudios:</strong>{" "}
              {t.estudios_urls?.length ? (
                t.estudios_urls.map((url, index) => (
                  <a key={index} href={url} target="_blank">Ver {index + 1}</a>
                ))
              ) : (
                "Sin particularidad"
              )}
            </div>
          </div>
        ))}
      </section>

      {/* PRÓXIMA CONSULTA */}
      <section className="card proxima-card verde-claro">
        <h2><i className="bi bi-calendar-event"></i> PRÓXIMA CONSULTA</h2>
        <p>Se sugiere próxima consulta a partir de: <strong>{proximaConsulta}</strong></p>
      </section>

      {/* ACCIONES */}
      <div className="acciones">
        <button onClick={() => router.push("/dashboard")} className="btn-volver">← Volver</button>
        <button onClick={() => window.print()} className="btn-imprimir">🖨 Imprimir</button>
      </div>

    </div>
  );
}