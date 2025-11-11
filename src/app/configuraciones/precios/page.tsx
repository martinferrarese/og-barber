"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PRECIOS_DEFAULT, type Precios } from "@/utils/preciosFromDB";

export default function PreciosPage() {
  const router = useRouter();
  const [precios, setPrecios] = useState<Precios>(PRECIOS_DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/precios")
      .then((res) => res.json())
      .then((data: Precios) => {
        setPrecios(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/precios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(precios),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al guardar los precios");
      }

      setMessage({ type: "success", text: "Precios guardados correctamente" });
      setTimeout(() => {
        router.push("/configuraciones");
      }, 1500);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Error al guardar los precios",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mb-4"></div>
        <p className="text-gray-400">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Ajustar precios</h1>
        
        {message && (
          <div
            className={`mb-4 p-3 rounded ${
              message.type === "success"
                ? "bg-green-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="corte" className="font-medium">
              Precio de corte
            </label>
            <input
              type="number"
              id="corte"
              value={precios.corte}
              onChange={(e) =>
                setPrecios({ ...precios, corte: parseInt(e.target.value) || 0 })
              }
              className="border rounded px-3 py-2 bg-transparent"
              min="0"
              step="100"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="corteYBarba" className="font-medium">
              Precio de corte y barba
            </label>
            <input
              type="number"
              id="corteYBarba"
              value={precios.corteYBarba}
              onChange={(e) =>
                setPrecios({
                  ...precios,
                  corteYBarba: parseInt(e.target.value) || 0,
                })
              }
              className="border rounded px-3 py-2 bg-transparent"
              min="0"
              step="100"
              required
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/configuraciones")}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

