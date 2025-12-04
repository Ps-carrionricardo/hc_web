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

      if (!error && data) {
        setPaciente(data);
      }

      setCargando(false);
    };

    buscarPaciente();
  }, [dni]);

  // Función que guarda en tabla turnos
  const guardarConsulta = async (dataFormulario: any) => {
    if (!paciente) return;

    const { error } = await supabase.from("turnos").insert({
      dni: paciente.dni,
      nombre: paciente.Apellido_y_Nombre,
      fecha: new Date().toISOString().split("T")[0],
      motivo_consulta: dataFormulario.motivoConsulta,
      examen_fisico: dataFormulario.examenFisico,
      diagnostico: dataFormulario.diagnostico,
      tratamiento: dataFormulario.tratamiento,
      observaciones: dataFormulario.observaciones,
      ta_sistolica: dataFormulario.taSistolica,
      ta_diastolica: dataFormulario.taDiastolica,
      peso: dataFormulario.peso,
      estudios_urls: dataFormulario.estudiosUrls || null,
    });

    if (error) {
      console.error("Error guardando consulta:", error);
      alert("❌ Error al guardar la consulta.");
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
