import "@testing-library/jest-dom";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: jest.fn(),
  }),
}));

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CargaRapidaPage from "@/app/carga-rapida/page";

describe("CargaRapidaPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
  });

  it("renderiza la página con título y selector de fecha", async () => {
    global.fetch = jest.fn().mockImplementation((url: RequestInfo) => {
      if (url === "/api/barberos") {
        return Promise.resolve({
          json: () => Promise.resolve(["Joaco", "Lauty"]),
        });
      }
      return Promise.resolve({ json: () => Promise.resolve({ ok: true }) });
    }) as unknown as typeof fetch;

    render(<CargaRapidaPage />);

    expect(screen.getByText(/Carga rápida/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Fecha/i)).toBeInTheDocument();
  });

  it("carga y muestra todos los barberos", async () => {
    global.fetch = jest.fn().mockImplementation((url: RequestInfo) => {
      if (url === "/api/barberos") {
        return Promise.resolve({
          json: () => Promise.resolve(["Joaco", "Lauty", "Bruno", "Lucas"]),
        });
      }
      return Promise.resolve({ json: () => Promise.resolve({ ok: true }) });
    }) as unknown as typeof fetch;

    render(<CargaRapidaPage />);

    await waitFor(() => {
      expect(screen.getByText("Joaco")).toBeInTheDocument();
      expect(screen.getByText("Lauty")).toBeInTheDocument();
      expect(screen.getByText("Bruno")).toBeInTheDocument();
      expect(screen.getByText("Lucas")).toBeInTheDocument();
    });
  });

  it("ordena barberos correctamente: Bruno y Lucas al final, Lucas último", async () => {
    global.fetch = jest.fn().mockImplementation((url: RequestInfo) => {
      if (url === "/api/barberos") {
        return Promise.resolve({
          json: () => Promise.resolve(["Bruno", "Lucas", "Joaco", "Lauty"]),
        });
      }
      return Promise.resolve({ json: () => Promise.resolve({ ok: true }) });
    }) as unknown as typeof fetch;

    render(<CargaRapidaPage />);

    await waitFor(() => {
      const barberoHeaders = screen.getAllByRole("heading", { level: 2 });
      const nombres = barberoHeaders.map((h) => h.textContent);

      // Verificar que Joaco y Lauty estén antes que Bruno y Lucas
      const joacoIndex = nombres.indexOf("Joaco");
      const lautyIndex = nombres.indexOf("Lauty");
      const brunoIndex = nombres.indexOf("Bruno");
      const lucasIndex = nombres.indexOf("Lucas");

      expect(joacoIndex).toBeLessThan(brunoIndex);
      expect(lautyIndex).toBeLessThan(brunoIndex);
      expect(brunoIndex).toBeLessThan(lucasIndex);
    });
  });

  it("muestra campos de entrada para cada barbero", async () => {
    global.fetch = jest.fn().mockImplementation((url: RequestInfo) => {
      if (url === "/api/barberos") {
        return Promise.resolve({
          json: () => Promise.resolve(["Joaco"]),
        });
      }
      return Promise.resolve({ json: () => Promise.resolve({ ok: true }) });
    }) as unknown as typeof fetch;

    render(<CargaRapidaPage />);

    await waitFor(() => {
      expect(screen.getByText("Joaco")).toBeInTheDocument();
    });

    // Verificar que existen los campos de entrada
    const joacoSection = screen.getByText("Joaco").closest("div");
    const inputs = joacoSection?.querySelectorAll('input[type="number"]') || [];
    
    expect(inputs.length).toBeGreaterThanOrEqual(4); // Al menos 4 campos por barbero
  });

  it("calcula totales correctamente al ingresar datos", async () => {
    global.fetch = jest.fn().mockImplementation((url: RequestInfo) => {
      if (url === "/api/barberos") {
        return Promise.resolve({
          json: () => Promise.resolve(["Joaco"]),
        });
      }
      return Promise.resolve({ json: () => Promise.resolve({ ok: true }) });
    }) as unknown as typeof fetch;

    render(<CargaRapidaPage />);

    await waitFor(() => {
      expect(screen.getByText("Joaco")).toBeInTheDocument();
    });

    // Buscar inputs por posición relativa al texto del label
    const joacoSection = screen.getByText("Joaco").closest("div");
    const inputs = joacoSection?.querySelectorAll('input[type="number"]') || [];
    const cortesInput = inputs[0] as HTMLInputElement;
    const corteYBarbaInput = inputs[1] as HTMLInputElement;

    fireEvent.change(cortesInput, { target: { value: "2" } });
    fireEvent.change(corteYBarbaInput, { target: { value: "3" } });

    // Verificar totales
    await waitFor(() => {
      // Total cortes: 2 * 12000 = 24000
      expect(screen.getByText(/Total cortes: \$24\.000/)).toBeInTheDocument();
      // Total corte y barba: 3 * 13000 = 39000
      expect(screen.getByText(/Total corte y barba: \$39\.000/)).toBeInTheDocument();
    });
  });

  it("muestra retiros separados en los totales", async () => {
    global.fetch = jest.fn().mockImplementation((url: RequestInfo) => {
      if (url === "/api/barberos") {
        return Promise.resolve({
          json: () => Promise.resolve(["Joaco"]),
        });
      }
      return Promise.resolve({ json: () => Promise.resolve({ ok: true }) });
    }) as unknown as typeof fetch;

    render(<CargaRapidaPage />);

    await waitFor(() => {
      expect(screen.getByText("Joaco")).toBeInTheDocument();
    });

    const joacoSection = screen.getByText("Joaco").closest("div");
    const inputs = joacoSection?.querySelectorAll('input[type="number"]') || [];
    const retiroEfectivoInput = inputs[2] as HTMLInputElement;
    const retiroMPInput = inputs[3] as HTMLInputElement;

    fireEvent.change(retiroEfectivoInput, { target: { value: "5000" } });
    fireEvent.change(retiroMPInput, { target: { value: "3000" } });

    await waitFor(() => {
      expect(screen.getByText(/Retiros Efectivo: \$5\.000/)).toBeInTheDocument();
      expect(screen.getByText(/Retiros MP: \$3\.000/)).toBeInTheDocument();
    });
  });

  it("muestra campo vacío cuando está enfocado y tiene valor 0", async () => {
    global.fetch = jest.fn().mockImplementation((url: RequestInfo) => {
      if (url === "/api/barberos") {
        return Promise.resolve({
          json: () => Promise.resolve(["Joaco"]),
        });
      }
      return Promise.resolve({ json: () => Promise.resolve({ ok: true }) });
    }) as unknown as typeof fetch;

    render(<CargaRapidaPage />);

    await waitFor(() => {
      expect(screen.getByText("Joaco")).toBeInTheDocument();
    });

    const joacoSection = screen.getByText("Joaco").closest("div");
    const inputs = joacoSection?.querySelectorAll('input[type="number"]') || [];
    const cortesInput = inputs[0] as HTMLInputElement;

    // Al enfocar, el campo debería mostrarse vacío si tiene valor 0
    fireEvent.focus(cortesInput);
    await waitFor(() => {
      expect(cortesInput.value).toBe("");
    });

    // Al perder el foco sin cambiar el valor, debería volver a mostrar 0
    fireEvent.blur(cortesInput);
    await waitFor(() => {
      expect(cortesInput.value).toBe("0");
    });
  });

  it("permite ingresar valores en los campos", async () => {
    global.fetch = jest.fn().mockImplementation((url: RequestInfo) => {
      if (url === "/api/barberos") {
        return Promise.resolve({
          json: () => Promise.resolve(["Joaco"]),
        });
      }
      return Promise.resolve({ json: () => Promise.resolve({ ok: true }) });
    }) as unknown as typeof fetch;

    render(<CargaRapidaPage />);

    await waitFor(() => {
      expect(screen.getByText("Joaco")).toBeInTheDocument();
    });

    const joacoSection = screen.getByText("Joaco").closest("div");
    const inputs = joacoSection?.querySelectorAll('input[type="number"]') || [];
    const cortesInput = inputs[0] as HTMLInputElement;
    
    fireEvent.change(cortesInput, { target: { value: "5" } });

    expect(cortesInput.value).toBe("5");
  });

  it("guarda datos correctamente al hacer submit", async () => {
    const mockFetch = jest.fn().mockImplementation((url: RequestInfo, options?: RequestInit) => {
      if (url === "/api/barberos") {
        return Promise.resolve({
          json: () => Promise.resolve(["Joaco"]),
        });
      }
      if (url === "/api/registros-dia" && options?.method === "POST") {
        return Promise.resolve({
          json: () => Promise.resolve({ ok: true }),
        });
      }
      return Promise.resolve({ json: () => Promise.resolve({ ok: true }) });
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    render(<CargaRapidaPage />);

    await waitFor(() => {
      expect(screen.getByText("Joaco")).toBeInTheDocument();
    });

    // Ingresar datos
    const joacoSection = screen.getByText("Joaco").closest("div");
    const inputs = joacoSection?.querySelectorAll('input[type="number"]') || [];
    const cortesInput = inputs[0] as HTMLInputElement;
    fireEvent.change(cortesInput, { target: { value: "2" } });

    // Guardar
    const guardarButton = screen.getByRole("button", { name: /Guardar/i });
    fireEvent.click(guardarButton);

    await waitFor(() => {
      const postCall = mockFetch.mock.calls.find(
        (call) => call[0] === "/api/registros-dia" && call[1]?.method === "POST"
      );
      expect(postCall).toBeDefined();

      if (postCall) {
        const [, options] = postCall as [RequestInfo, RequestInit];
        const body = JSON.parse(options.body as string);
        expect(body.fecha).toBeDefined();
        expect(body.barberos).toHaveLength(1);
        expect(body.barberos[0].barbero).toBe("Joaco");
        expect(body.barberos[0].servicios).toEqual([
          { tipo: "corte", efectivo: 2, mercado_pago: 0 },
          { tipo: "corte_con_barba", efectivo: 0, mercado_pago: 0 },
        ]);
      }
    });
  });

  it("redirige a la página principal después de guardar", async () => {
    const mockFetch = jest.fn().mockImplementation((url: RequestInfo) => {
      if (url === "/api/barberos") {
        return Promise.resolve({
          json: () => Promise.resolve(["Joaco"]),
        });
      }
      if (url === "/api/registros-dia") {
        return Promise.resolve({
          json: () => Promise.resolve({ ok: true }),
        });
      }
      return Promise.resolve({ json: () => Promise.resolve({ ok: true }) });
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    render(<CargaRapidaPage />);

    await waitFor(() => {
      expect(screen.getByText("Joaco")).toBeInTheDocument();
    });

    const joacoSection = screen.getByText("Joaco").closest("div");
    const inputs = joacoSection?.querySelectorAll('input[type="number"]') || [];
    const cortesInput = inputs[0] as HTMLInputElement;
    fireEvent.change(cortesInput, { target: { value: "1" } });

    const guardarButton = screen.getByRole("button", { name: /Guardar/i });
    fireEvent.click(guardarButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled();
      expect(mockPush.mock.calls[0][0]).toMatch(/\?diaCargada=/);
    });
  });

  it("muestra alerta si intenta guardar sin datos", async () => {
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    global.fetch = jest.fn().mockImplementation((url: RequestInfo) => {
      if (url === "/api/barberos") {
        return Promise.resolve({
          json: () => Promise.resolve(["Joaco"]),
        });
      }
      return Promise.resolve({ json: () => Promise.resolve({ ok: true }) });
    }) as unknown as typeof fetch;

    render(<CargaRapidaPage />);

    await waitFor(() => {
      expect(screen.getByText("Joaco")).toBeInTheDocument();
    });

    // Intentar guardar sin datos
    const guardarButton = screen.getByRole("button", { name: /Guardar/i });
    fireEvent.click(guardarButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Debe ingresar al menos un corte para algún barbero");
    });

    alertSpy.mockRestore();
  });

  it("filtra barberos sin cortes al guardar", async () => {
    const mockFetch = jest.fn().mockImplementation((url: RequestInfo, options?: RequestInit) => {
      if (url === "/api/barberos") {
        return Promise.resolve({
          json: () => Promise.resolve(["Joaco", "Lauty"]),
        });
      }
      if (url === "/api/registros-dia" && options?.method === "POST") {
        return Promise.resolve({
          json: () => Promise.resolve({ ok: true }),
        });
      }
      return Promise.resolve({ json: () => Promise.resolve({ ok: true }) });
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    render(<CargaRapidaPage />);

    await waitFor(() => {
      expect(screen.getByText("Joaco")).toBeInTheDocument();
      expect(screen.getByText("Lauty")).toBeInTheDocument();
    });

    // Solo ingresar datos para Joaco
    const joacoSection = screen.getByText("Joaco").closest("div");
    const joacoInputs = joacoSection?.querySelectorAll('input[type="number"]') || [];
    fireEvent.change(joacoInputs[0], { target: { value: "1" } });

    const guardarButton = screen.getByRole("button", { name: /Guardar/i });
    fireEvent.click(guardarButton);

    await waitFor(() => {
      const postCall = mockFetch.mock.calls.find(
        (call) => call[0] === "/api/registros-dia" && call[1]?.method === "POST"
      );
      expect(postCall).toBeDefined();

      if (postCall) {
        const [, options] = postCall as [RequestInfo, RequestInit];
        const body = JSON.parse(options.body as string);
        // Solo debería incluir a Joaco, no a Lauty
        expect(body.barberos).toHaveLength(1);
        expect(body.barberos[0].barbero).toBe("Joaco");
      }
    });
  });

  it("permite cambiar la fecha", async () => {
    global.fetch = jest.fn().mockImplementation((url: RequestInfo) => {
      if (url === "/api/barberos") {
        return Promise.resolve({
          json: () => Promise.resolve(["Joaco"]),
        });
      }
      return Promise.resolve({ json: () => Promise.resolve({ ok: true }) });
    }) as unknown as typeof fetch;

    render(<CargaRapidaPage />);

    await waitFor(() => {
      expect(screen.getByText("Joaco")).toBeInTheDocument();
    });

    const fechaInput = screen.getByLabelText(/Fecha/i) as HTMLInputElement;
    fireEvent.change(fechaInput, { target: { value: "2025-01-15" } });

    expect(fechaInput.value).toBe("2025-01-15");
  });
});

