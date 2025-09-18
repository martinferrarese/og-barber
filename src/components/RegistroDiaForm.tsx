"use client";
import { useState, useEffect } from "react";
import RegistroCortesForm from "@/components/RegistroCortesForm";
import type { RegistroCortes, RegistroCortesDia } from "@/types/registroCortes";
import { useRouter } from "next/navigation";

export default function RegistroDiaForm({ initialFecha }: { initialFecha?: string } = {}) {
  const router = useRouter();
  const todayDefault = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const [fechaDia, setFechaDia] = useState<string>(initialFecha ?? todayDefault);

  const [registros, setRegistros] = useState<RegistroCortes[]>([]);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [fase, setFase] = useState<'seleccion' | 'form'>(initialFecha ? 'form' : 'seleccion');

  const [mostrandoFormulario, setMostrandoFormulario] = useState(true);

  async function cargarDatosDia(fecha: string) {
    try {
      const res = await fetch("/api/registros-dia");
      const data: { fecha: string; barberos: RegistroCortes[] }[] = await res.json();
      const existente = data.find((d) => d.fecha === fecha);
      if (existente) {
        setRegistros(existente.barberos);
      }
      setFase('form');
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSeleccionFecha() {
    await cargarDatosDia(fechaDia);
  }

  useEffect(() => {
    if (initialFecha) {
      cargarDatosDia(initialFecha);
    }
     
  }, [initialFecha]);

  function handleAgregarBarbero(rc: RegistroCortes) {
    setRegistros((prev) => [...prev, rc]);
    // volver a mostrar formulario para otro barbero
    setMostrandoFormulario(true);
  }

  function handleActualizarBarbero(rc: RegistroCortes) {
    if (editingIndex === null) return;
    setRegistros((prev) =>
      prev.map((item, idx) => (idx === editingIndex ? rc : item)),
    );
    setEditingIndex(null);
    setMostrandoFormulario(false);
  }

  function handleEliminarBarbero(index: number) {
    setRegistros((prev) => prev.filter((_, i) => i !== index));
    if (editingIndex !== null && editingIndex === index) {
      setEditingIndex(null);
      setMostrandoFormulario(false);
    }
    // Mostrar formulario para agregar uno nuevo
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

  // Eliminado fase mensaje; siempre se permite editar

  if (fase === 'seleccion') {
    return (
      <div className="flex flex-col gap-6 max-w-xl mx-auto p-6">
        <div className="flex flex-col gap-1 max-w-xs">
          <label htmlFor="fecha-dia" className="font-medium">
            Fecha del día
          </label>
          <input
            type="date"
            id="fecha-dia"
            value={fechaDia}
            onChange={(e) => setFechaDia(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>
        <button
          className="btn btn-primary max-w-xs"
          onClick={handleSeleccionFecha}
        >
          Seleccionar fecha
        </button>
      </div>
    );
  }

  // fase === 'form'
  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto p-6">
      {/* Selector de fecha del día a registrar */}
      <div className="flex flex-col gap-1 max-w-xs">
        <label htmlFor="fecha-dia" className="font-medium">
          Fecha del día
        </label>
        <input
          type="date"
          id="fecha-dia"
          value={fechaDia}
          disabled
          className="border rounded px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
        />
      </div>

      <h1 className="text-2xl font-bold">Registro de cortes del día {fechaDia}</h1>

      {mostrandoFormulario && !editingIndex && (
        <RegistroCortesForm
          fechaFija={fechaDia}
          barberosExcluidos={registros.map((r) => r.barbero)}
          onContinue={(rc) => {
            handleAgregarBarbero(rc);
            setMostrandoFormulario(false); // ocultamos hasta que usuario decida agregar otro
          }}
        />
      )}

      {editingIndex !== null && (
        <RegistroCortesForm
          initialData={registros[editingIndex]}
          fechaFija={fechaDia}
          barberosExcluidos={registros
            .filter((_, idx) => idx !== editingIndex)
            .map((r) => r.barbero)}
          onContinue={handleActualizarBarbero}
        />
      )}

      {registros.length > 0 && (
        <section className="border-t pt-4">
          <h2 className="text-lg font-semibold mb-2">Barberos cargados</h2>
          <ul className="space-y-2 text-sm">
            {registros.map((r, idx) => (
              <li key={idx} className="border p-3 rounded flex justify-between items-center">
                <span>
                  <span className="font-medium">{r.barbero}</span> – {r.servicios.reduce((acc, s) => acc + s.efectivo + s.mercado_pago, 0)} servicios
                </span>
                <div className="flex gap-2">
                  <button
                    className="btn btn-secondary text-xs"
                    onClick={() => {
                      setEditingIndex(idx);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    className="text-red-600 text-xs"
                    onClick={() => handleEliminarBarbero(idx)}
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex gap-4 mt-4">
        {editingIndex === null && registros.length > 0 && (
          <button
            className="btn btn-primary"
            onClick={() => setMostrandoFormulario(true)}
          >
            Agregar otro barbero
          </button>
        )}
        {editingIndex === null && registros.length > 0 && (
          <button
            onClick={handleCerrarDia}
            className="btn btn-primary bg-green-600 text-white"
          >
            Cerrar día
          </button>
        )}
      </div>
    </div>
  );
}