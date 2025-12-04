"use client";

import { useState, useRef, ChangeEvent } from "react";
import "./ConsultaMedicaModal.css";

type PacienteMini = {
  dni: string;
  Apellido_y_Nombre: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  paciente: PacienteMini;
  onSave: (data: any) => void;
};

export default function ConsultaMedicaModal({
  isOpen,
  onClose,
  paciente,
  onSave,
}: Props) {
  if (!isOpen) return null;

  const [sistolica, setSistolica] = useState("");
  const [diastolica, setDiastolica] = useState("");
  const [peso, setPeso] = useState("");

  const [motivo, setMotivo] = useState("");
  const [examen, setExamen] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [tratamiento, setTratamiento] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const [estudios, setEstudios] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // refs para salto automático en TA
  const sistRef = useRef<HTMLInputElement | null>(null);
  const diastRef = useRef<HTMLInputElement | null>(null);
  const pesoRef = useRef<HTMLInputElement | null>(null);

  const handleSistolica = (e: ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 3) v = v.slice(0, 3);
    setSistolica(v);
    if (v.length === 3) {
      diastRef.current?.focus();
    }
  };

  const handleDiastolica = (e: ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 2) v = v.slice(0, 2);
    setDiastolica(v);
    if (v.length === 2) {
      pesoRef.current?.focus();
    }
  };

  const handlePeso = (e: ChangeEvent<HTMLInputElement>) => {
    setPeso(e.target.value);
  };

  const handleEstudios = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setEstudios(files);
  };

  const guardar = () => {
    onSave({
      dni: paciente.dni,
      nombre: paciente.Apellido_y_Nombre,
      sistolica,
      diastolica,
      peso,
      motivo,
      examen,
      diagnostico,
      tratamiento,
      observaciones,
      estudios,
    });
  };

  return (
    <div className="consulta-backdrop">
      <div className="consulta-modal">
        <h2 className="consulta-title">Consulta médica</h2>
        <div className="consulta-subtitle">
          {paciente.Apellido_y_Nombre} — {paciente.dni}
        </div>

        {/* TA / PESO */}
        <div className="consulta-row-top">
          <div className="top-label active">TA</div>

          <input
            ref={sistRef}
            type="text"
            className="ta-input"
            placeholder="Sist."
            value={sistolica}
            onChange={handleSistolica}
            maxLength={3}
          />

          <span className="slash">/</span>

          <input
            ref={diastRef}
            type="text"
            className="ta-input"
            placeholder="Diast."
            value={diastolica}
            onChange={handleDiastolica}
            maxLength={2}
          />

          <span className="unidad">mmHg</span>

          <div className="top-label peso-btn">Peso</div>

          <input
            ref={pesoRef}
            type="text"
            className="peso-input"
            placeholder="Kg"
            value={peso}
            onChange={handlePeso}
          />

          <span className="unidad">Kg</span>
        </div>

        {/* CAMPOS EN DOS COLUMNAS (label al costado) */}
        <div className="consulta-field-row">
          <div className="consulta-label-col">
            * Motivo de consulta
          </div>
          <div className="consulta-input-col">
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
          </div>
        </div>

        <div className="consulta-field-row">
          <div className="consulta-label-col">
            * Datos relevantes del examen físico
          </div>
          <div className="consulta-input-col">
            <textarea
              value={examen}
              onChange={(e) => setExamen(e.target.value)}
            />
          </div>
        </div>

        <div className="consulta-field-row">
          <div className="consulta-label-col">
            * Diagnóstico
          </div>
          <div className="consulta-input-col">
            <textarea
              value={diagnostico}
              onChange={(e) => setDiagnostico(e.target.value)}
            />
          </div>
        </div>

        <div className="consulta-field-row">
          <div className="consulta-label-col">
            * Tratamiento / indicaciones
          </div>
          <div className="consulta-input-col">
            <textarea
              value={tratamiento}
              onChange={(e) => setTratamiento(e.target.value)}
            />
          </div>
        </div>

        <div className="consulta-field-row">
          <div className="consulta-label-col">
            Observaciones
          </div>
          <div className="consulta-input-col">
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </div>
        </div>

        {/* BOTÓN ESTUDIOS */}
        <button
          type="button"
          className="consulta-add"
          onClick={() => inputRef.current?.click()}
        >
          Agregar estudios complementarios
        </button>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,application/pdf"
          style={{ display: "none" }}
          onChange={handleEstudios}
        />

        {estudios.length > 0 && (
          <ul className="consulta-estudios">
            {estudios.map((f, i) => (
              <li key={i}>{f.name}</li>
            ))}
          </ul>
        )}

        <p className="consulta-nota">
          Podés adjuntar fotos o PDFs de estudios. Se guardan en Supabase
          Storage.
          <br />
          La información consignada reviste carácter de declaración jurada.
        </p>

        <div className="consulta-footer">
          <button className="btn-cerrar" onClick={onClose}>
            Cerrar
          </button>
          <button className="btn-guardar" onClick={guardar}>
            Guardar consulta
          </button>
        </div>
      </div>
    </div>
  );
}
