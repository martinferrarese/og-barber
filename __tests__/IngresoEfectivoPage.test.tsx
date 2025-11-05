import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter, useSearchParams } from "next/navigation";
import IngresoEfectivoPage from "@/app/ingreso-efectivo/page";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
};

const mockSearchParams = new URLSearchParams();

describe("IngresoEfectivoPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    mockSearchParams.delete("fecha");

    global.fetch = jest.fn().mockImplementation((url: RequestInfo | URL) => {
      const urlStr = typeof url === 'string' ? url : url.toString();
      if (urlStr.includes("/api/ingresos") && urlStr.includes("fecha=")) {
        return Promise.resolve({
          json: () => Promise.resolve({
            corteEfectivo: 50000,
            cortesEfectivo: 0,
            cortesMP: 0,
            insumos: 0,
            color: 0,
            bebidas: 0,
          }),
        });
      }
      if (urlStr === "/api/ingresos") {
        return Promise.resolve({
          json: () => Promise.resolve({ ok: true }),
        });
      }
      return Promise.resolve({ json: () => Promise.resolve({ ok: true }) });
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it("renderiza la página con título y campos", async () => {
    render(<IngresoEfectivoPage />);

    await waitFor(() => {
      expect(screen.queryByText(/Cargando datos/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Ingresos/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Fecha/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Cortes$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cortes efectivo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cortes MP/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Insumos/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Color/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Bebidas/i)).toBeInTheDocument();
  });

  it("carga el corte efectivo calculado automáticamente", async () => {
    render(<IngresoEfectivoPage />);

    await waitFor(() => {
      expect(screen.queryByText(/Cargando datos/i)).not.toBeInTheDocument();
    });

    const corteEfectivoInput = screen.getByLabelText(/^Cortes$/i) as HTMLInputElement;
    expect(corteEfectivoInput.value).toBe("50000");
    expect(corteEfectivoInput.readOnly).toBe(true);
  });

  it("permite ingresar valores en insumos, color y bebidas", async () => {
    render(<IngresoEfectivoPage />);

    await waitFor(() => {
      expect(screen.queryByText(/Cargando datos/i)).not.toBeInTheDocument();
    });

    const insumosInput = screen.getByLabelText(/Insumos/i) as HTMLInputElement;
    const colorInput = screen.getByLabelText(/Color/i) as HTMLInputElement;
    const bebidasInput = screen.getByLabelText(/Bebidas/i) as HTMLInputElement;

    fireEvent.change(insumosInput, { target: { value: "10000" } });
    fireEvent.change(colorInput, { target: { value: "5000" } });
    fireEvent.change(bebidasInput, { target: { value: "3000" } });

    expect(insumosInput.value).toBe("10000");
    expect(colorInput.value).toBe("5000");
    expect(bebidasInput.value).toBe("3000");
  });

  it("guarda los ingresos correctamente", async () => {
    const mockFetch = jest.fn().mockImplementation((url: RequestInfo | URL) => {
      const urlStr = typeof url === 'string' ? url : url.toString();
      if (urlStr.includes("/api/ingresos") && urlStr.includes("fecha=")) {
        return Promise.resolve({
          json: () => Promise.resolve({
            corteEfectivo: 50000,
            cortesEfectivo: 0,
            cortesMP: 0,
            insumos: 0,
            color: 0,
            bebidas: 0,
          }),
        });
      }
      if (urlStr === "/api/ingresos") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: true }),
        });
      }
      return Promise.resolve({ json: () => Promise.resolve({ ok: true }) });
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    render(<IngresoEfectivoPage />);

    await waitFor(() => {
      expect(screen.queryByText(/Cargando datos/i)).not.toBeInTheDocument();
    });

    // Establecer valores para cortes efectivo y MP que sumen el total
    const cortesEfectivoInput = screen.getByLabelText(/Cortes efectivo/i) as HTMLInputElement;
    const cortesMPInput = screen.getByLabelText(/Cortes MP/i) as HTMLInputElement;
    fireEvent.change(cortesEfectivoInput, { target: { value: "30000" } });
    fireEvent.change(cortesMPInput, { target: { value: "20000" } });

    const insumosInput = screen.getByLabelText(/Insumos/i) as HTMLInputElement;
    fireEvent.change(insumosInput, { target: { value: "10000" } });

    const form = screen.getByRole("form") || document.querySelector("form");
    fireEvent.submit(form!);

    await waitFor(() => {
      const postCall = mockFetch.mock.calls.find(
        (call) => {
          const url = call[0];
          const urlStr = typeof url === 'string' ? url : url.toString();
          return urlStr === "/api/ingresos" && call[1]?.method === "POST";
        }
      );
      expect(postCall).toBeDefined();
      if (postCall) {
        const [, options] = postCall as [RequestInfo, RequestInit];
        expect(options?.method).toBe("POST");
        const body = JSON.parse(options?.body as string);
        expect(body.cortesEfectivo).toBe(30000);
        expect(body.cortesMP).toBe(20000);
        expect(body.insumos).toBe(10000);
        expect(body.color).toBe(0);
        expect(body.bebidas).toBe(0);
        expect(body.fecha).toBeDefined();
      }
    }, { timeout: 3000 });
  });

  it("carga datos existentes cuando se selecciona una fecha con ingresos", async () => {
    const mockFetch = jest.fn().mockImplementation((url: RequestInfo | URL) => {
      const urlStr = typeof url === 'string' ? url : url.toString();
      if (urlStr.includes("/api/ingresos") && urlStr.includes("fecha=")) {
        return Promise.resolve({
          json: () => Promise.resolve({
            corteEfectivo: 60000,
            cortesEfectivo: 40000,
            cortesMP: 20000,
            insumos: 5000,
            color: 3000,
            bebidas: 2000,
          }),
        });
      }
      return Promise.resolve({ json: () => Promise.resolve({ ok: true }) });
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    render(<IngresoEfectivoPage />);

    await waitFor(() => {
      expect(screen.queryByText(/Cargando datos/i)).not.toBeInTheDocument();
    });

    const insumosInput = screen.getByLabelText(/Insumos/i) as HTMLInputElement;
    const colorInput = screen.getByLabelText(/Color/i) as HTMLInputElement;
    const bebidasInput = screen.getByLabelText(/Bebidas/i) as HTMLInputElement;

    expect(insumosInput.value).toBe("5000");
    expect(colorInput.value).toBe("3000");
    expect(bebidasInput.value).toBe("2000");
  });

  it("muestra error cuando la suma de cortes efectivo y MP no coincide con el total", async () => {
    global.fetch = jest.fn().mockImplementation((url: RequestInfo | URL) => {
      const urlStr = typeof url === 'string' ? url : url.toString();
      if (urlStr.includes("/api/ingresos") && urlStr.includes("fecha=")) {
        return Promise.resolve({
          json: () => Promise.resolve({
            corteEfectivo: 50000,
            cortesEfectivo: 0,
            cortesMP: 0,
            insumos: 0,
            color: 0,
            bebidas: 0,
          }),
        });
      }
      return Promise.resolve({ json: () => Promise.resolve({ ok: true }) });
    }) as unknown as typeof fetch;

    render(<IngresoEfectivoPage />);

    await waitFor(() => {
      expect(screen.queryByText(/Cargando datos/i)).not.toBeInTheDocument();
    });

    const cortesEfectivoInput = screen.getByLabelText(/Cortes efectivo/i) as HTMLInputElement;
    const cortesMPInput = screen.getByLabelText(/Cortes MP/i) as HTMLInputElement;
    
    // Establecer valores que no sumen el total (50000)
    fireEvent.change(cortesEfectivoInput, { target: { value: "20000" } });
    fireEvent.change(cortesMPInput, { target: { value: "15000" } });
    fireEvent.blur(cortesMPInput);

    await waitFor(() => {
      expect(screen.getByText(/no coincide con el total de Cortes/i)).toBeInTheDocument();
    });
  });
});

