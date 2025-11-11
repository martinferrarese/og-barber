import { calcularCorteEfectivo, readIngresosKV, writeIngresosKV } from "@/utils/ingresosFromDB";
import { readRegistrosDiaKV, upsertRegistroDiaKV } from "@/utils/registrosDiaFromDB";
import type { RegistroCortesDia, Ingresos } from "@/types/registroCortes";

jest.mock("@/utils/registrosDiaFromDB", () => ({
  readRegistrosDiaKV: jest.fn(),
  upsertRegistroDiaKV: jest.fn(),
}));

describe("ingresosFromDB", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("calcularCorteEfectivo", () => {
    it("calcula correctamente el corte efectivo sumando todos los cortes", async () => {
      const mockRegistro: RegistroCortesDia[] = [
        {
          fecha: "2025-09-16",
          barberos: [
            {
              fecha: "2025-09-16",
              barbero: "Joaco",
              servicios: [
                { tipo: "corte", cantidad: 3, precio: 12000 },
                { tipo: "corte_con_barba", cantidad: 3, precio: 13000 },
              ],
            },
          ],
        },
      ];

      (readRegistrosDiaKV as jest.Mock).mockResolvedValue(mockRegistro);

      const total = await calcularCorteEfectivo("2025-09-16");

      // 3 * 12000 + 3 * 13000 = 36000 + 39000 = 75000
      expect(total).toBe(75000);
    });

    it("retorna 0 si no hay registros para la fecha", async () => {
      (readRegistrosDiaKV as jest.Mock).mockResolvedValue([]);

      const total = await calcularCorteEfectivo("2025-09-16");

      expect(total).toBe(0);
    });
  });

  describe("readIngresosKV", () => {
    it("retorna los ingresos si existen", async () => {
      const mockIngresos: Ingresos = {
        corteEfectivo: 50000,
        insumos: 5000,
        color: 3000,
        bebidas: 2000,
      };

      const mockRegistro: RegistroCortesDia[] = [
        {
          fecha: "2025-09-16",
          barberos: [],
          ingresos: mockIngresos,
        },
      ];

      (readRegistrosDiaKV as jest.Mock).mockResolvedValue(mockRegistro);

      const ingresos = await readIngresosKV("2025-09-16");

      expect(ingresos).toEqual(mockIngresos);
    });

    it("retorna null si no hay ingresos", async () => {
      const mockRegistro: RegistroCortesDia[] = [
        {
          fecha: "2025-09-16",
          barberos: [],
        },
      ];

      (readRegistrosDiaKV as jest.Mock).mockResolvedValue(mockRegistro);

      const ingresos = await readIngresosKV("2025-09-16");

      expect(ingresos).toBeNull();
    });
  });

  describe("writeIngresosKV", () => {
    it("actualiza ingresos en registro existente", async () => {
      const mockRegistro: RegistroCortesDia = {
        fecha: "2025-09-16",
        barberos: [
          {
            fecha: "2025-09-16",
            barbero: "Joaco",
            servicios: [{ tipo: "corte", cantidad: 1, precio: 12000 }],
          },
        ],
      };

      (readRegistrosDiaKV as jest.Mock).mockResolvedValue([mockRegistro]);

      const nuevosIngresos: Ingresos = {
        corteEfectivo: 12000,
        insumos: 5000,
        color: 3000,
        bebidas: 2000,
      };

      await writeIngresosKV("2025-09-16", nuevosIngresos);

      expect(upsertRegistroDiaKV).toHaveBeenCalledWith({
        ...mockRegistro,
        ingresos: nuevosIngresos,
      });
    });

    it("crea nuevo registro si no existe", async () => {
      (readRegistrosDiaKV as jest.Mock).mockResolvedValue([]);

      const nuevosIngresos: Ingresos = {
        corteEfectivo: 0,
        insumos: 5000,
        color: 3000,
        bebidas: 2000,
      };

      await writeIngresosKV("2025-09-16", nuevosIngresos);

      expect(upsertRegistroDiaKV).toHaveBeenCalledWith({
        fecha: "2025-09-16",
        barberos: [],
        ingresos: nuevosIngresos,
      });
    });
  });
});

