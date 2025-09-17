"use client";
import { useState } from "react";
import RegistroCortesForm from "@/components/RegistroCortesForm";
import type { RegistroCortes, RegistroCortesDia } from "@/types/registroCortes";
import { useRouter } from "next/navigation";

export default function RegistroDiaForm() {
  const router = useRouter();
  // Fecha seleccionada para el registro del día. Por defecto, hoy.
  const todayDefault = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const [fechaDia, setFechaDia] = useState<string>(todayDefault);

  const [registros, setRegistros] = useState<RegistroCortes[]>([]);
  const [mostrandoFormulario, setMostrandoFormulario] = useState(true);

  function handleAgregarBarbero(rc: RegistroCortes) {
    setRegistros((prev) => [...prev, rc]);
    // volver a mostrar formulario para otro barbero
    setMostrandoFormulario(true);
  }

  function handleCerrarDia() {
    const payload: RegistroCortesDia = {
      fecha: fechaDia,
      barberos: registros,
    };
    fetch("/api/registros-dia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(() => {
        // Redirigir a la pantalla principal con la fecha como query param para mostrar un toast
        router.push(`/?diaCargada=${encodeURIComponent(fechaDia)}`);
      })
      .catch(console.error);
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto p-6">
      {/* Selector de fecha del día a registrar */}
      <div className="flex flex-col gap-1 max-w-xs">
        <label htmlFor="fecha-dia" className="font-medium">
          Fecha del día
        </label>
        {registros.length === 0 ? (
          <input
            type="date"
            id="fecha-dia"
            value={fechaDia}
            onChange={(e) => setFechaDia(e.target.value)}
            className="border rounded px-3 py-2"
          />
        ) : (
          <div className="flex flex-col gap-1">
            <span className="select-none font-medium text-foreground">
              {fechaDia}
            </span>
            <small className="text-xs text-gray-600 dark:text-gray-400">
              Fecha bloqueada tras agregar barberos.
            </small>
          </div>
        )}
      </div>

      <h1 className="text-2xl font-bold">Registro de cortes del día {fechaDia}</h1>

      {mostrandoFormulario && (
        <RegistroCortesForm
          fechaFija={fechaDia}
          onContinue={(rc) => {
            handleAgregarBarbero(rc);
            setMostrandoFormulario(false); // ocultamos hasta que usuario decida agregar otro
          }}
        />
      )}

      {registros.length > 0 && (
        <section className="border-t pt-4">
          <h2 className="text-lg font-semibold mb-2">Barberos cargados</h2>
          <ul className="space-y-2 text-sm">
            {registros.map((r, idx) => (
              <li key={idx} className="border p-3 rounded">
                <span className="font-medium">{r.barbero}</span> – {r.servicios.reduce((acc, s) => acc + s.efectivo + s.mercado_pago, 0)} servicios
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex gap-4 mt-4">
        <button
          className="bg-foreground text-background px-4 py-2 rounded hover:opacity-90"
          onClick={() => setMostrandoFormulario(true)}
        >
          Agregar otro barbero
        </button>
        <button
          disabled={registros.length === 0}
          onClick={handleCerrarDia}
          className={`bg-green-600 text-white px-4 py-2 rounded hover:opacity-90 ${registros.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Cerrar día
        </button>
      </div>
    </div>
  );
}
