import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RegistrosDiaPage from "@/app/registros-dia/page";
import DeleteRegistroDiaButton from "@/components/DeleteRegistroDiaButton";
import type { RegistroCortesDia } from "@/types/registroCortes";

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: jest.fn(),
    push: jest.fn(),
  }),
}));

describe("Interacciones página registros-dia", () => {
  const mockData: RegistroCortesDia[] = [
    {
      fecha: "2025-09-17",
      barberos: [
        {
          fecha: "2025-09-17",
          barbero: "Joaco",
          servicios: [{ tipo: "corte", efectivo: 1, mercado_pago: 0 }],
        },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("muestra enlace de edición con fecha correcta", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    render(<RegistrosDiaPage />);

    await waitFor(() => {
      const editLink = screen.getByRole("link", { name: /Editar día/i });
      expect(editLink).toHaveAttribute("href", "/registro-dia?fecha=2025-09-17");
    });
  });

  it("llama al endpoint DELETE al hacer clic en Eliminar", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });

    render(<DeleteRegistroDiaButton fecha="2025-09-17" />);

    const btn = screen.getByRole("button", { name: /Eliminar día/i });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/registros-dia", expect.objectContaining({
        method: "DELETE",
        body: JSON.stringify({ fecha: "2025-09-17" }),
      }));
    });
  });
});
