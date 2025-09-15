import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CorteForm from "@/components/CorteForm";

// Mock fetch con comportamiento según URL
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockFetch = jest.fn((url: RequestInfo, _options?: RequestInit): Promise<Response> => {
  if (typeof url === "string" && url === "/api/barberos") {
    // Respuesta para lista de barberos
    return Promise.resolve({
      json: () => Promise.resolve(["Juan"]),
    } as unknown as Response);
  }
  // Respuesta para POST /api/cortes
  return Promise.resolve({
    json: () => Promise.resolve({ ok: true }),
  } as unknown as Response);
});

global.fetch = mockFetch as unknown as typeof fetch;

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

describe("CorteForm", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it("envía los datos correctamente", async () => {
    render(<CorteForm />);

    // Espera a que el select de barberos esté disponible con las opciones
    const selectBarbero = await screen.findByLabelText(/barbero/i);
    const selectTipo = screen.getByLabelText(/tipo de servicio/i);
    const submit = screen.getByRole("button", { name: /guardar corte/i });

    await userEvent.selectOptions(selectTipo, "corte_con_barba");
    await userEvent.selectOptions(selectBarbero, "Juan");
    await userEvent.click(submit);

    // Debe haber dos llamadas: una para obtener barberos, otra para guardar corte
    expect(mockFetch).toHaveBeenCalledTimes(2);

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/cortes",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "corte_con_barba",
          barbero: "Juan",
          formaDePago: "efectivo",
        }),
      }),
    );
  });

  it("deshabilita el botón cuando no hay barbero seleccionado", async () => {
    // Mock de barberos disponibles
    const fetchWithBarberos = jest.fn((url: RequestInfo) => {
      if (url === "/api/barberos") {
        return Promise.resolve({ json: () => Promise.resolve(["Juan"]) } as Response);
      }
      return Promise.resolve({ json: () => Promise.resolve({ ok: true }) } as Response);
    });
    global.fetch = fetchWithBarberos as unknown as typeof fetch;

    render(<CorteForm />);

    const submit = await screen.findByRole("button", { name: /guardar corte/i });

    // El botón debe estar deshabilitado porque no se ha seleccionado barbero
    expect(submit).toBeDisabled();

    await userEvent.click(submit);

    // No debería haberse hecho la llamada para guardar el corte
    expect(fetchWithBarberos).toHaveBeenCalledTimes(1); // solo la llamada inicial a /api/barberos
  });

  it("deshabilita el botón si no hay barberos disponibles", async () => {
    // Mock sin barberos
    const fetchSinBarberos = jest.fn((url: RequestInfo) => {
      if (url === "/api/barberos") {
        return Promise.resolve({ json: () => Promise.resolve([]) } as Response);
      }
      return Promise.resolve({ json: () => Promise.resolve({ ok: true }) } as Response);
    });
    global.fetch = fetchSinBarberos as unknown as typeof fetch;

    render(<CorteForm />);

    const mensaje = await screen.findByText(/no hay barberos\. agrega uno primero\./i);
    expect(mensaje).toBeInTheDocument();

    const submit = screen.getByRole("button", { name: /guardar corte/i });
    expect(submit).toBeDisabled();

    await userEvent.click(submit);

    // Solo se debe haber hecho la llamada de obtención de barberos
    expect(fetchSinBarberos).toHaveBeenCalledTimes(1);
  });
});
