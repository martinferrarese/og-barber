"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BarberoForm() {
  const [nombre, setNombre] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    await fetch("/api/barberos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre }),
    });
    setNombre("");
    router.refresh();
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
