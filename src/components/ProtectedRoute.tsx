"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  children: ReactNode;
  allowedRoles?: string[]; // si no se pasa, permite cualquier usuario logueado
  redirectTo?: string; // ruta si no autorizado (por defecto: /login)
};

export default function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/login",
}: Props) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) {
        router.replace(redirectTo);
        return;
      }
      const user = JSON.parse(raw);
      if (!user?.username) {
        router.replace(redirectTo);
        return;
      }

      if (allowedRoles && allowedRoles.length > 0) {
        if (!user.role || !allowedRoles.includes(user.role)) {
          // no autorizado
          router.replace("/dashboard"); // o alguna página "no autorizado"
          return;
        }
      }

      setChecked(true);
    } catch (err) {
      router.replace(redirectTo);
    }
  }, [allowedRoles, redirectTo, router]);

  // Mientras validamos, no renderizamos nada (evita parpadeo)
  if (!checked) return null;

  return <>{children}</>;
}
