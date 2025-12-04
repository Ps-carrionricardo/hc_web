"use client";

import { useState } from "react";
import ConsultaMedicaModal from "@/components/ConsultaMedicaModal/ConsultaMedicaModal";

export default function TestModalPage() {
  const [open, setOpen] = useState(true);

  const pacienteDemo = {
    dni: "12345678",
    Apellido_y_Nombre: "Paciente de prueba"
  };

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ color: "white" }}>Vista previa del Modal</h1>

      <ConsultaMedicaModal
        isOpen={open}
        onClose={() => setOpen(false)}
        paciente={pacienteDemo}
        onSave={(data) => console.log(data)}
      />
    </div>
  );
}
