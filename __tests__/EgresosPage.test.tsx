import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter, useSearchParams } from "next/navigation";
import EgresosPage from "@/app/egresos/page";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
};

const mockSearchParams = new URLSearchParams();

describe("EgresosPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    mockSearchParams.delete("fecha");

    global.fetch = jest.fn().mockImplementation((url: RequestInfo | URL) => {
      const urlStr = typeof url === 'string' ? url : url.toString();
      if (urlStr.includes("/api/egresos") && urlStr.includes("fecha=")) {
        return Promise.resolve({
          json: () => Promise.resolve({
            efectivo: {
              insumos: 0,
              gastos: 0,
            },
            mp: {
              insumos: 0,
              gastos: 0,
            },
          }),
        });
      }
      if (urlStr === "/api/egresos") {
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
    render(<EgresosPage />);

    await waitFor(() => {
      expect(screen.queryByText(/Cargando datos/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Egresos/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Fecha/i)).toBeInTheDocument();
    expect(screen.getByText(/Efectivo/i)).toBeInTheDocument();
    expect(screen.getByText(/MP/i)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/^Insumos$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/^Gastos$/i).length).toBeGreaterThan(0);
  });

  it("permite ingresar valores en los campos de egresos", async () => {
    render(<EgresosPage />);

    await waitFor(() => {
      expect(screen.queryByText(/Cargando datos/i)).not.toBeInTheDocument();
    });

    const todosInsumos = screen.getAllByLabelText(/^Insumos$/i);
    const efectivoInsumos = todosInsumos[0] as HTMLInputElement;
    const mpInsumos = todosInsumos[1] as HTMLInputElement;
    const todosGastos = screen.getAllByLabelText(/^Gastos$/i);
    const efectivoGastos = todosGastos[0] as HTMLInputElement;
    const mpGastos = todosGastos[1] as HTMLInputElement;

    fireEvent.change(efectivoInsumos, { target: { value: "5000" } });
    fireEvent.change(efectivoGastos, { target: { value: "3000" } });
    fireEvent.change(mpInsumos, { target: { value: "2000" } });
    fireEvent.change(mpGastos, { target: { value: "1000" } });

    expect(efectivoInsumos.value).toBe("5000");
    expect(efectivoGastos.value).toBe("3000");
    expect(mpInsumos.value).toBe("2000");
    expect(mpGastos.value).toBe("1000");
  });

  it("guarda los egresos correctamente", async () => {
    const mockFetch = jest.fn().mockImplementation((url: RequestInfo | URL) => {
      const urlStr = typeof url === 'string' ? url : url.toString();
      if (urlStr.includes("/api/egresos") && urlStr.includes("fecha=")) {
        return Promise.resolve({
          json: () => Promise.resolve({
            efectivo: {
              insumos: 0,
              gastos: 0,
            },
            mp: {
              insumos: 0,
              gastos: 0,
            },
          }),
        });
      }
      if (urlStr === "/api/egresos") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: true }),
        });
      }
      return Promise.resolve({ json: () => Promise.resolve({ ok: true }) });
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    render(<EgresosPage />);

    await waitFor(() => {
      expect(screen.queryByText(/Cargando datos/i)).not.toBeInTheDocument();
    });

    const todosInsumos = screen.getAllByLabelText(/^Insumos$/i);
    const efectivoInsumos = todosInsumos[0] as HTMLInputElement;
    fireEvent.change(efectivoInsumos, { target: { value: "5000" } });

    const form = screen.getByRole("form") || document.querySelector("form");
    fireEvent.submit(form!);

    await waitFor(() => {
      const postCall = mockFetch.mock.calls.find(
        (call) => {
          const url = call[0];
          const urlStr = typeof url === 'string' ? url : url.toString();
          return urlStr === "/api/egresos" && call[1]?.method === "POST";
        }
      );
      expect(postCall).toBeDefined();
      if (postCall) {
        const [, options] = postCall as [RequestInfo, RequestInit];
        expect(options?.method).toBe("POST");
        const body = JSON.parse(options?.body as string);
        expect(body.efectivo.insumos).toBe(5000);
        expect(body.fecha).toBeDefined();
      }
    }, { timeout: 3000 });
  });

  it("carga datos existentes cuando se selecciona una fecha con egresos", async () => {
    const mockFetch = jest.fn().mockImplementation((url: RequestInfo | URL) => {
      const urlStr = typeof url === 'string' ? url : url.toString();
      if (urlStr.includes("/api/egresos") && urlStr.includes("fecha=")) {
        return Promise.resolve({
          json: () => Promise.resolve({
            efectivo: {
              insumos: 5000,
              gastos: 3000,
            },
            mp: {
              insumos: 2000,
              gastos: 1000,
            },
          }),
        });
      }
      return Promise.resolve({ json: () => Promise.resolve({ ok: true }) });
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    render(<EgresosPage />);

    await waitFor(() => {
      expect(screen.queryByText(/Cargando datos/i)).not.toBeInTheDocument();
    });

    const todosInsumos = screen.getAllByLabelText(/^Insumos$/i);
    const efectivoInsumos = todosInsumos[0] as HTMLInputElement;
    const mpInsumos = todosInsumos[1] as HTMLInputElement;
    const todosGastos = screen.getAllByLabelText(/^Gastos$/i);
    const efectivoGastos = todosGastos[0] as HTMLInputElement;
    const mpGastos = todosGastos[1] as HTMLInputElement;

    expect(efectivoInsumos.value).toBe("5000");
    expect(efectivoGastos.value).toBe("3000");
    expect(mpInsumos.value).toBe("2000");
    expect(mpGastos.value).toBe("1000");
  });
});

