"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteBarberoButton({ nombre }: { nombre: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (loading) return;
    setLoading(true);
    await fetch("/api/barberos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre }),
    });
    router.refresh();
    // Pequeña pausa para evitar parpadeo; opcional
    setTimeout(() => setLoading(false), 300);
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
