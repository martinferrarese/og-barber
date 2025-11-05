import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import PreciosPage from "@/app/configuraciones/precios/page";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
};

describe("PreciosPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    
    global.fetch = jest.fn().mockImplementation((url: RequestInfo) => {
      if (url === "/api/precios") {
        return Promise.resolve({
          json: () => Promise.resolve({ corte: 12000, corteYBarba: 13000 }),
        });
      }
      return Promise.resolve({ json: () => Promise.resolve({ ok: true }) });
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    // Limpiar el DOM después de cada test
    document.body.innerHTML = '';
  });

  it("renderiza la página con título y campos de precios", async () => {
    const { container } = render(<PreciosPage />);

    await waitFor(() => {
      expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Ajustar precios/i)).toBeInTheDocument();
    // Usar getElementById para evitar duplicados
    expect(container.querySelector('#corte')).toBeInTheDocument();
    expect(container.querySelector('#corteYBarba')).toBeInTheDocument();
  });

  it("carga los precios existentes", async () => {
    const { container } = render(<PreciosPage />);

    await waitFor(() => {
      expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument();
    });

    const corteInput = container.querySelector('#corte') as HTMLInputElement;
    const corteYBarbaInput = container.querySelector('#corteYBarba') as HTMLInputElement;
    
    expect(corteInput?.value).toBe("12000");
    expect(corteYBarbaInput?.value).toBe("13000");
  });

  it("permite editar los precios", async () => {
    const { container } = render(<PreciosPage />);

    await waitFor(() => {
      expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument();
    });

    const corteInput = container.querySelector('#corte') as HTMLInputElement;
    fireEvent.change(corteInput, { target: { value: "15000" } });

    expect(corteInput.value).toBe("15000");
  });

  it("guarda los precios correctamente", async () => {
    const mockFetch = jest.fn().mockImplementation((url: RequestInfo, options?: RequestInit) => {
      if (url === "/api/precios" && (!options || options.method === "GET")) {
        return Promise.resolve({
          json: () => Promise.resolve({ corte: 12000, corteYBarba: 13000 }),
        });
      }
      if (url === "/api/precios" && options?.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: true }),
        });
      }
      return Promise.resolve({ json: () => Promise.resolve({ ok: true }) });
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    const { container } = render(<PreciosPage />);

    await waitFor(() => {
      expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument();
    });

    const corteInput = container.querySelector('#corte') as HTMLInputElement;
    fireEvent.change(corteInput, { target: { value: "15000" } });

    const form = container.querySelector('form');
    const guardarButton = screen.getByRole("button", { name: /Guardar/i });
    
    // Simular submit del formulario en lugar de solo hacer click
    fireEvent.submit(form || guardarButton);

    await waitFor(() => {
      const postCall = mockFetch.mock.calls.find(
        (call) => {
          const url = call[0];
          const options = call[1] as RequestInit | undefined;
          return url === "/api/precios" && options?.method === "POST";
        }
      );
      expect(postCall).toBeDefined();
      if (postCall) {
        const [, options] = postCall as [RequestInfo, RequestInit];
        expect(options?.method).toBe("POST");
        expect(options?.headers).toMatchObject({ "Content-Type": "application/json" });
        expect(JSON.parse(options?.body as string)).toEqual({ corte: 15000, corteYBarba: 13000 });
      }
    }, { timeout: 3000 });
  });

  it("muestra mensaje de éxito y redirige después de guardar", async () => {
    jest.useFakeTimers();
    const mockFetch = jest.fn().mockImplementation((url: RequestInfo, options?: RequestInit) => {
      if (url === "/api/precios" && (!options || options.method === "GET")) {
        return Promise.resolve({
          json: () => Promise.resolve({ corte: 12000, corteYBarba: 13000 }),
        });
      }
      if (url === "/api/precios" && options?.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: true }),
        });
      }
      return Promise.resolve({ json: () => Promise.resolve({ ok: true }) });
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    const { container } = render(<PreciosPage />);

    await waitFor(() => {
      expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument();
    });

    const form = container.querySelector('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText(/Precios guardados correctamente/i)).toBeInTheDocument();
    });

    // Avanzar el timer para que se ejecute el setTimeout
    jest.advanceTimersByTime(1500);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/configuraciones");
    });

    jest.useRealTimers();
  });

  it("muestra mensaje de error si falla el guardado", async () => {
    const mockFetch = jest.fn().mockImplementation((url: RequestInfo, options?: RequestInit) => {
      if (url === "/api/precios" && (!options || options.method === "GET")) {
        return Promise.resolve({
          json: () => Promise.resolve({ corte: 12000, corteYBarba: 13000 }),
        });
      }
      if (url === "/api/precios" && options?.method === "POST") {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: "Error al guardar los precios" }),
        });
      }
      return Promise.resolve({ json: () => Promise.resolve({ ok: true }) });
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    const { container } = render(<PreciosPage />);

    await waitFor(() => {
      expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument();
    });

    const form = container.querySelector('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText(/Error al guardar los precios/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("permite cancelar y volver a configuraciones", async () => {
    render(<PreciosPage />);

    await waitFor(() => {
      expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument();
    });

    const cancelarButton = screen.getByRole("button", { name: /Cancelar/i });
    fireEvent.click(cancelarButton);

    expect(mockPush).toHaveBeenCalledWith("/configuraciones");
  });
});

