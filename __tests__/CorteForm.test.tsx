import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CorteForm from "@/components/CorteForm";

// Mock fetch
const mockFetch = jest.fn(() =>
  Promise.resolve({ json: () => Promise.resolve({ ok: true }) }),
);

global.fetch = mockFetch as unknown as typeof fetch;

describe("CorteForm", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it("envía los datos correctamente", async () => {
    render(<CorteForm />);
    const selectTipo = screen.getByLabelText(/tipo de servicio/i);
    const inputBarbero = screen.getByLabelText(/barbero/i);
    const submit = screen.getByRole("button", { name: /guardar corte/i });

    await userEvent.selectOptions(selectTipo, "corte_con_barba");
    await userEvent.type(inputBarbero, "Juan");
    await userEvent.click(submit);

    expect(mockFetch).toHaveBeenCalledTimes(1);
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
});
