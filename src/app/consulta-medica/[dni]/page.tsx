"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import ConsultaMedicaModal from "../../../components/ConsultaMedicaModal/ConsultaMedicaModal";

export default function ConsultaMedicaPorDNI() {
  const params = useParams<{ dni: string }>();
  const router = useRouter();
  const dni = params?.dni;

  const [paciente, setPaciente] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(true);

  // Cargar datos del paciente
  useEffect(() => {
    const buscarPaciente = async () => {
      if (!dni) return;

      const { data, error } = await supabase
        .from("padron")
        .select("*")
        .eq("dni", dni)
        .single();

      if (!error && data) setPaciente(data);
      setCargando(false);
    };

    buscarPaciente();
  }, [dni]);

  // 👉 FUNCIÓN guardarConsulta (corregida)
  const guardarConsulta = async (dataFormulario: any) => {
    if (!paciente) return;

    const confirmar = window.confirm(
      "¿Desea guardar esta consulta en la base de datos?"
    );

    if (!confirmar) {
      alert("Operación cancelada.");
      return;
    }

    const motivo =
      dataFormulario.motivoConsulta ||
      dataFormulario.motivo_consulta ||
      dataFormulario.motivo ||
      "";

    const examen =
      dataFormulario.examenFisico ||
      dataFormulario.examen_fisico ||
      "";

    const diagnostico =
      dataFormulario.diagnostico || dataFormulario.dx || "";

    const tratamiento =
      dataFormulario.tratamiento ||
      dataFormulario.indicaciones ||
      "";

    const observaciones =
      dataFormulario.observaciones ||
      dataFormulario.obs ||
      "";

    const ta_sistolica =
      Number(dataFormulario.taSistolica || dataFormulario.ta_sistolica || null);

    const ta_diastolica =
      Number(dataFormulario.taDiastolica || dataFormulario.ta_diastolica || null);

    const peso =
      Number(dataFormulario.peso || null);

    const estudios_urls =
      dataFormulario.estudiosUrls ||
      dataFormulario.estudios_urls ||
      null;

    const { error } = await supabase.from("turnos").insert({
      dni: paciente.dni,
      nombre: paciente.Apellido_y_Nombre,
      fecha: new Date().toISOString().split("T")[0],
      motivo_consulta: motivo,
      examen_fisico: examen,
      diagnostico: diagnostico,
      tratamiento: tratamiento,
      observaciones: observaciones,
      ta_sistolica: ta_sistolica,
      ta_diastolica: ta_diastolica,
      peso: peso,
      estudios_urls: estudios_urls,
    });

    if (error) {
      console.error("Error guardando consulta:", error);
      alert("❌ Error al guardar la consulta. Revise los campos.");
    } else {
      alert("✔ Consulta guardada correctamente.");
      router.push("/dashboard");
    }
  };

  if (cargando) return <p>Cargando...</p>;

  return (
    <>
      <ConsultaMedicaModal
        isOpen={modalAbierto}
        onClose={() => router.push("/dashboard")}
        paciente={paciente}
        onSave={guardarConsulta}
      />
    </>
  );
}
