"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BarberoForm() {
  const [nombre, setNombre] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    
    try {
      const res = await fetch("/api/barberos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Error al agregar barbero");
      }
      
      setNombre("");
      router.refresh();
    } catch (error) {
      console.error("Error al agregar barbero:", error);
      
      // Manejar errores de red
      if (error instanceof TypeError && error.message.includes("fetch")) {
        alert("Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.");
        return;
      }
      
      alert(error instanceof Error ? error.message : "Error al agregar barbero. Por favor, intenta nuevamente.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-start">
      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nuevo barbero"
        className="border rounded px-3 py-2 flex-1"
        required
      />
      <button
        type="submit"
        className="btn btn-primary"
      >
        Agregar
      </button>
    </form>
  );
}
