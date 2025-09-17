"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { RegistroCortes } from "@/types/registroCortes";

interface Props {
  /** Callback cuando el usuario confirma la selección completa */
  onContinue?: (data: RegistroCortes) => void;
  /** Si se pasa, el campo fecha queda fijo y oculto */
  fechaFija?: string;
}

export default function RegistroCortesForm({ onContinue, fechaFija }: Props) {
  const router = useRouter();
  const today = fechaFija ?? new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const [barberos, setBarberos] = useState<string[]>([]);
  const [formData, setFormData] = useState<{ fecha: string; barbero: string }>(
    {
      fecha: today,
      barbero: "",
    },
  );

  const canContinue = barberos.length > 0 && formData.barbero !== "";

  useEffect(() => {
    fetch("/api/barberos")
      .then((res) => res.json())
      .then(setBarberos)
      .catch(console.error);
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // Paso interno: 1 = seleccionar fecha/barbero, 2 = ingresar servicios
  const [paso, setPaso] = useState<1 | 2>(1);

  // Estado para cantidades de servicios
  const [servicios, setServicios] = useState({
    corte: { efectivo: 0, mercado_pago: 0 },
    corte_con_barba: { efectivo: 0, mercado_pago: 0 },
  });

  function handleServiciosChange(
    tipo: "corte" | "corte_con_barba",
    pago: "efectivo" | "mercado_pago",
    value: number,
  ) {
    setServicios((prev) => ({
      ...prev,
      [tipo]: {
        ...prev[tipo],
        [pago]: value,
      },
    }));
  }

  function handlePaso1Submit(e: React.FormEvent) {
    e.preventDefault();
    if (canContinue) setPaso(2);
  }

  function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      fecha: formData.fecha,
      barbero: formData.barbero,
      servicios: [
        { tipo: "corte" as const, ...servicios.corte },
        { tipo: "corte_con_barba" as const, ...servicios.corte_con_barba },
      ],
    };
    if (onContinue) {
      onContinue(payload);
    } else {
      // TODO: endpoint /api/registro-cortes
      fetch("/api/registro-cortes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(() => router.refresh())
        .catch(console.error);
    }
  }

  const PRECIOS = { corte: 11000, corte_con_barba: 12000 } as const;

  const efectivoTotal =
    servicios.corte.efectivo * PRECIOS.corte +
    servicios.corte_con_barba.efectivo * PRECIOS.corte_con_barba;
  const mpTotal =
    servicios.corte.mercado_pago * PRECIOS.corte +
    servicios.corte_con_barba.mercado_pago * PRECIOS.corte_con_barba;
  const totalServicios = efectivoTotal + mpTotal;

  if (paso === 1) {
    return (
      <form
        onSubmit={handlePaso1Submit}
        className="flex flex-col gap-4 max-w-sm w-full mx-auto"
      >
        {!fechaFija && (
          <div className="flex flex-col gap-1">
            <label className="font-medium" htmlFor="fecha">
              Fecha
            </label>
            <input
              type="date"
              id="fecha"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              className="border rounded px-3 py-2"
            />
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="font-medium" htmlFor="barbero">
            Barbero
          </label>
          {barberos.length === 0 ? (
            <p className="text-sm text-gray-500">No hay barberos. Agrega uno primero.</p>
          ) : (
            <select
              id="barbero"
              name="barbero"
              value={formData.barbero}
              onChange={handleChange}
              required
              className="border rounded px-3 py-2"
            >
              <option value="" disabled>
                Selecciona un barbero
              </option>
              {barberos.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          type="submit"
          disabled={!canContinue}
          className={`bg-foreground text-background py-2 px-4 rounded hover:opacity-90 ${!canContinue ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Continuar
        </button>
      </form>
    );
  }

  // Paso 2
  return (
    <form
      onSubmit={handleGuardar}
      className="flex flex-col gap-4 max-w-sm w-full mx-auto"
    >
      <h2 className="text-lg font-semibold">Servicios realizados</h2>
      {(["corte", "corte_con_barba"] as const).map((tipo) => (
        <div key={tipo} className="border p-3 rounded">
          <h3 className="font-medium mb-2">
            {tipo === "corte" ? "Corte" : "Corte con barba"}
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {(["efectivo", "mercado_pago"] as const).map((pago) => (
              <label key={pago} className="flex flex-col gap-1">
                <span className="capitalize">
                  {pago === "efectivo" ? "Efectivo" : "Mercado Pago"}
                </span>
                <input
                  type="number"
                  min={0}
                  value={servicios[tipo][pago]}
                  onChange={(e) =>
                    handleServiciosChange(
                      tipo,
                      pago,
                      parseInt(e.target.value, 10) || 0,
                    )
                  }
                  className="border rounded px-2 py-1"
                />
              </label>
            ))}
          </div>
        </div>
      ))}

      {/* Resumen de totales */}
      <div className="border-t pt-4 text-sm">
        <h3 className="font-medium mb-2">Resumen</h3>
        <p>Efectivo: ${efectivoTotal.toLocaleString("es-AR")}</p>
        <p>Mercado Pago: ${mpTotal.toLocaleString("es-AR")}</p>
        <p className="font-semibold">Total: ${totalServicios.toLocaleString("es-AR")}</p>
      </div>

      <button
        type="submit"
        className="bg-foreground text-background py-2 px-4 rounded hover:opacity-90"
      >
        Guardar registros
      </button>
    </form>
  );
}
