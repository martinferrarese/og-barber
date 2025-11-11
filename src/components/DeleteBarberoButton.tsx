"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteBarberoButton({ nombre }: { nombre: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (loading) return;
    
    // Confirmación antes de eliminar
    if (!confirm(`¿Estás seguro de que quieres eliminar a ${nombre}?`)) {
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await fetch("/api/barberos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Error al eliminar barbero");
      }
      
      router.refresh();
      // Pequeña pausa para evitar parpadeo; opcional
      setTimeout(() => setLoading(false), 300);
    } catch (error) {
      console.error("Error al eliminar barbero:", error);
      setLoading(false); // Restaurar estado si falla
      
      // Manejar errores de red
      if (error instanceof TypeError && error.message.includes("fetch")) {
        alert("Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.");
        return;
      }
      
      alert(error instanceof Error ? error.message : "Error al eliminar barbero. Por favor, intenta nuevamente.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className={`text-red-600 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {loading ? "Eliminando..." : "Eliminar"}
    </button>
  );
}
