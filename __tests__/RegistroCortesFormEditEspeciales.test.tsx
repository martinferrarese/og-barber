import "@testing-library/jest-dom";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RegistroCortesForm from "@/components/RegistroCortesForm";
import type { RegistroCortes } from "@/types/registroCortes";

describe("RegistroCortesForm - Edición con Cortes Especiales", () => {
  it("precarga cortes especiales existentes", async () => {
    const initialData: RegistroCortes = {
      fecha: "2025-09-18",
      barbero: "Joaco",
      servicios: [
        { tipo: "corte", efectivo: 3, mercado_pago: 1 },
        { tipo: "corte_con_barba", efectivo: 0, mercado_pago: 2 },
      ],
      cortesEspeciales: [
        { monto: 5000 },
        { monto: 8000 },
      ],
    };

    const onContinue = jest.fn();

    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve(["Joaco"]),
    }) as unknown as typeof fetch;

    render(<RegistroCortesForm initialData={initialData} onContinue={onContinue} />);

    // Debe estar en paso 2
    await screen.findByText(/Editar servicios de Joaco/i);

    // Verificar que aparecen los 2 cortes especiales
    expect(screen.getByText(/\$5\.000/)).toBeInTheDocument();
    expect(screen.getByText(/\$8\.000/)).toBeInTheDocument();

    // Calcular total esperado
    // Servicios: 3*11000 + 1*11000 + 0*12000 + 2*12000 = 33000 + 11000 + 24000 = 68000
    // Especiales: 5000 + 8000 = 13000
    // Total: 81000
    expect(screen.getByText(/Total: \$81\.000/)).toBeInTheDocument();
  });

  it("permite modificar cortes especiales en edición", async () => {
    const initialData: RegistroCortes = {
      fecha: "2025-09-18",
      barbero: "Joaco",
      servicios: [
        { tipo: "corte", efectivo: 2, mercado_pago: 0 },
        { tipo: "corte_con_barba", efectivo: 0, mercado_pago: 0 },
      ],
      cortesEspeciales: [
        { monto: 5000 },
        { monto: 8000 },
      ],
    };

    const onContinue = jest.fn();

    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve(["Joaco"]),
    }) as unknown as typeof fetch;

    render(<RegistroCortesForm initialData={initialData} onContinue={onContinue} />);

    await screen.findByText(/Editar servicios de Joaco/i);

    // Eliminar el primer corte especial (5000)
    const botonesEliminar = screen.getAllByRole("button", { name: /eliminar/i });
    fireEvent.click(botonesEliminar[0]);

    // Agregar uno nuevo
    fireEvent.click(screen.getByRole("button", { name: /agregar corte especial/i }));
    fireEvent.change(screen.getByLabelText(/monto/i), { target: { value: "12000" } });
    fireEvent.click(screen.getByRole("button", { name: /confirmar/i }));

    // Guardar
    fireEvent.click(screen.getByRole("button", { name: /guardar cambios/i }));

    await waitFor(() => expect(onContinue).toHaveBeenCalled());

    const payload = onContinue.mock.calls[0][0];
    
    // Debe tener solo 8000 y 12000
    expect(payload.cortesEspeciales).toEqual([
      { monto: 8000 },
      { monto: 12000 },
    ]);
  });

  it("retro-compatibilidad: edita registros sin cortesEspeciales", async () => {
    const initialData: RegistroCortes = {
      fecha: "2025-09-18",
      barbero: "Joaco",
      servicios: [
        { tipo: "corte", efectivo: 3, mercado_pago: 1 },
        { tipo: "corte_con_barba", efectivo: 0, mercado_pago: 2 },
      ],
      // SIN cortesEspeciales
    };

    const onContinue = jest.fn();

    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve(["Joaco"]),
    }) as unknown as typeof fetch;

    render(<RegistroCortesForm initialData={initialData} onContinue={onContinue} />);

    await screen.findByText(/Editar servicios de Joaco/i);

    // No debe haber error, y no debe haber lista de cortes especiales (porque no hay ninguno)
    expect(screen.queryByRole("list")).not.toBeInTheDocument();

    // Puede agregar nuevos cortes especiales
    fireEvent.click(screen.getByRole("button", { name: /agregar corte especial/i }));
    fireEvent.change(screen.getByLabelText(/monto/i), { target: { value: "6000" } });
    fireEvent.click(screen.getByRole("button", { name: /confirmar/i }));

    // Ahora sí debe haber una lista con el corte
    const cortesLista = screen.getByRole("list");
    expect(cortesLista).toHaveTextContent("$6.000");

    // Guardar
    fireEvent.click(screen.getByRole("button", { name: /guardar cambios/i }));

    await waitFor(() => expect(onContinue).toHaveBeenCalled());

    const payload = onContinue.mock.calls[0][0];
    expect(payload.cortesEspeciales).toEqual([{ monto: 6000 }]);
  });

  it("permite editar y eliminar todos los cortes especiales", async () => {
    const initialData: RegistroCortes = {
      fecha: "2025-09-18",
      barbero: "Joaco",
      servicios: [
        { tipo: "corte", efectivo: 2, mercado_pago: 0 },
        { tipo: "corte_con_barba", efectivo: 0, mercado_pago: 0 },
      ],
      cortesEspeciales: [
        { monto: 5000 },
      ],
    };

    const onContinue = jest.fn();

    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve(["Joaco"]),
    }) as unknown as typeof fetch;

    render(<RegistroCortesForm initialData={initialData} onContinue={onContinue} />);

    await screen.findByText(/Editar servicios de Joaco/i);

    // Debe aparecer el corte especial en la lista
    const cortesLista = screen.getByRole("list");
    expect(cortesLista).toHaveTextContent("$5.000");

    // Eliminar el único corte especial
    const botonEliminar = screen.getByRole("button", { name: /eliminar/i });
    fireEvent.click(botonEliminar);

    // Ya no debe haber lista (porque no quedan cortes especiales)
    expect(screen.queryByRole("list")).not.toBeInTheDocument();

    // Total solo servicios: 2 * 11000 = 22000
    expect(screen.getByText(/Total: \$22\.000/)).toBeInTheDocument();

    // Guardar
    fireEvent.click(screen.getByRole("button", { name: /guardar cambios/i }));

    await waitFor(() => expect(onContinue).toHaveBeenCalled());

    const payload = onContinue.mock.calls[0][0];
    expect(payload.cortesEspeciales || []).toEqual([]);
  });
});
