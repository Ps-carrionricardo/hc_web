"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import "./reporte.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

type Turno = {
  id: number;
  dni: string;
  nombre: string;
  fecha: string;
  motivo: string | null;
  notas_turno: string | null;
  diagnostico: string | null;
};

export default function ReportePage() {
  const [fecha, setFecha] = useState("");
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [cargando, setCargando] = useState(false);

  const cargarTurnos = async (dia: string) => {
    setCargando(true);

    const { data } = await supabase
      .from("turnos")
      .select("*")
      .eq("fecha", dia)
      .order("id", { ascending: true });

    setTurnos(data || []);
    setCargando(false);
  };

  useEffect(() => {
    if (fecha) cargarTurnos(fecha);
  }, [fecha]);

  // Clasificación
  const atendidos = turnos.filter((t) => t.diagnostico && t.diagnostico.trim() !== "");
  const pendientes = turnos.filter((t) => !t.diagnostico || t.diagnostico.trim() === "");

  // Estadísticas
  const total = turnos.length;
  const pct = total > 0 ? Math.round((atendidos.length / total) * 100) : 0;

  // --------------------------
  // 📄 EXPORTAR A PDF
  // --------------------------
  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Reporte del día ${fecha}`, 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [["Nombre", "DNI", "Atendido"]],
      body: turnos.map((t) => [
        t.nombre,
        t.dni,
        t.diagnostico && t.diagnostico !== "" ? "✔ Atendido" : "Pendiente",
      ]),
    });

    doc.save(`reporte_${fecha}.pdf`);
  };

  // --------------------------
  // 📊 EXPORTAR A EXCEL
  // --------------------------
  const exportarExcel = () => {
    const datos = turnos.map((t) => ({
      Nombre: t.nombre,
      DNI: t.dni,
      Motivo: t.motivo || "",
      Diagnóstico: t.diagnostico || "",
      Estado: t.diagnostico ? "Atendido" : "Pendiente",
    }));

    const hoja = XLSX.utils.json_to_sheet(datos);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Reporte");

    XLSX.writeFile(libro, `reporte_${fecha}.xlsx`);
  };

  return (
    <div className="reporte-wrapper">

      <h1 className="reporte-title">📊 Reporte del Día</h1>

      <label className="label-fecha">Seleccioná una fecha:</label>
      <input
        type="date"
        className="reporte-date"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
      />

      {/* BOTONES PDF + EXCEL */}
      {fecha && (
        <div className="export-buttons">
          <button className="btn-pill pdf" onClick={exportarPDF}>
            📄 PDF
          </button>

          <button className="btn-pill excel" onClick={exportarExcel}>
            📊 Excel
          </button>
        </div>
      )}

      {cargando && <p>Cargando datos...</p>}

      {!fecha && <p className="msg-info">Seleccione una fecha para ver el reporte.</p>}

      {fecha && !cargando && (
        <div className="reporte-contenido">

          {/* ESTADÍSTICAS */}
          <div className="stats-box">
            <p><strong>Total de turnos:</strong> {total}</p>
            <p><strong>Atendidos:</strong> {atendidos.length}</p>
            <p><strong>Pendientes:</strong> {pendientes.length}</p>
            <p><strong>Avance:</strong> {pct}%</p>
          </div>

          {/* ATENDIDOS */}
          <h2 className="subtitulo verde">✔ Atendidos</h2>
          {atendidos.length === 0 && <p>No hay asistentes.</p>}
          {atendidos.map((t) => (
            <div key={t.id} className="reporte-card">
              <strong>{t.nombre}</strong> — DNI {t.dni}
              <p><strong>Diagnóstico:</strong> {t.diagnostico}</p>
            </div>
          ))}

          {/* PENDIENTES */}
          <h2 className="subtitulo rojo">❌ Pendientes</h2>
          {pendientes.length === 0 && <p>No hay pendientes.</p>}
          {pendientes.map((t) => (
            <div key={t.id} className="reporte-card pendiente">
              <strong>{t.nombre}</strong> — DNI {t.dni}
              <p><strong>Motivo:</strong> {t.motivo || "—"}</p>
            </div>
          ))}

        </div>
      )}
    </div>
  );
}
