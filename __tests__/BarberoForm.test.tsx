import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BarberoForm from "@/components/BarberoForm";

const mockFetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ ok: true }),
  }),
);

global.fetch = mockFetch as unknown as typeof fetch;
global.alert = jest.fn();

const mockRefresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

describe("BarberoForm", () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockRefresh.mockClear();
    (global.alert as jest.Mock).mockClear();
  });

  it("envía el nombre del barbero y refresca la página", async () => {
    render(<BarberoForm />);
    const inputNombre = screen.getByPlaceholderText(/nuevo barbero/i);
    const submit = screen.getByRole("button", { name: /agregar/i });

    await userEvent.type(inputNombre, "Carlos");
    await userEvent.click(submit);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/barberos",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: "Carlos" }),
      }),
    );
    expect(mockRefresh).toHaveBeenCalledTimes(1);

    // El input debe haberse limpiado tras el envío
    expect(inputNombre).toHaveValue("");
  });

  it("no envía si el nombre está vacío", async () => {
    render(<BarberoForm />);
    const button = screen.getByRole("button", { name: /agregar/i });

    await userEvent.click(button);

    expect(mockFetch).not.toHaveBeenCalled();
  });
});
