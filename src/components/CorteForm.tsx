"use client";
import { useState } from "react";

export interface CorteEntry {
  tipo: "corte" | "corte_con_barba";
  barbero: string;
  formaDePago: "efectivo" | "mercado_pago";
}

export default function CorteForm() {
  const [formData, setFormData] = useState<CorteEntry>({
    tipo: "corte",
    barbero: "",
    formaDePago: "efectivo",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetch("/api/cortes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then(() => window.location.reload())
      .catch(console.error);
    setFormData({ tipo: "corte", barbero: "", formaDePago: "efectivo" });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 max-w-sm w-full mx-auto"
    >
      <div className="flex flex-col gap-1">
        <label className="font-medium" htmlFor="tipo">
          Tipo de servicio
        </label>
        <select
          id="tipo"
          name="tipo"
          value={formData.tipo}
          onChange={handleChange}
          className="border rounded px-3 py-2"
        >
          <option value="corte">Corte</option>
          <option value="corte_con_barba">Corte con barba</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-medium" htmlFor="barbero">
          Barbero
        </label>
        <input
          id="barbero"
          name="barbero"
          type="text"
          value={formData.barbero}
          onChange={handleChange}
          required
          className="border rounded px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-medium" htmlFor="formaDePago">
          Forma de pago
        </label>
        <select
          id="formaDePago"
          name="formaDePago"
          value={formData.formaDePago}
          onChange={handleChange}
          className="border rounded px-3 py-2"
        >
          <option value="efectivo">Efectivo</option>
          <option value="mercado_pago">Mercado Pago</option>
        </select>
      </div>

      <button
        type="submit"
        className="bg-foreground text-background py-2 px-4 rounded hover:opacity-90"
      >
        Guardar corte
      </button>
    </form>
  );
}
