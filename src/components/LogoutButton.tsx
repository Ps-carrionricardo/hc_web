"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white p-2 rounded"
    >
      Cerrar sesión
    </button>
  );
}
