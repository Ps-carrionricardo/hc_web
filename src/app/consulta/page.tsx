"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient"; // 👈 ajustá si tu ruta es otra
import "./estilos.css";

type TurnoForm = {
  fecha: string;
  paciente_nombre: string;
  paciente_dni: string;
  motivo: string;
  notas_turno: string;
  ta_sistolica: string;
  ta_diastolica: string;
  peso: string;
  motivo_consulta: string;
  examen_fisico: string;
  diagnostico: string;
  tratamiento: string;
  observaciones: string;
};

export default function ConsultaPage() {
  const [dniBusqueda, setDniBusqueda] = useState("");
  const [paciente, setPaciente] = useState<any>(null);
  const [buscandoPaciente, setBuscandoPaciente] = useState(false);
  const [errorPaciente, setErrorPaciente] = useState<string | null>(null);

  const [form, setForm] = useState<TurnoForm>({
    fecha: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
    paciente_nombre: "",
    paciente_dni: "",
    motivo: "",
    notas_turno: "",
    ta_sistolica: "",
    ta_diastolica: "",
    peso: "",
    motivo_consulta: "",
    examen_fisico: "",
    diagnostico: "",
    tratamiento: "",
    observaciones: "",
  });

  const [estudiosUrls, setEstudiosUrls] = useState<string[]>([]);
  const [subiendoEstudios, setSubiendoEstudios] = useState(false);
  const [errorEstudios, setErrorEstudios] = useState<string | null>(null);

  const [guardando, setGuardando] = useState(false);
  const [mensajeOk, setMensajeOk] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  // ------------------ BUSCAR PACIENTE POR DNI ------------------
  const manejarBuscarPaciente = async (e: React.FormEvent) => {
    e.preventDefault();
    setBuscandoPaciente(true);
    setErrorPaciente(null);
    setPaciente(null);
    setMensajeOk(null);
    setMensajeError(null);

    if (!dniBusqueda.trim()) {
      setErrorPaciente("Ingresá un DNI para buscar.");
      setBuscandoPaciente(false);
      return;
    }

    const { data, error } = await supabase
      .from("padron")
      .select("*")
      .eq("dni", dniBusqueda.trim())
      .single();

    setBuscandoPaciente(false);

    if (error || !data) {
      console.error("Error buscando paciente:", error);
      setErrorPaciente("No se encontró paciente con ese DNI.");
      return;
    }

    setPaciente(data);

    // Intento armar el nombre con distintas variantes habituales de columnas
    const nombrePaciente =
      (data.Apellido_y_N &&
        typeof data.Apellido_y_N === "string" &&
        data.Apellido_y_N) ||
      (data.apellido_y_nombre &&
        typeof data.apellido_y_nombre === "string" &&
        data.apellido_y_nombre) ||
      (data.nombre && typeof data.nombre === "string" && data.nombre) ||
      "";

    setForm((prev) => ({
      ...prev,
      paciente_nombre: nombrePaciente,
      paciente_dni: data.dni?.toString() ?? "",
    }));
  };

  // ------------------ MANEJO FORM ------------------
  const actualizarCampo = (
    campo: keyof TurnoForm,
    valor: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  // ------------------ SUBIDA DE ESTUDIOS ------------------
  const manejarArchivos = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setSubiendoEstudios(true);
    setErrorEstudios(null);

    const nuevasUrls: string[] = [];

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop() || "bin";
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${ext}`;

      // 👇 Cambiá "estudios" si tu bucket se llama distinto
      const { data, error } = await supabase.storage
        .from("estudios")
        .upload(fileName, file);

      if (error) {
        console.error("Error subiendo estudio:", error);
        setErrorEstudios("Error subiendo uno de los estudios.");
        continue;
      }

      const { data: publicData } = supabase.storage
        .from("estudios")
        .getPublicUrl(data.path);

      if (publicData?.publicUrl) {
        nuevasUrls.push(publicData.publicUrl);
      }
    }

    setEstudiosUrls((prev) => [...prev, ...nuevasUrls]);
    setSubiendoEstudios(false);
    // Reseteo input para poder volver a elegir los mismos archivos si hace falta
    e.target.value = "";
  };

  const quitarEstudio = (url: string) => {
    setEstudiosUrls((prev) => prev.filter((u) => u !== url));
  };

  // ------------------ GUARDAR EN SUPABASE ------------------
  const manejarGuardarTurno = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setMensajeOk(null);
    setMensajeError(null);

    // Validación simple
    if (!form.paciente_dni || !form.paciente_nombre) {
      setMensajeError("Primero buscá y seleccioná un paciente.");
      setGuardando(false);
      return;
    }

    if (!form.fecha) {
      setMensajeError("La fecha es obligatoria.");
      setGuardando(false);
      return;
    }

    const payload = {
      fecha: form.fecha, // date
      paciente_nombre: form.paciente_nombre,
      paciente_dni: form.paciente_dni,
      motivo: form.motivo || null,
      notas_turno: form.notas_turno || null,
      ta_sistolica: form.ta_sistolica
        ? Number(form.ta_sistolica)
        : null,
      ta_diastolica: form.ta_diastolica
        ? Number(form.ta_diastolica)
        : null,
      peso: form.peso ? Number(form.peso) : null,
      motivo_consulta: form.motivo_consulta || null,
      examen_fisico: form.examen_fisico || null,
      diagnostico: form.diagnostico || null,
      tratamiento: form.tratamiento || null,
      observaciones: form.observaciones || null,
      estudios_urls: estudiosUrls.length ? estudiosUrls : null,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("turnos")
      .insert([payload]);

    setGuardando(false);

    if (error) {
      console.error("Error guardando turno:", error);
      setMensajeError(
        "Ocurrió un error guardando el turno en la base de datos."
      );
      return;
    }

    setMensajeOk("Turno guardado correctamente ✅");
    // Opcional: limpiar algunos campos pero dejar paciente
    setForm((prev) => ({
      ...prev,
      motivo: "",
      notas_turno: "",
      ta_sistolica: "",
      ta_diastolica: "",
      peso: "",
      motivo_consulta: "",
      examen_fisico: "",
      diagnostico: "",
      tratamiento: "",
      observaciones: "",
    }));
    setEstudiosUrls([]);
  };

  return (
    <div className="consulta-page">
      <h1 className="consulta-titulo">
        Finalizar consulta / Registrar turno
      </h1>

      {/* BUSCADOR DE PACIENTE */}
      <section className="consulta-buscador-card">
        <form
          className="consulta-buscador-form"
          onSubmit={manejarBuscarPaciente}
        >
          <div className="consulta-buscador-input-group">
            <label htmlFor="dni" className="consulta-label">
              Buscar paciente por DNI
            </label>
            <div className="consulta-buscador-row">
              <input
                id="dni"
                type="text"
                value={dniBusqueda}
                onChange={(e) => setDniBusqueda(e.target.value)}
                className="consulta-input"
                placeholder="Ej: 12345678"
              />
              <button
                type="submit"
                className="consulta-btn-primario"
                disabled={buscandoPaciente}
              >
                {buscandoPaciente ? "Buscando..." : "Buscar"}
              </button>
            </div>
          </div>
        </form>

        {errorPaciente && (
          <p className="consulta-alerta-error">
            {errorPaciente}
          </p>
        )}

        {paciente && (
          <div className="consulta-paciente-resumen">
            <h2>Paciente seleccionado</h2>
            <p>
              <strong>DNI:</strong>{" "}
              {paciente.dni ?? "—"}
            </p>
            <p>
              <strong>Nombre:</strong>{" "}
              {paciente.Apellido_y_N ??
                paciente.apellido_y_nombre ??
                paciente.nombre ??
                "—"}
            </p>
            {paciente.fecha_nacimiento && (
              <p>
                <strong>Fecha nac.:</strong>{" "}
                {paciente.fecha_nacimiento}
              </p>
            )}
          </div>
        )}
      </section>

      {/* FORMULARIO PRINCIPAL */}
      <section className="consulta-layout">
        <form
          className="consulta-form-card"
          onSubmit={manejarGuardarTurno}
        >
          <div className="consulta-form-grid">
            <div className="consulta-form-col">
              <h2>Datos de la consulta</h2>

              <div className="consulta-field">
                <label className="consulta-label">
                  Fecha
                </label>
                <input
                  type="date"
                  value={form.fecha}
                  onChange={(e) =>
                    actualizarCampo("fecha", e.target.value)
                  }
                  className="consulta-input"
                />
              </div>

              <div className="consulta-field">
                <label className="consulta-label">
                  Paciente
                </label>
                <input
                  type="text"
                  value={form.paciente_nombre}
                  onChange={(e) =>
                    actualizarCampo(
                      "paciente_nombre",
                      e.target.value
                    )
                  }
                  className="consulta-input"
                  placeholder="Nombre y apellido"
                />
              </div>

              <div className="consulta-field">
                <label className="consulta-label">
                  DNI
                </label>
                <input
                  type="text"
                  value={form.paciente_dni}
                  onChange={(e) =>
                    actualizarCampo(
                      "paciente_dni",
                      e.target.value
                    )
                  }
                  className="consulta-input"
                  placeholder="DNI"
                />
              </div>

              <div className="consulta-field">
                <label className="consulta-label">
                  Motivo del turno
                </label>
                <input
                  type="text"
                  value={form.motivo}
                  onChange={(e) =>
                    actualizarCampo("motivo", e.target.value)
                  }
                  className="consulta-input"
                  placeholder="Control, consulta espontánea, etc."
                />
              </div>

              <div className="consulta-field">
                <label className="consulta-label">
                  Notas del turno
                </label>
                <textarea
                  value={form.notas_turno}
                  onChange={(e) =>
                    actualizarCampo(
                      "notas_turno",
                      e.target.value
                    )
                  }
                  className="consulta-textarea"
                  rows={3}
                />
              </div>

              <h3>Signos vitales</h3>

              <div className="consulta-field-row">
                <div className="consulta-field">
                  <label className="consulta-label">
                    TA sistólica
                  </label>
                  <input
                    type="number"
                    value={form.ta_sistolica}
                    onChange={(e) =>
                      actualizarCampo(
                        "ta_sistolica",
                        e.target.value
                      )
                    }
                    className="consulta-input"
                    placeholder="Ej: 120"
                  />
                </div>

                <div className="consulta-field">
                  <label className="consulta-label">
                    TA diastólica
                  </label>
                  <input
                    type="number"
                    value={form.ta_diastolica}
                    onChange={(e) =>
                      actualizarCampo(
                        "ta_diastolica",
                        e.target.value
                      )
                    }
                    className="consulta-input"
                    placeholder="Ej: 80"
                  />
                </div>

                <div className="consulta-field">
                  <label className="consulta-label">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.peso}
                    onChange={(e) =>
                      actualizarCampo("peso", e.target.value)
                    }
                    className="consulta-input"
                    placeholder="Ej: 72.5"
                  />
                </div>
              </div>
            </div>

            <div className="consulta-form-col">
              <h2>Contenido clínico</h2>

              <div className="consulta-field">
                <label className="consulta-label">
                  Motivo de consulta
                </label>
                <textarea
                  value={form.motivo_consulta}
                  onChange={(e) =>
                    actualizarCampo(
                      "motivo_consulta",
                      e.target.value
                    )
                  }
                  className="consulta-textarea"
                  rows={3}
                />
              </div>

              <div className="consulta-field">
                <label className="consulta-label">
                  Examen físico
                </label>
                <textarea
                  value={form.examen_fisico}
                  onChange={(e) =>
                    actualizarCampo(
                      "examen_fisico",
                      e.target.value
                    )
                  }
                  className="consulta-textarea"
                  rows={3}
                />
              </div>

              <div className="consulta-field">
                <label className="consulta-label">
                  Diagnóstico
                </label>
                <textarea
                  value={form.diagnostico}
                  onChange={(e) =>
                    actualizarCampo(
                      "diagnostico",
                      e.target.value
                    )
                  }
                  className="consulta-textarea"
                  rows={3}
                />
              </div>

              <div className="consulta-field">
                <label className="consulta-label">
                  Tratamiento
                </label>
                <textarea
                  value={form.tratamiento}
                  onChange={(e) =>
                    actualizarCampo(
                      "tratamiento",
                      e.target.value
                    )
                  }
                  className="consulta-textarea"
                  rows={3}
                />
              </div>

              <div className="consulta-field">
                <label className="consulta-label">
                  Observaciones
                </label>
                <textarea
                  value={form.observaciones}
                  onChange={(e) =>
                    actualizarCampo(
                      "observaciones",
                      e.target.value
                    )
                  }
                  className="consulta-textarea"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* ESTUDIOS */}
          <div className="consulta-estudios-card">
            <h2>Estudios complementarios</h2>
            <p className="consulta-estudios-ayuda">
              Podés adjuntar fotos, PDFs, etc. Se guardan como
              enlaces en la historia.
            </p>

            <div className="consulta-estudios-upload-row">
              <label className="consulta-btn-secundario">
                {subiendoEstudios
                  ? "Subiendo..."
                  : "Agregar estudios"}
                <input
                  type="file"
                  multiple
                  onChange={manejarArchivos}
                  style={{ display: "none" }}
                  disabled={subiendoEstudios}
                />
              </label>
            </div>

            {errorEstudios && (
              <p className="consulta-alerta-error">
                {errorEstudios}
              </p>
            )}

            {estudiosUrls.length > 0 && (
              <ul className="consulta-estudios-lista">
                {estudiosUrls.map((url) => (
                  <li
                    key={url}
                    className="consulta-estudios-item"
                  >
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {url}
                    </a>
                    <button
                      type="button"
                      className="consulta-estudios-quitar"
                      onClick={() => quitarEstudio(url)}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* MENSAJES Y BOTÓN FINAL */}
          {mensajeError && (
            <p className="consulta-alerta-error">
              {mensajeError}
            </p>
          )}
          {mensajeOk && (
            <p className="consulta-alerta-ok">
              {mensajeOk}
            </p>
          )}

          <div className="consulta-acciones">
            <button
              type="submit"
              className="consulta-btn-primario grande"
              disabled={guardando}
            >
              {guardando
                ? "Guardando..."
                : "Guardar consulta"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
