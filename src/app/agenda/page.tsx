"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "../../lib/supabaseClient";
import "./estilos.css";

type Turno = {
  id: string;
  fechaISO: string;
  hora: string;
  nombre: string;
  dni: string;
  motivo: string;
  notasExtras?: string;
};

type ConsultaMedica = {
  motivoConsulta: string;
  examenFisico: string;
  diagnostico: string;
  tratamiento: string;
  observaciones: string;
  taSistolica?: number | null;
  taDiastolica?: number | null;
  peso?: number | null;
  estudiosUrls: string[];
};

export default function Agenda() {
  const router = useRouter();

  const hoy = new Date();
  const [currentMonth, setCurrentMonth] = useState<Date>(
    new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState<Date>(hoy);

  const [nombre, setNombre] = useState<string>("");
  const [dni, setDni] = useState<string>("");
  const [hora, setHora] = useState<string>("10:00");
  const [motivo, setMotivo] = useState<string>("");
  const [otrosTexto, setOtrosTexto] = useState<string>("");

  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [cargandoTurnos, setCargandoTurnos] = useState(false);
  const [errorTurnos, setErrorTurnos] = useState<string | null>(null);

  const [consultaPorTurno, setConsultaPorTurno] = useState<
    Record<string, ConsultaMedica>
  >({});
  const [turnoEnConsulta, setTurnoEnConsulta] = useState<Turno | null>(null);
  const [consultaForm, setConsultaForm] = useState<ConsultaMedica>({
    motivoConsulta: "",
    examenFisico: "",
    diagnostico: "",
    tratamiento: "",
    observaciones: "",
    taSistolica: undefined,
    taDiastolica: undefined,
    peso: undefined,
    estudiosUrls: [],
  });
  const [subiendoEstudios, setSubiendoEstudios] = useState(false);

  const [paginaTurnos, setPaginaTurnos] = useState<number>(1);
  const PAGE_SIZE = 6;

  useEffect(() => {
    setPaginaTurnos(1);
  }, [selectedDate]);

  const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  const formatearISO = (d: Date) => d.toISOString().split("T")[0];

  const formatearLargo = (d: Date) =>
    d.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const esMismoDia = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const generarCalendario = () => {
    const año = currentMonth.getFullYear();
    const mes = currentMonth.getMonth();
    const primer = new Date(año, mes, 1);
    const ultimo = new Date(año, mes + 1, 0);
    const dias = ultimo.getDate();
    const offset = (primer.getDay() + 6) % 7;

    const matriz: (Date | null)[][] = [];
    let semana: (Date | null)[] = [];

    for (let i = 0; i < offset; i++) semana.push(null);

    for (let d = 1; d <= dias; d++) {
      semana.push(new Date(año, mes, d));
      if (semana.length === 7) {
        matriz.push(semana);
        semana = [];
      }
    }

    if (semana.length) {
      while (semana.length < 7) semana.push(null);
      matriz.push(semana);
    }

    return matriz;
  };

  const calendario = generarCalendario();

  const cambiarMes = (delta: number) => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1)
    );
  };

  // ---------------------------------------------------------
  // 🔍 AUTOCOMPLETAR NOMBRE DESDE PADRÓN AL ESCRIBIR DNI
  // ---------------------------------------------------------
  const buscarEnPadronPorDNI = async (dniIngresado: string) => {
    if (!dniIngresado.trim()) return;

    const { data, error } = await supabase
      .from("padron")
      .select("Apellido_y_Nombre")
      .eq("dni", dniIngresado)
      .maybeSingle();

    if (error) {
      console.error("Error consultando padrón:", error);
      return;
    }

    if (data) {
      setNombre(data.Apellido_y_Nombre);
    } else {
      setNombre("");
    }
  };

  // ---------------------------------------------------------
  // 📥 CARGAR TURNOS DEL DÍA DESDE SUPABASE
  // ---------------------------------------------------------
  useEffect(() => {
    const cargarTurnos = async () => {
      setCargandoTurnos(true);
      setErrorTurnos(null);

      const fechaISO = formatearISO(selectedDate);

      const { data, error } = await supabase
        .from("turnos")
        .select(
          "id, dni, fecha, hora, nombre, motivo, observaciones, creado_en, motivo_consulta, examen_fisico, diagnostico, tratamiento, ta_sistolica, ta_diastolica, peso, estudios_urls"
        )
        .eq("fecha", fechaISO)
        .order("creado_en", { ascending: true });

      setCargandoTurnos(false);

      if (error) {
        console.error("Error cargando turnos:", error);
        setErrorTurnos("No se pudieron cargar los turnos.");
        setTurnos([]);
        setConsultaPorTurno({});
        return;
      }

      const nuevosTurnos: Turno[] = [];
      const nuevasConsultas: Record<string, ConsultaMedica> = {};

      data?.forEach((row: any) => {
        if (row.diagnostico) return;

        const id: string = row.id;
        nuevosTurnos.push({
          id,
          fechaISO: row.fecha,
          hora: row.hora ?? "",
          nombre: row.nombre ?? "",
          dni: row.dni ?? "",
          motivo: row.motivo ?? "",
          notasExtras: row.observaciones ?? "",
        });

        if (
          row.motivo_consulta ||
          row.examen_fisico ||
          row.diagnostico ||
          row.tratamiento ||
          row.observaciones ||
          row.ta_sistolica ||
          row.ta_diastolica ||
          row.peso ||
          (row.estudios_urls && row.estudios_urls.length > 0)
        ) {
          nuevasConsultas[id] = {
            motivoConsulta: row.motivo_consulta ?? "",
            examenFisico: row.examen_fisico ?? "",
            diagnostico: row.diagnostico ?? "",
            tratamiento: row.tratamiento ?? "",
            observaciones: row.observaciones ?? "",
            taSistolica: row.ta_sistolica,
            taDiastolica: row.ta_diastolica,
            peso: row.peso,
            estudiosUrls: row.estudios_urls ?? [],
          };
        }
      });

      setTurnos(nuevosTurnos);
      setConsultaPorTurno(nuevasConsultas);
    };

    cargarTurnos();
  }, [selectedDate]);
  // ---------------------------------------------------------
  // ➕ AGREGAR TURNO (INSERT EN SUPABASE)
  // ---------------------------------------------------------
  const agregarTurno = async () => {
    if (!dni.trim()) {
      alert("Debe ingresar un DNI para buscar datos del padrón.");
      return;
    }

    if (!nombre.trim()) {
      alert("El DNI ingresado no existe en el padrón.");
      return;
    }

    if (!motivo.trim()) {
      alert("Debe seleccionar un motivo.");
      return;
    }

    const fechaISO = formatearISO(selectedDate);

    const { data, error } = await supabase
      .from("turnos")
      .insert({
        dni: dni || null,
        fecha: fechaISO,
        hora: null, // SIN HORA POR TU ELECCIÓN
        nombre,
        motivo,
        observaciones: motivo === "Otros" ? otrosTexto || null : null,
      })
      .select(
        "id, dni, fecha, hora, nombre, motivo, observaciones, creado_en"
      )
      .single();

    if (error) {
      console.error("Error guardando turno:", error);
      alert("Ocurrió un error al guardar el turno.");
      return;
    }

    const nuevo: Turno = {
      id: data.id,
      fechaISO: data.fecha,
      hora: data.hora ?? "",
      nombre: data.nombre ?? "",
      dni: data.dni ?? "",
      motivo: data.motivo ?? "",
      notasExtras: data.observaciones ?? "",
    };

    setTurnos((prev) => [...prev, nuevo]);

    setDni("");
    setNombre("");
    setMotivo("");
    setOtrosTexto("");
  };

  // ---------------------------------------------------------
  // 🗑 BORRAR TURNO (SUPABASE)
  // ---------------------------------------------------------
  const borrarTurno = async (id: string) => {
    setTurnos((prev) => prev.filter((t) => t.id !== id));
    setConsultaPorTurno((prev) => {
      const copia = { ...prev };
      delete copia[id];
      return copia;
    });

    const { error } = await supabase.from("turnos").delete().eq("id", id);

    if (error) {
      console.error("Error al borrar turno:", error);
      alert("No se pudo borrar el turno en la base de datos.");
    }
  };

  // ---------------------------------------------------------
  // ✏ ABRIR Y CERRAR CONSULTA MÉDICA
  // ---------------------------------------------------------
  const abrirConsulta = (turno: Turno) => {
    const existente = consultaPorTurno[turno.id];
    if (existente) {
      setConsultaForm(existente);
    } else {
      setConsultaForm({
        motivoConsulta: "",
        examenFisico: "",
        diagnostico: "",
        tratamiento: "",
        observaciones: "",
        taSistolica: undefined,
        taDiastolica: undefined,
        peso: undefined,
        estudiosUrls: [],
      });
    }
    setTurnoEnConsulta(turno);
  };

  const cerrarConsulta = () => {
    setTurnoEnConsulta(null);
  };

  const guardarConsultaLocal = () => {
    if (!turnoEnConsulta) return;
    setConsultaPorTurno((prev) => ({
      ...prev,
      [turnoEnConsulta.id]: consultaForm,
    }));
    setTurnoEnConsulta(null);
  };

  // ---------------------------------------------------------
  // 📤 SUBIR ESTUDIOS A SUPABASE STORAGE
  // ---------------------------------------------------------
  const manejarSubidaEstudios = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setSubiendoEstudios(true);

    try {
      const nuevasUrls: string[] = [];

      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() || "bin";
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${ext}`;

        const { data, error } = await supabase.storage
          .from("estudios")
          .upload(fileName, file);

        if (error) {
          console.error("Error subiendo estudio:", error);
          continue;
        }

        const { data: publicData } = supabase.storage
          .from("estudios")
          .getPublicUrl(data.path);

        if (publicData?.publicUrl) {
          nuevasUrls.push(publicData.publicUrl);
        }
      }

      setConsultaForm((prev) => ({
        ...prev,
        estudiosUrls: [...prev.estudiosUrls, ...nuevasUrls],
      }));
    } finally {
      setSubiendoEstudios(false);
      e.target.value = "";
    }
  };

  const quitarEstudioDeConsulta = (url: string) => {
    setConsultaForm((prev) => ({
      ...prev,
      estudiosUrls: prev.estudiosUrls.filter((u) => u !== url),
    }));
  };

  // ---------------------------------------------------------
  // ✔ FINALIZAR CONSULTA (UPDATE SUPABASE)
  // ---------------------------------------------------------
  const finalizarConsulta = async (turno: Turno) => {
    const datosConsulta = consultaPorTurno[turno.id];

    if (
      !datosConsulta ||
      !datosConsulta.motivoConsulta.trim() ||
      !datosConsulta.examenFisico.trim() ||
      !datosConsulta.diagnostico.trim() ||
      !datosConsulta.tratamiento.trim()
    ) {
      alert("Completá los campos obligatorios (*) antes de finalizar.");
      return;
    }

    try {
      const { error } = await supabase
        .from("turnos")
        .update({
          motivo_consulta: datosConsulta.motivoConsulta,
          examen_fisico: datosConsulta.examenFisico,
          diagnostico: datosConsulta.diagnostico,
          tratamiento: datosConsulta.tratamiento,
          observaciones: datosConsulta.observaciones || null,
          ta_sistolica: datosConsulta.taSistolica ?? null,
          ta_diastolica: datosConsulta.taDiastolica ?? null,
          peso: datosConsulta.peso ?? null,
          estudios_urls:
            datosConsulta.estudiosUrls.length > 0
              ? datosConsulta.estudiosUrls
              : null,
        })
        .eq("id", turno.id);

      if (error) {
        console.error("Error al finalizar consulta:", error);
        alert("Hubo un problema al guardar la consulta.");
        return;
      }

      alert("Consulta finalizada correctamente.");

      setTurnos((prev) => prev.filter((t) => t.id !== turno.id));
      setConsultaPorTurno((prev) => {
        const copia = { ...prev };
        delete copia[turno.id];
        return copia;
      });
    } catch (error) {
      console.error("Error al finalizar consulta:", error);
      alert("Hubo un problema al guardar la consulta.");
    }
  };
  // ---------------------------------------------------------
  // RENDER DEL COMPONENTE
  // ---------------------------------------------------------
  const turnosDelDia = turnos
    .filter((t) => t.fechaISO === formatearISO(selectedDate))
    .sort((a, b) => a.hora.localeCompare(b.hora));

  const totalPages =
    turnosDelDia.length === 0
      ? 1
      : Math.max(1, Math.ceil(turnosDelDia.length / PAGE_SIZE));

  const paginaSegura = Math.min(paginaTurnos, totalPages);
  const inicio = (paginaSegura - 1) * PAGE_SIZE;
  const turnosPagina = turnosDelDia.slice(inicio, inicio + PAGE_SIZE);

  const irPaginaAnterior = () => {
    setPaginaTurnos((p) => Math.max(1, p - 1));
  };

  const irPaginaSiguiente = () => {
    setPaginaTurnos((p) => Math.min(totalPages, p + 1));
  };

  return (
    <div className="pami-root">
      <div className="pami-shell">
        {/* ENCABEZADO */}
        <header className="pami-topbar header-flex">
          <div className="header-left">
            <Image
              src="/pami.png"
              width={90}
              height={90}
              alt="PAMI"
              className="pami-header-logo"
            />
          </div>

          <h1 className="header-title-center">
            Agenda de Turnos del Dr. Cáceres
          </h1>

          <div className="header-right" />
        </header>

        <main className="pami-main">
          {/* SIDEBAR */}
          <aside className="pami-sidebar">
            <button
              className="sidebar-btn full-btn small-label"
              onClick={() => router.back()}
            >
              🔙 Volver
            </button>

            <button
              className="sidebar-btn full-btn small-label"
              onClick={() => router.push("/padron")}
            >
              📋 Padrón
            </button>
          </aside>

          {/* CALENDARIO */}
          <section className="pami-calendar-card">
            <div className="pami-calendar-header">
              <button className="nav-month-btn" onClick={() => cambiarMes(-1)}>
                ‹
              </button>
              <h2>
                {currentMonth.toLocaleDateString("es-AR", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <button className="nav-month-btn" onClick={() => cambiarMes(1)}>
                ›
              </button>
            </div>

            <div className="pami-weekdays">
              {diasSemana.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            <div className="pami-calendar-grid">
              {calendario.map((fila, fi) => (
                <div key={fi} className="pami-week-row">
                  {fila.map((dia, i) =>
                    dia ? (
                      <button
                        key={i}
                        className={`pami-day ${
                          esMismoDia(dia, selectedDate) ? "selected" : ""
                        }`}
                        onClick={() => setSelectedDate(dia)}
                      >
                        <span className="day-number">{dia.getDate()}</span>
                      </button>
                    ) : (
                      <div key={i} className="pami-day empty" />
                    )
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* FORMULARIO NUEVO TURNO */}
          <section className="pami-form-card">
            <h3>Nuevo turno</h3>

            <label className="pami-field">
              <span>DNI</span>
              <input
                value={dni}
                onChange={(e) => {
                  setDni(e.target.value);
                  buscarEnPadronPorDNI(e.target.value);
                }}
              />
            </label>

            <label className="pami-field">
              <span>Nombre y Apellido</span>
              <input value={nombre} readOnly />
            </label>

            <div className="pami-field-row">
              <label className="pami-field">
                <span>Fecha</span>
                <input readOnly value={formatearLargo(selectedDate)} />
              </label>

              <label className="pami-field">
                <span>Hora (solo visual)</span>
                <input
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                />
              </label>
            </div>

            <label className="pami-field">
              <span>Motivo de consulta</span>

              <select
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="pami-select"
              >
                <option value="" hidden></option>
                <option value="Control">Control</option>
                <option value="Recetas">Recetas</option>
                <option value="Derivaciones">Derivaciones</option>
                <option value="Otros">Otros</option>
              </select>

              {motivo === "Otros" && (
                <textarea
                  className="otros-texto"
                  placeholder="Especifique el motivo"
                  value={otrosTexto}
                  onChange={(e) => setOtrosTexto(e.target.value)}
                />
              )}
            </label>

            <button className="pami-primary-btn" onClick={agregarTurno}>
              Agregar turno
            </button>

            {cargandoTurnos && (
              <p className="small-label" style={{ marginTop: 8 }}>
                Cargando turnos...
              </p>
            )}
            {errorTurnos && (
              <p className="small-label" style={{ marginTop: 8, color: "red" }}>
                {errorTurnos}
              </p>
            )}
          </section>

          {/* TURNOS DEL DÍA — 2 COLUMNAS, PAGINADOS */}
          <section className="pami-daylist-card">
            <div className="daylist-header">
              <h3>Turnos del Día</h3>
              <span>{formatearLargo(selectedDate)}</span>
            </div>

            <div className="daylist-grid-2col">
              {turnosPagina.map((t) => {
                const tieneConsulta = !!consultaPorTurno[t.id];

                return (
                  <article key={t.id} className="daylist-ficha">
                    <div className="ficha-icon">
                      <div className="paciente-icon" />
                    </div>

                    <div className="ficha-info">
                      <div className="ficha-hora">{t.hora}</div>
                      <div className="ficha-nombre">{t.nombre}</div>
                      {t.dni && <div className="ficha-dni">DNI: {t.dni}</div>}
                      <div className="ficha-motivo">Motivo: {t.motivo}</div>
                      {t.motivo === "Otros" && t.notasExtras && (
                        <div className="ficha-otros">{t.notasExtras}</div>
                      )}
                    </div>

                    <div className="ficha-actions">
                      <button
                        type="button"
                        className={`ficha-consulta-btn ${
                          tieneConsulta ? "completa" : ""
                        }`}
                        onClick={() => abrirConsulta(t)}
                        title="Consulta médica"
                      >
                        📝
                      </button>

                      <button
                        type="button"
                        className="ficha-fin-btn"
                        onClick={() => finalizarConsulta(t)}
                        title="Fin de consulta"
                      >
                        ✅
                      </button>

                      <button
                        type="button"
                        className="ficha-delete-btn"
                        onClick={() => borrarTurno(t.id)}
                        title="Borrar turno"
                      >
                        ✖
                      </button>
                    </div>
                  </article>
                );
              })}

              {turnosPagina.length === 0 && !cargandoTurnos && (
                <p style={{ fontSize: "0.9rem", color: "#555" }}>
                  No hay turnos cargados para este día.
                </p>
              )}
            </div>

            {turnosDelDia.length > PAGE_SIZE && (
              <div className="daylist-pagination">
                <button
                  onClick={irPaginaAnterior}
                  disabled={paginaSegura === 1}
                >
                  ⬅ Anterior
                </button>
                <span>
                  Página {paginaSegura} de {totalPages}
                </span>
                <button
                  onClick={irPaginaSiguiente}
                  disabled={paginaSegura === totalPages}
                >
                  Siguiente ➜
                </button>
              </div>
            )}
          </section>
        </main>

        {/* MODAL DE CONSULTA MÉDICA */}
        {turnoEnConsulta && (
          <div className="consulta-modal-backdrop">
            <div className="consulta-modal">
              <h2>Consulta médica</h2>
              <p className="consulta-subtitle">
                {turnoEnConsulta.nombre} — {turnoEnConsulta.hora}
              </p>

              <div className="consulta-top-row">
                <div className="campo-ta">
                  <span className="campo-label">TA</span>
                  <input
                    type="number"
                    placeholder="Sist."
                    value={consultaForm.taSistolica ?? ""}
                    onChange={(e) =>
                      setConsultaForm((prev) => ({
                        ...prev,
                        taSistolica:
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                      }))
                    }
                  />
                  <span className="slash">/</span>
                  <input
                    type="number"
                    placeholder="Diast."
                    value={consultaForm.taDiastolica ?? ""}
                    onChange={(e) =>
                      setConsultaForm((prev) => ({
                        ...prev,
                        taDiastolica:
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                      }))
                    }
                  />
                  <span className="unidad">mmHg</span>
                </div>

                <div className="campo-peso">
                  <span className="campo-label">Peso</span>
                  <input
                    type="number"
                    placeholder="Kg"
                    value={consultaForm.peso ?? ""}
                    onChange={(e) =>
                      setConsultaForm((prev) => ({
                        ...prev,
                        peso:
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                      }))
                    }
                  />
                  <span className="unidad">Kg</span>
                </div>
              </div>

              <div className="consulta-fields">
                <label className="consulta-bloque">
                  <div className="bloque-label">* Motivo de consulta</div>
                  <textarea
                    value={consultaForm.motivoConsulta}
                    onChange={(e) =>
                      setConsultaForm((prev) => ({
                        ...prev,
                        motivoConsulta: e.target.value,
                      }))
                    }
                  />
                </label>

                <label className="consulta-bloque">
                  <div className="bloque-label">
                    * Datos relevantes del examen físico
                  </div>
                  <textarea
                    value={consultaForm.examenFisico}
                    onChange={(e) =>
                      setConsultaForm((prev) => ({
                        ...prev,
                        examenFisico: e.target.value,
                      }))
                    }
                  />
                </label>

                <label className="consulta-bloque">
                  <div className="bloque-label">* Diagnóstico</div>
                  <textarea
                    value={consultaForm.diagnostico}
                    onChange={(e) =>
                      setConsultaForm((prev) => ({
                        ...prev,
                        diagnostico: e.target.value,
                      }))
                    }
                  />
                </label>

                <label className="consulta-bloque">
                  <div className="bloque-label">
                    * Tratamiento / indicaciones
                  </div>
                  <textarea
                    value={consultaForm.tratamiento}
                    onChange={(e) =>
                      setConsultaForm((prev) => ({
                        ...prev,
                        tratamiento: e.target.value,
                      }))
                    }
                  />
                </label>

                <label className="consulta-bloque">
                  <div className="bloque-label">Observaciones</div>
                  <textarea
                    value={consultaForm.observaciones}
                    onChange={(e) =>
                      setConsultaForm((prev) => ({
                        ...prev,
                        observaciones: e.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <div className="consulta-estudios">
                <label className="estudios-btn">
                  {subiendoEstudios
                    ? "Subiendo estudios..."
                    : "Agregar estudios complementarios"}
                  <input
                    type="file"
                    multiple
                    onChange={manejarSubidaEstudios}
                    style={{ display: "none" }}
                    disabled={subiendoEstudios}
                  />
                </label>
                <span className="estudios-help">
                  Podés adjuntar fotos o PDFs de estudios. Se guardan en
                  Supabase Storage.
                </span>
              </div>

              {consultaForm.estudiosUrls.length > 0 && (
                <ul className="consulta-estudios-lista">
                  {consultaForm.estudiosUrls.map((url) => (
                    <li key={url} className="consulta-estudios-item">
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
                        onClick={() => quitarEstudioDeConsulta(url)}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <p className="consulta-aviso">
                La información consignada reviste carácter de declaración
                jurada.
              </p>

              <div className="consulta-actions">
                <button type="button" onClick={cerrarConsulta}>
                  Cerrar
                </button>
                <button
                  type="button"
                  className="guardar-btn"
                  onClick={guardarConsultaLocal}
                >
                  Guardar consulta
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
