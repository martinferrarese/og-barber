"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteRegistroDiaButton({ fecha }: { fecha: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (loading) return;
    setLoading(true);
    await fetch("/api/registros-dia", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fecha }),
    });
    router.refresh();
    setTimeout(() => setLoading(false), 300);
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
