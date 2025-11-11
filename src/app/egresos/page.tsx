"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DatePicker, { registerLocale } from "react-datepicker";
import { es } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import type { Egresos } from "@/types/registroCortes";
import { crearFechaLocal, fechaToString } from "@/utils/fechas";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useFormInputs } from "@/hooks/useFormInput";

registerLocale("es", es);

function EgresosPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fechaParam = searchParams.get("fecha");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [fechaDate, setFechaDate] = useState<Date>(() => {
    if (fechaParam) {
      return crearFechaLocal(fechaParam);
    }
    return today;
  });
  const [fecha, setFecha] = useState<string>(() => {
    if (fechaParam) {
      return fechaParam;
    }
    return today.toISOString().slice(0, 10);
  });
  const [egresos, setEgresos] = useState<Egresos>({
    efectivo: {
      insumos: 0,
      gastos: 0,
    },
    mp: {
      insumos: 0,
      gastos: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { getInputValue, handleFocus, handleBlur } = useFormInputs();

  function cargarDatosFecha(fechaSeleccionada: string) {
    setIsLoading(true);
    fetch(`/api/egresos?fecha=${encodeURIComponent(fechaSeleccionada)}`)
      .then((res) => res.json())
      .then((data: Egresos) => {
        setEgresos(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
      });
  }

  // Efecto inicial para cargar datos al montar el componente
  useEffect(() => {
    const fechaInicial = fechaParam || fecha;
    cargarDatosFecha(fechaInicial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Efecto para actualizar la fecha cuando cambia el parámetro de URL
  useEffect(() => {
    const fechaInicial = fechaParam || fechaToString(today);
    const fechaInicialDate = fechaParam ? crearFechaLocal(fechaParam) : today;
    fechaInicialDate.setHours(0, 0, 0, 0);
    
    const fechaActualStr = fechaToString(fechaDate);
    
    // Solo actualizar si la fecha es diferente
    if (fechaActualStr !== fechaInicial) {
      setFechaDate(fechaInicialDate);
      setFecha(fechaInicial);
      cargarDatosFecha(fechaInicial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaParam]);

  // Efecto para cuando el usuario cambia la fecha manualmente en el DatePicker
  useEffect(() => {
    if (fechaDate) {
      const fechaStr = fechaToString(fechaDate);
      
      // Solo actualizar si la fecha es diferente y no coincide con el parámetro de URL
      if (fechaStr !== fecha && fechaStr !== (fechaParam || "")) {
        setFecha(fechaStr);
        cargarDatosFecha(fechaStr);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaDate]);

  function handleInputChange(
    tipo: "efectivo" | "mp",
    campo: "insumos" | "gastos",
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const value = e.target.value === "" ? 0 : parseInt(e.target.value) || 0;
    setEgresos({
      ...egresos,
      [tipo]: {
        ...egresos[tipo],
        [campo]: value,
      },
    });
  }

  function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    fetch("/api/egresos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fecha,
        efectivo: egresos.efectivo,
        mp: egresos.mp,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Error al guardar los egresos");
        }
        return res.json();
      })
      .then(() => {
        router.push(`/?diaCargada=${encodeURIComponent(fecha)}`);
      })
      .catch((error) => {
        console.error("Error al guardar egresos:", error);
        alert(error.message || "Error al guardar los egresos. Por favor, intenta nuevamente.");
        setSaving(false);
      });
  }

  if (isLoading) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Egresos</h1>

      <div className="flex flex-col gap-1 mb-6">
        <label htmlFor="fecha" className="font-medium">
          Fecha
        </label>
        <DatePicker
          id="fecha"
          selected={fechaDate}
          onChange={(date: Date | null) => {
            if (date) {
              date.setHours(0, 0, 0, 0);
              setFechaDate(date);
            }
          }}
          dateFormat="dd/MM/yyyy"
          locale={es}
          className="border rounded px-3 py-2 w-full"
          wrapperClassName="w-full"
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
        />
      </div>

      <form onSubmit={handleGuardar} className="flex flex-col gap-6" role="form">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Efectivo</h2>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="efectivo-insumos" className="font-medium">
              Insumos
            </label>
            <input
              type="number"
              id="efectivo-insumos"
              value={getInputValue("efectivo-insumos", egresos.efectivo.insumos)}
              onChange={(e) => handleInputChange("efectivo", "insumos", e)}
              onFocus={() => handleFocus("efectivo-insumos")}
              onBlur={() => handleBlur("efectivo-insumos")}
              className="border rounded px-3 py-2 bg-transparent"
              min="0"
              step="100"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="efectivo-gastos" className="font-medium">
              Gastos
            </label>
            <input
              type="number"
              id="efectivo-gastos"
              value={getInputValue("efectivo-gastos", egresos.efectivo.gastos)}
              onChange={(e) => handleInputChange("efectivo", "gastos", e)}
              onFocus={() => handleFocus("efectivo-gastos")}
              onBlur={() => handleBlur("efectivo-gastos")}
              className="border rounded px-3 py-2 bg-transparent"
              min="0"
              step="100"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">MP</h2>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="mp-insumos" className="font-medium">
              Insumos
            </label>
            <input
              type="number"
              id="mp-insumos"
              value={getInputValue("mp-insumos", egresos.mp.insumos)}
              onChange={(e) => handleInputChange("mp", "insumos", e)}
              onFocus={() => handleFocus("mp-insumos")}
              onBlur={() => handleBlur("mp-insumos")}
              className="border rounded px-3 py-2 bg-transparent"
              min="0"
              step="100"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="mp-gastos" className="font-medium">
              Gastos
            </label>
            <input
              type="number"
              id="mp-gastos"
              value={getInputValue("mp-gastos", egresos.mp.gastos)}
              onChange={(e) => handleInputChange("mp", "gastos", e)}
              onFocus={() => handleFocus("mp-gastos")}
              onBlur={() => handleBlur("mp-gastos")}
              className="border rounded px-3 py-2 bg-transparent"
              min="0"
              step="100"
            />
          </div>
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
            onClick={() => router.push("/")}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default function EgresosPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <EgresosPageClient />
    </Suspense>
  );
}

