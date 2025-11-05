"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DatePicker, { registerLocale } from "react-datepicker";
import { es } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import type { RegistroCortes, RegistroCortesDia } from "@/types/registroCortes";

registerLocale("es", es);

interface BarberoFormData {
  cortes: number;
  corteYBarba: number;
  retiroEfectivo: number;
  retiroMP: number;
}

function CargaRapidaPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fechaParam = searchParams.get("fecha");
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Resetear horas para evitar problemas de zona horaria
  const fechaInicial = fechaParam ? new Date(fechaParam) : today;
  fechaInicial.setHours(0, 0, 0, 0);
  const [fechaDate, setFechaDate] = useState<Date>(fechaInicial);
  const [fecha, setFecha] = useState<string>(fechaParam || today.toISOString().slice(0, 10));
  const [barberos, setBarberos] = useState<string[]>([]);
  const [formData, setFormData] = useState<Record<string, BarberoFormData>>({});
  const [focusedFields, setFocusedFields] = useState<Set<string>>(new Set());
  const [datosCargados, setDatosCargados] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const PRECIO_CORTE = 12000;
  const PRECIO_CORTE_Y_BARBA = 13000;
  const firstInputRef = useRef<HTMLInputElement>(null);

  function ordenarBarberos(barberos: string[]): string[] {
    const otros = barberos.filter((b) => b !== "Bruno" && b !== "Lucas");
    const bruno = barberos.find((b) => b === "Bruno");
    const lucas = barberos.find((b) => b === "Lucas");
    
    const ordenados = [...otros];
    if (bruno) ordenados.push(bruno);
    if (lucas) ordenados.push(lucas);
    
    return ordenados;
  }

  function cargarDatosFecha(fechaSeleccionada: string, barberosList: string[]) {
    setIsLoading(true);
    fetch("/api/registros-dia")
      .then((res) => res.json())
      .then((registros: RegistroCortesDia[]) => {
        const registroExistente = registros.find((r) => r.fecha === fechaSeleccionada);
        
        if (registroExistente) {
          // Prellenar formulario con datos existentes
          const initialData: Record<string, BarberoFormData> = {};
          barberosList.forEach((barbero) => {
            const registroBarbero = registroExistente.barberos.find((b) => b.barbero === barbero);
            
            if (registroBarbero) {
              const servicioCorte = registroBarbero.servicios.find((s) => s.tipo === "corte");
              const servicioCorteYBarba = registroBarbero.servicios.find((s) => s.tipo === "corte_con_barba");
              
              initialData[barbero] = {
                cortes: (servicioCorte?.efectivo || 0) + (servicioCorte?.mercado_pago || 0),
                corteYBarba: (servicioCorteYBarba?.efectivo || 0) + (servicioCorteYBarba?.mercado_pago || 0),
                retiroEfectivo: registroBarbero.retiroEfectivo || 0,
                retiroMP: registroBarbero.retiroMP || 0,
              };
            } else {
              initialData[barbero] = {
                cortes: 0,
                corteYBarba: 0,
                retiroEfectivo: 0,
                retiroMP: 0,
              };
            }
          });
          setFormData(initialData);
        } else {
          // Inicializar vacío si no hay datos
          const initialData: Record<string, BarberoFormData> = {};
          barberosList.forEach((barbero) => {
            initialData[barbero] = {
              cortes: 0,
              corteYBarba: 0,
              retiroEfectivo: 0,
              retiroMP: 0,
            };
          });
          setFormData(initialData);
        }
        setDatosCargados(true);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
      });
  }

  useEffect(() => {
    setIsLoading(true);
    // Cargar barberos primero
    fetch("/api/barberos")
      .then((res) => res.json())
      .then((data: string[]) => {
        const barberosOrdenados = ordenarBarberos(data);
        setBarberos(barberosOrdenados);
        
        // Cargar datos de la fecha inicial (de URL o fecha actual)
        const fechaInicial = fechaParam || fecha;
        cargarDatosFecha(fechaInicial, barberosOrdenados);
      })
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo al montar el componente

  // Efecto para cargar datos cuando cambia la fecha
  useEffect(() => {
    if (barberos.length > 0 && fechaDate) {
      const fechaStr = fechaDate.toISOString().slice(0, 10);
      setFecha(fechaStr);
      setDatosCargados(false);
      cargarDatosFecha(fechaStr, barberos);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaDate]);

  useEffect(() => {
    // Enfocar el primer input cuando los barberos estén cargados y los datos estén listos
    if (barberos.length > 0 && datosCargados && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [barberos, datosCargados]);

  function handleChange(
    barbero: string,
    field: keyof BarberoFormData,
    value: number
  ) {
    setFormData((prev) => ({
      ...prev,
      [barbero]: {
        ...prev[barbero],
        [field]: value,
      },
    }));
  }

  function handleInputChange(
    barbero: string,
    field: keyof BarberoFormData,
    e: React.ChangeEvent<HTMLInputElement>,
    isInteger: boolean = true
  ) {
    const inputValue = e.target.value;
    
    // Si el campo está vacío, establecer a 0
    if (inputValue === "") {
      handleChange(barbero, field, 0);
      return;
    }
    
    const newValue = isInteger ? parseInt(inputValue) || 0 : parseFloat(inputValue) || 0;
    handleChange(barbero, field, newValue);
  }

  function getInputValue(
    barbero: string,
    field: keyof BarberoFormData,
    value: number
  ): string | number {
    const fieldKey = `${barbero}-${field}`;
    const isFocused = focusedFields.has(fieldKey);
    
    // Si está enfocado y el valor es 0, mostrar vacío
    if (isFocused && value === 0) {
      return "";
    }
    
    // Si no está enfocado y el valor es 0, mostrar 0
    return value;
  }

  function handleFocus(barbero: string, field: keyof BarberoFormData) {
    const fieldKey = `${barbero}-${field}`;
    setFocusedFields((prev) => new Set(prev).add(fieldKey));
  }

  function handleBlur(barbero: string, field: keyof BarberoFormData) {
    const fieldKey = `${barbero}-${field}`;
    setFocusedFields((prev) => {
      const newSet = new Set(prev);
      newSet.delete(fieldKey);
      return newSet;
    });
  }

  function calcularTotalCortes(barbero: string): number {
    const data = formData[barbero];
    if (!data) return 0;
    return data.cortes * PRECIO_CORTE;
  }

  function calcularTotalCorteYBarba(barbero: string): number {
    const data = formData[barbero];
    if (!data) return 0;
    return data.corteYBarba * PRECIO_CORTE_Y_BARBA;
  }

  function handleGuardar(e: React.FormEvent) {
    e.preventDefault();

    // Crear registros para cada barbero que tenga datos
    const registros: RegistroCortes[] = barberos
      .filter((barbero) => {
        const data = formData[barbero];
        return data && (data.cortes > 0 || data.corteYBarba > 0);
      })
      .map((barbero) => {
        const data = formData[barbero];
        // Dividir los cortes entre efectivo y MP proporcionalmente o igualmente
        // Por ahora, asumimos que todos son efectivo si no se especifica
        const totalCortes = data.cortes;
        const totalCorteYBarba = data.corteYBarba;

        return {
          fecha,
          barbero,
          servicios: [
            {
              tipo: "corte" as const,
              efectivo: totalCortes,
              mercado_pago: 0,
            },
            {
              tipo: "corte_con_barba" as const,
              efectivo: totalCorteYBarba,
              mercado_pago: 0,
            },
          ],
          retiroEfectivo: data.retiroEfectivo > 0 ? data.retiroEfectivo : undefined,
          retiroMP: data.retiroMP > 0 ? data.retiroMP : undefined,
        };
      });

    if (registros.length === 0) {
      alert("Debe ingresar al menos un corte para algún barbero");
      return;
    }

    const payload: RegistroCortesDia = {
      fecha,
      barberos: registros,
    };

    fetch("/api/registros-dia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(() => {
        router.push(`/?diaCargada=${encodeURIComponent(fecha)}`);
      })
      .catch(console.error);
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
      <h1 className="text-2xl font-bold mb-6">Carga rápida</h1>

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
          locale="es"
          className="border rounded px-3 py-2 w-full"
          wrapperClassName="w-full"
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
        />
      </div>

      <form onSubmit={handleGuardar} className="flex flex-col gap-8">
        {barberos.map((barbero, index) => {
          const data = formData[barbero] || {
            cortes: 0,
            corteYBarba: 0,
            retiroEfectivo: 0,
            retiroMP: 0,
          };
          const totalCortes = calcularTotalCortes(barbero);
          const totalCorteYBarba = calcularTotalCorteYBarba(barbero);
          const isFirstInput = index === 0;

          return (
            <div key={barbero} className="border rounded p-4 flex flex-col gap-4">
              <h2 className="text-xl font-semibold">{barbero}</h2>

              <div className="flex flex-col gap-2">
                <label className="font-medium">Cortes:</label>
                <input
                  ref={isFirstInput ? firstInputRef : null}
                  type="number"
                  min="0"
                  value={getInputValue(barbero, "cortes", data.cortes)}
                  onChange={(e) => handleInputChange(barbero, "cortes", e, true)}
                  onFocus={() => handleFocus(barbero, "cortes")}
                  onBlur={() => handleBlur(barbero, "cortes")}
                  className="border rounded px-3 py-2"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium">Corte y barba:</label>
                <input
                  type="number"
                  min="0"
                  value={getInputValue(barbero, "corteYBarba", data.corteYBarba)}
                  onChange={(e) => handleInputChange(barbero, "corteYBarba", e, true)}
                  onFocus={() => handleFocus(barbero, "corteYBarba")}
                  onBlur={() => handleBlur(barbero, "corteYBarba")}
                  className="border rounded px-3 py-2"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium">Retiro Efectivo:</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={getInputValue(barbero, "retiroEfectivo", data.retiroEfectivo)}
                  onChange={(e) => handleInputChange(barbero, "retiroEfectivo", e, false)}
                  onFocus={() => handleFocus(barbero, "retiroEfectivo")}
                  onBlur={() => handleBlur(barbero, "retiroEfectivo")}
                  className="border rounded px-3 py-2"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium">Retiro MP:</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={getInputValue(barbero, "retiroMP", data.retiroMP)}
                  onChange={(e) => handleInputChange(barbero, "retiroMP", e, false)}
                  onFocus={() => handleFocus(barbero, "retiroMP")}
                  onBlur={() => handleBlur(barbero, "retiroMP")}
                  className="border rounded px-3 py-2"
                />
              </div>

              <div className="mt-2 pt-2 border-t">
                <div className="text-xs text-gray-600 space-y-1">
                  <p>Total cortes: ${totalCortes.toLocaleString()}</p>
                  <p>Total corte y barba: ${totalCorteYBarba.toLocaleString()}</p>
                  <p>Retiros Efectivo: ${(data.retiroEfectivo || 0).toLocaleString()}</p>
                  <p>Retiros MP: ${(data.retiroMP || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          );
        })}

        <button type="submit" className="btn btn-primary">
          Guardar
        </button>
      </form>
    </div>
  );
}

export default function CargaRapidaPage() {
  return (
    <Suspense fallback={<div className="p-4 md:p-8 max-w-2xl mx-auto">Cargando...</div>}>
      <CargaRapidaPageClient />
    </Suspense>
  );
}
