import "@testing-library/jest-dom";

import { render, screen, waitFor, act } from "@testing-library/react";
import RegistroCortesForm from "@/components/RegistroCortesForm";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

describe("RegistroCortesForm filtrado de barberos", () => {
  const allBarberos = ["Joaco", "Pepito"];

  beforeEach(() => {
    jest.resetAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve(allBarberos),
    }) as unknown as typeof fetch;
  });

  it("excluye barberos ya cargados", async () => {
    render(
      <RegistroCortesForm barberosExcluidos={["Joaco"]} onContinue={jest.fn()} />,
    );

    await screen.findByRole("combobox", { name: /barbero/i });

    await waitFor(() => {
      expect(screen.queryByRole("option", { name: "Joaco" })).not.toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Pepito" })).toBeInTheDocument();
    });
  });

  it("muestra barbero cuando deja de estar excluido", async () => {
    const { rerender } = render(
      <RegistroCortesForm barberosExcluidos={["Joaco"]} onContinue={jest.fn()} />,
    );

    await screen.findByRole("combobox", { name: /barbero/i });

    // Ahora quitamos la exclusión y simulamos prop change
    await act(async () => {
      rerender(<RegistroCortesForm barberosExcluidos={[]} onContinue={jest.fn()} />);
    });

    await waitFor(() => {
      expect(screen.getByRole("option", { name: "Joaco" })).toBeInTheDocument();
    });
  });
});
