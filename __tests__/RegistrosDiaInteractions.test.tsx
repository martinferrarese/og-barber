import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

jest.mock("@/utils/registrosDiaFromDB", () => ({
  readRegistrosDiaKV: jest.fn(),
}));

jest.mock("@/utils/preciosFromDB", () => ({
  readPreciosKV: jest.fn().mockResolvedValue({ corte: 12000, corteYBarba: 13000 }),
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
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { readPreciosKV } = require("@/utils/preciosFromDB");
    (readPreciosKV as jest.Mock).mockResolvedValue({ corte: 12000, corteYBarba: 13000 });

    const element = await RegistrosDiaPage();
    render(element);

    await waitFor(() => {
      const editLink = screen.getByRole("link", { name: /Editar día/i });
      expect(editLink).toHaveAttribute("href", "/carga-rapida?fecha=2025-09-17");
    });
  });

  it("muestra enlace de edición de ingresos con fecha correcta", async () => {
    const mockDataConIngresos: RegistroCortesDia[] = [
      {
        fecha: "2025-09-17",
        barberos: [
          {
            fecha: "2025-09-17",
            barbero: "Joaco",
            servicios: [{ tipo: "corte", efectivo: 1, mercado_pago: 0 }],
          },
        ],
        ingresos: {
          corteEfectivo: 12000,
          insumos: 5000,
          color: 3000,
          bebidas: 2000,
        },
      },
    ];
    (readRegistrosDiaKV as jest.Mock).mockResolvedValue(mockDataConIngresos);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { readPreciosKV } = require("@/utils/preciosFromDB");
    (readPreciosKV as jest.Mock).mockResolvedValue({ corte: 12000, corteYBarba: 13000 });

    const element = await RegistrosDiaPage();
    render(element);

    await waitFor(() => {
      const editIngresosLink = screen.getByRole("link", { name: /Editar ingresos/i });
      expect(editIngresosLink).toHaveAttribute("href", "/ingreso-efectivo?fecha=2025-09-17");
    });
  });

  it("muestra ingresos cuando existen", async () => {
    const mockDataConIngresos: RegistroCortesDia[] = [
      {
        fecha: "2025-09-17",
        barberos: [
          {
            fecha: "2025-09-17",
            barbero: "Joaco",
            servicios: [{ tipo: "corte", efectivo: 1, mercado_pago: 0 }],
          },
        ],
        ingresos: {
          corteEfectivo: 12000,
          insumos: 5000,
          color: 3000,
          bebidas: 2000,
        },
      },
    ];
    (readRegistrosDiaKV as jest.Mock).mockResolvedValue(mockDataConIngresos);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { readPreciosKV } = require("@/utils/preciosFromDB");
    (readPreciosKV as jest.Mock).mockResolvedValue({ corte: 12000, corteYBarba: 13000 });

    const element = await RegistrosDiaPage();
    const { container } = render(element);

    // Los ingresos están dentro de un details. Verificar que el contenido está en el DOM
    // (aunque el details esté cerrado, el contenido está presente)
    await waitFor(() => {
      // Buscar directamente en el texto del contenedor
      const textoCompleto = container.textContent || "";
      expect(textoCompleto).toMatch(/Ingresos/i);
      expect(textoCompleto).toMatch(/Cortes:/i);
      expect(textoCompleto).toMatch(/Insumos:/i);
      expect(textoCompleto).toMatch(/Color:/i);
      expect(textoCompleto).toMatch(/Bebidas:/i);
    });
  });

  it("muestra enlace de edición de egresos con fecha correcta", async () => {
    const mockDataConEgresos: RegistroCortesDia[] = [
      {
        fecha: "2025-09-17",
        barberos: [
          {
            fecha: "2025-09-17",
            barbero: "Joaco",
            servicios: [{ tipo: "corte", efectivo: 1, mercado_pago: 0 }],
          },
        ],
        egresos: {
          efectivo: {
            insumos: 5000,
            gastos: 3000,
          },
          mp: {
            insumos: 2000,
            gastos: 1000,
          },
        },
      },
    ];
    (readRegistrosDiaKV as jest.Mock).mockResolvedValue(mockDataConEgresos);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { readPreciosKV } = require("@/utils/preciosFromDB");
    (readPreciosKV as jest.Mock).mockResolvedValue({ corte: 12000, corteYBarba: 13000 });

    const element = await RegistrosDiaPage();
    render(element);

    await waitFor(() => {
      const editEgresosLink = screen.getByRole("link", { name: /Editar egresos/i });
      expect(editEgresosLink).toHaveAttribute("href", "/egresos?fecha=2025-09-17");
    });
  });

  it("muestra egresos cuando existen", async () => {
    const mockDataConEgresos: RegistroCortesDia[] = [
      {
        fecha: "2025-09-17",
        barberos: [
          {
            fecha: "2025-09-17",
            barbero: "Joaco",
            servicios: [{ tipo: "corte", efectivo: 1, mercado_pago: 0 }],
          },
        ],
        egresos: {
          efectivo: {
            insumos: 5000,
            gastos: 3000,
          },
          mp: {
            insumos: 2000,
            gastos: 1000,
          },
        },
      },
    ];
    (readRegistrosDiaKV as jest.Mock).mockResolvedValue(mockDataConEgresos);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { readPreciosKV } = require("@/utils/preciosFromDB");
    (readPreciosKV as jest.Mock).mockResolvedValue({ corte: 12000, corteYBarba: 13000 });

    const element = await RegistrosDiaPage();
    const { container } = render(element);

    await waitFor(() => {
      const textoCompleto = container.textContent || "";
      expect(textoCompleto).toMatch(/Egresos/i);
      expect(textoCompleto).toMatch(/Efectivo:/i);
      expect(textoCompleto).toMatch(/MP:/i);
      expect(textoCompleto).toMatch(/Total egresos:/i);
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
