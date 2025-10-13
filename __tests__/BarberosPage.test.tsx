import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import BarberosPage from "@/app/barberos/page";

// Mock fetch globalmente
const mockFetch = jest.fn();
(global as { fetch: jest.Mock }).fetch = mockFetch;

const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

describe("BarberosPage", () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockRefresh.mockClear();
  });

  it("muestra lista de barberos correctamente", async () => {
    // Mock GET /api/barberos
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ["Juan", "Carlos"],
    });

    render(<BarberosPage />);

    // Esperar a que termine el loading
    await waitFor(() => {
      expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument();
    });

    // Verificar que ambos barberos aparecen
    expect(screen.getByText("Juan")).toBeInTheDocument();
    expect(screen.getByText("Carlos")).toBeInTheDocument();
  });

  it("muestra mensaje cuando la lista está vacía", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<BarberosPage />);

    // Esperar a que termine el loading
    await waitFor(() => {
      expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument();
    });

    expect(
      screen.getByText(/aún no hay barberos/i),
    ).toBeInTheDocument();
  });

  it("muestra botones de eliminar para cada barbero", async () => {
    // Mock con dos barberos
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ["Juan", "Carlos"],
    });

    render(<BarberosPage />);

    // Esperar a que termine el loading
    await waitFor(() => {
      expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument();
    });

    // Verificar que hay botones de eliminar para ambos barberos
    const deleteButtons = screen.getAllByRole("button", { name: /eliminar/i });
    expect(deleteButtons).toHaveLength(2);
    
    // Verificar que ambos barberos están presentes
    expect(screen.getByText("Juan")).toBeInTheDocument();
    expect(screen.getByText("Carlos")).toBeInTheDocument();
  });
});
