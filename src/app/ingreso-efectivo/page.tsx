"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DatePicker, { registerLocale } from "react-datepicker";
import { es } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import type { Ingresos } from "@/types/registroCortes";

registerLocale("es", es);

function IngresoEfectivoPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fechaParam = searchParams.get("fecha");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Función para crear una fecha en zona horaria local desde un string YYYY-MM-DD
  function crearFechaLocal(fechaStr: string): Date {
    const [year, month, day] = fechaStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    return date;
  }
  
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
  const [ingresos, setIngresos] = useState<Ingresos>({
    corteEfectivo: 0,
    insumos: 0,
    color: 0,
    bebidas: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [focusedFields, setFocusedFields] = useState<Set<string>>(new Set());

  function cargarDatosFecha(fechaSeleccionada: string) {
    setIsLoading(true);
    fetch(`/api/ingresos?fecha=${encodeURIComponent(fechaSeleccionada)}`)
      .then((res) => res.json())
      .then((data: Ingresos) => {
        setIngresos(data);
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

  // Función para convertir Date a string YYYY-MM-DD en zona horaria local
  function fechaToString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Efecto para actualizar la fecha cuando cambia el parámetro de URL
  useEffect(() => {
    if (fechaParam) {
      const fechaParamDate = crearFechaLocal(fechaParam);
      const fechaParamStr = fechaParam; // Usar el parámetro directamente
      // Comparar fechas en formato local para evitar problemas de zona horaria
      const fechaActualStr = fechaToString(fechaDate);
      
      // Solo actualizar si la fecha es diferente
      if (fechaActualStr !== fechaParamStr) {
        setFechaDate(fechaParamDate);
        setFecha(fechaParamStr);
        cargarDatosFecha(fechaParamStr);
      }
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

  function getInputValue(field: keyof Ingresos, value: number): string {
    const fieldKey = field;
    if (value === 0 && focusedFields.has(fieldKey)) {
      return "";
    }
    return value.toString();
  }

  function handleFocus(field: keyof Ingresos) {
    setFocusedFields((prev) => new Set(prev).add(field));
  }

  function handleBlur(field: keyof Ingresos) {
    setFocusedFields((prev) => {
      const newSet = new Set(prev);
      newSet.delete(field);
      return newSet;
    });
  }

  function handleInputChange(field: keyof Ingresos, e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value === "" ? 0 : parseInt(e.target.value) || 0;
    setIngresos({ ...ingresos, [field]: value });
  }

  function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    fetch("/api/ingresos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fecha,
        insumos: ingresos.insumos,
        color: ingresos.color,
        bebidas: ingresos.bebidas,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        router.push(`/?diaCargada=${encodeURIComponent(fecha)}`);
      })
      .catch((error) => {
        console.error(error);
        setSaving(false);
      });
  }

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mb-4"></div>
        <p className="text-gray-400">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Ingreso efectivo</h1>

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
        <div className="flex flex-col gap-2">
          <label htmlFor="corteEfectivo" className="font-medium">
            Corte efectivo
          </label>
          <input
            type="number"
            id="corteEfectivo"
            value={ingresos.corteEfectivo}
            readOnly
            className="border rounded px-3 py-2 bg-gray-800 text-gray-400 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500">
            Calculado automáticamente según los cortes de los barberos
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="insumos" className="font-medium">
            Insumos
          </label>
          <input
            type="number"
            id="insumos"
            value={getInputValue("insumos", ingresos.insumos)}
            onChange={(e) => handleInputChange("insumos", e)}
            onFocus={() => handleFocus("insumos")}
            onBlur={() => handleBlur("insumos")}
            className="border rounded px-3 py-2 bg-transparent"
            min="0"
            step="100"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="color" className="font-medium">
            Color
          </label>
          <input
            type="number"
            id="color"
            value={getInputValue("color", ingresos.color)}
            onChange={(e) => handleInputChange("color", e)}
            onFocus={() => handleFocus("color")}
            onBlur={() => handleBlur("color")}
            className="border rounded px-3 py-2 bg-transparent"
            min="0"
            step="100"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="bebidas" className="font-medium">
            Bebidas
          </label>
          <input
            type="number"
            id="bebidas"
            value={getInputValue("bebidas", ingresos.bebidas)}
            onChange={(e) => handleInputChange("bebidas", e)}
            onFocus={() => handleFocus("bebidas")}
            onBlur={() => handleBlur("bebidas")}
            className="border rounded px-3 py-2 bg-transparent"
            min="0"
            step="100"
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

export default function IngresoEfectivoPage() {
  return <IngresoEfectivoPageClient />;
}

