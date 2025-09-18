import "@testing-library/jest-dom";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RegistroCortesForm from "@/components/RegistroCortesForm";
import type { RegistroCortes } from "@/types/registroCortes";

describe("RegistroCortesForm en modo edición", () => {
  it("precarga datos y envía cambios", async () => {
    const initialData: RegistroCortes = {
      fecha: "2025-09-18",
      barbero: "Joaco",
      servicios: [
        { tipo: "corte", efectivo: 3, mercado_pago: 1 },
        { tipo: "corte_con_barba", efectivo: 0, mercado_pago: 2 },
      ],
    };

    const onContinue = jest.fn();

    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve(["Joaco"]),
    }) as unknown as typeof fetch;

    render(<RegistroCortesForm initialData={initialData} onContinue={onContinue} />);

    // Botón de guardado en modo edición
    const saveBtn = await screen.findByRole("button", { name: /guardar cambios/i });
    expect(saveBtn).toBeInTheDocument();

    // Inputs precargados
    const efectivoInputs = screen.getAllByLabelText(/efectivo/i);
    expect((efectivoInputs[0] as HTMLInputElement).value).toBe("3");

    // Modificar valor
    fireEvent.change(efectivoInputs[0], { target: { value: "5" } });

    fireEvent.click(saveBtn);

    await waitFor(() => expect(onContinue).toHaveBeenCalled());

    const payload = onContinue.mock.calls[0][0] as RegistroCortes;
    expect(payload.servicios[0]).toEqual({ tipo: "corte", efectivo: 5, mercado_pago: 1 });
  });
});
