"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteRegistroDiaButton({ fecha }: { fecha: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (loading) return;
    
    // Confirmación antes de eliminar
    const fechaFormateada = new Date(fecha).toLocaleDateString("es-AR", {
      timeZone: "UTC",
    });
    if (!confirm(`¿Estás seguro de que quieres eliminar el registro del día ${fechaFormateada}?`)) {
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await fetch("/api/registros-dia", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fecha }),
      });
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Error al eliminar registro");
      }
      
      router.refresh();
      setTimeout(() => setLoading(false), 300);
    } catch (error) {
      console.error("Error al eliminar registro:", error);
      setLoading(false); // Restaurar estado si falla
      
      // Manejar errores de red
      if (error instanceof TypeError && error.message.includes("fetch")) {
        alert("Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.");
        return;
      }
      
      alert(error instanceof Error ? error.message : "Error al eliminar registro. Por favor, intenta nuevamente.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className={`text-red-600 text-xs ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {loading ? "Eliminando..." : "Eliminar día"}
    </button>
  );
}
