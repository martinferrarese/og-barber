import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

jest.mock("@/utils/registrosDiaFromDB", () => ({
  readRegistrosDiaKV: jest.fn(),
}));

import RegistrosDiaPage from "@/app/registros-dia/page";
import DeleteRegistroDiaButton from "@/components/DeleteRegistroDiaButton";
import type { RegistroCortesDia } from "@/types/registroCortes";
import { readRegistrosDiaKV } from "@/utils/registrosDiaFromDB";

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
    jest.resetAllMocks();
  });

  it("muestra enlace de edición con fecha correcta", async () => {
    (readRegistrosDiaKV as jest.Mock).mockResolvedValue(mockData);

    const element = await RegistrosDiaPage();
    render(element);

    await waitFor(() => {
      const editLink = screen.getByRole("link", { name: /Editar día/i });
      expect(editLink).toHaveAttribute("href", "/registro-dia?fecha=2025-09-17");
    });
  });

  it("llama al endpoint DELETE al hacer clic en Eliminar", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve(mockData),
    }) as unknown as typeof fetch;

    render(<DeleteRegistroDiaButton fecha="2025-09-17" />);

    const btn = screen.getByRole("button", { name: /Eliminar día/i });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/registros-dia", expect.objectContaining({
        method: "DELETE",
        body: JSON.stringify({ fecha: "2025-09-17" }),
      }));
    });
  });
});
