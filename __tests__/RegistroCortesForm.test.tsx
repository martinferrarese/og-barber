import '@testing-library/jest-dom';

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RegistroCortesForm from "@/components/RegistroCortesForm";

// Mock fetch para barberos
beforeAll(() => {
  global.fetch = jest.fn().mockImplementation((url) => {
    if (url === "/api/barberos") {
      return Promise.resolve({ json: () => Promise.resolve(["Joaco", "Elias"]) });
    }
    return Promise.resolve({ json: () => Promise.resolve({ ok: true }) });
  });
});

describe("RegistroCortesForm paso 1", () => {
  it("deshabilita submit si no hay barbero seleccionado", async () => {
    render(<RegistroCortesForm />);

    // Esperar carga de barberos
    await waitFor(() => expect(screen.getByRole("combobox", { name: /barbero/i })).toBeInTheDocument());

    const submit = screen.getByRole("button", { name: /continuar/i });
    expect(submit).toBeDisabled();

    // seleccionar barbero
    fireEvent.change(screen.getByRole("combobox", { name: /barbero/i }), { target: { value: "Joaco" } });
    expect(submit).toBeEnabled();
  });
});

describe("RegistroCortesForm paso 2", () => {
  it("calcula totales y envía payload esperado", async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const mockFetch = jest.fn().mockImplementation((url: RequestInfo, _: RequestInit | undefined) => {
      if (url === "/api/barberos") {
        return Promise.resolve({ json: () => Promise.resolve(["Joaco"]) });
      }
      // respuesta por defecto
      return Promise.resolve({ json: () => Promise.resolve({ ok: true }) });
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    render(<RegistroCortesForm />);

    // esperar barberos y seleccionar
    const barberoSelect = await screen.findByRole("combobox", { name: /barbero/i });
    fireEvent.change(barberoSelect, { target: { value: "Joaco" } });

    fireEvent.submit(screen.getByRole("button", { name: /continuar/i }));

    // ahora deben aparecer inputs de servicios
    await screen.findByText(/Servicios realizados/);
    const efectivoInputs = screen.getAllByLabelText(/Efectivo/i);
    const mpInputs = screen.getAllByLabelText(/Mercado Pago/i);

    // Orden: corte efectivo, corte barba efectivo (segunda sección) -> indices 0 y 1
    // Ingresamos solo en corte efectivo (index 0)
    fireEvent.change(efectivoInputs[0], { target: { value: "5" } });

    // mp inputs: index 0 => corte mp, index1 => barba mp
    fireEvent.change(mpInputs[0], { target: { value: "2" } });
    fireEvent.change(mpInputs[1], { target: { value: "2" } });

    // verificar totales
    expect(await screen.findByText(/Efectivo: \$55\.000/)).toBeInTheDocument();
    expect(screen.getByText(/Mercado Pago: \$46\.000/)).toBeInTheDocument();
    expect(screen.getByText(/Total: \$101\.000/)).toBeInTheDocument();

    // enviar formulario
    fireEvent.submit(screen.getByRole("button", { name: /guardar registros/i }));

    await waitFor(() => {
      // segunda llamada a fetch debe ser al endpoint de registro
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/registro-cortes",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }),
      );
      const body = JSON.parse((mockFetch.mock.calls[1][1] as RequestInit).body as string);
      expect(body.barbero).toBe("Joaco");
      expect(body.servicios).toEqual([
        { tipo: "corte", efectivo: 5, mercado_pago: 2 },
        { tipo: "corte_con_barba", efectivo: 0, mercado_pago: 2 },
      ]);
    });
  });
});
