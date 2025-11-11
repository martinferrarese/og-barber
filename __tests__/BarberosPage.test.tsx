import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import BarberosPage from "@/app/barberos/page";

jest.mock("@/utils/barberosFromDB", () => {
  return {
    readBarberosKV: jest.fn(),
    deleteBarberoKV: jest.fn(),
  };
});

const { readBarberosKV } = jest.requireMock("@/utils/barberosFromDB");

const mockFetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ ok: true }),
  }),
);

global.fetch = mockFetch as unknown as typeof fetch;
global.alert = jest.fn();
global.confirm = jest.fn(() => true); // Por defecto confirma las acciones

let rerenderPage: (() => Promise<void>) | null = null;

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: () => {
      if (rerenderPage) void rerenderPage();
    },
  }),
}));

describe("BarberosPage", () => {
  beforeEach(() => {
    mockFetch.mockClear();
    (global.alert as jest.Mock).mockClear();
    (global.confirm as jest.Mock).mockReturnValue(true);
  });

  it("muestra al nuevo barbero después de agregarlo", async () => {
    readBarberosKV.mockResolvedValueOnce(["Juan"]);

    const { rerender, findByText } = await act(async () => {
      const res = await BarberosPage();
      return render(<>{res}</>);
    });

    rerenderPage = async () => {
      readBarberosKV.mockResolvedValueOnce(["Juan", "Carlos"]);
      await act(async () => {
        const ui = await BarberosPage();
        rerender(<>{ui}</>);
      });
    };

    expect(await findByText("Juan")).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/nuevo barbero/i);
    const button = screen.getByRole("button", { name: /agregar/i });

    await userEvent.type(input, "Carlos");
    await userEvent.click(button);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/barberos",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: "Carlos" }),
      }),
    );

    expect(await findByText("Carlos")).toBeInTheDocument();
  });

  it("muestra mensaje cuando la lista está vacía", async () => {
    readBarberosKV.mockResolvedValueOnce([]);

    await act(async () => {
      const res = await BarberosPage();
      render(<>{res}</>);
    });

    expect(
      screen.getByText(/aún no hay barberos/i),
    ).toBeInTheDocument();
  });

  it("elimina un barbero y actualiza la lista", async () => {
    // Lista inicial con dos barberos
    readBarberosKV.mockResolvedValueOnce(["Juan", "Carlos"]);

    const { rerender, findByText, queryByText } = await act(async () => {
      const res = await BarberosPage();
      return render(<>{res}</>);
    });

    // Configurar refresh para devolver solo uno
    rerenderPage = async () => {
      readBarberosKV.mockResolvedValueOnce(["Juan"]);
      await act(async () => {
        const ui = await BarberosPage();
        rerender(<>{ui}</>);
      });
    };

    // Deben aparecer ambos nombres inicialmente
    expect(await findByText("Carlos")).toBeInTheDocument();
    expect(await findByText("Juan")).toBeInTheDocument();

    // Hacer clic en eliminar Carlos
    const deleteBtn = screen
      .getAllByRole("button", { name: /eliminar/i })
      .find((btn) =>
        btn.parentElement?.textContent?.includes("Carlos"),
      ) as HTMLButtonElement;

    await act(async () => {
      await userEvent.click(deleteBtn);

      // Después del clic, el botón debe mostrar estado de carga y estar deshabilitado
      expect(deleteBtn).toBeDisabled();
      expect(deleteBtn).toHaveTextContent(/eliminando/i);

      // Se debe haber hecho la petición DELETE
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/barberos",
        expect.objectContaining({
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre: "Carlos" }),
        }),
      );

      if (rerenderPage) await rerenderPage();
    });

    // Carlos ya no debe estar, Juan sí
    expect(queryByText("Carlos")).not.toBeInTheDocument();
    expect(screen.getByText("Juan")).toBeInTheDocument();
  });
});
