import "@testing-library/jest-dom";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RegistroDiaForm from "@/components/RegistroDiaForm";
import type { RegistroCortesDia } from "@/types/registroCortes";

describe("RegistroDiaForm selección de fecha existente", () => {
  it("precarga registros y permite edición", async () => {
    const registroMock: RegistroCortesDia = {
      fecha: "2025-09-18",
      barberos: [
        {
          fecha: "2025-09-18",
          barbero: "Joaco",
          servicios: [{ tipo: "corte", efectivo: 2, mercado_pago: 0 }],
        },
      ],
    };

    global.fetch = jest.fn().mockImplementation((url: RequestInfo) => {
      if (url === "/api/registros-dia") {
        return Promise.resolve({ json: () => Promise.resolve([registroMock]) });
      }
      if (url === "/api/barberos") {
        return Promise.resolve({ json: () => Promise.resolve(["Joaco"]) });
      }
      return Promise.resolve({ json: () => Promise.resolve({ ok: true }) });
    }) as unknown as typeof fetch;

    render(<RegistroDiaForm />);

    // Cambiar fecha del input
    const dateInput = screen.getByLabelText(/fecha del día/i) as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: "2025-09-18" } });

    // Seleccionar fecha
    fireEvent.click(screen.getByRole("button", { name: /seleccionar fecha/i }));

    // Debe aparecer sección Barberos cargados con Joaco
    await waitFor(() => expect(screen.getByText(/barberos cargados/i)).toBeInTheDocument());
    expect(screen.getByText(/Joaco/)).toBeInTheDocument();
    // Botón editar presente
    expect(screen.getByRole("button", { name: /editar/i })).toBeInTheDocument();
  });
});
