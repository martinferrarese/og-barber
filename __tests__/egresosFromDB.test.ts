import { readEgresosKV, writeEgresosKV } from "@/utils/egresosFromDB";
import { readRegistrosDiaKV, upsertRegistroDiaKV } from "@/utils/registrosDiaFromDB";
import type { RegistroCortesDia, Egresos } from "@/types/registroCortes";

jest.mock("@/utils/registrosDiaFromDB", () => ({
  readRegistrosDiaKV: jest.fn(),
  upsertRegistroDiaKV: jest.fn(),
}));

describe("egresosFromDB", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("readEgresosKV", () => {
    it("retorna los egresos si existen", async () => {
      const mockEgresos: Egresos = {
        efectivo: {
          insumos: 5000,
          gastos: 3000,
        },
        mp: {
          insumos: 2000,
          gastos: 1000,
        },
      };

      const mockRegistro: RegistroCortesDia[] = [
        {
          fecha: "2025-09-16",
          barberos: [],
          egresos: mockEgresos,
        },
      ];

      (readRegistrosDiaKV as jest.Mock).mockResolvedValue(mockRegistro);

      const egresos = await readEgresosKV("2025-09-16");

      expect(egresos).toEqual(mockEgresos);
    });

    it("retorna null si no hay egresos", async () => {
      const mockRegistro: RegistroCortesDia[] = [
        {
          fecha: "2025-09-16",
          barberos: [],
        },
      ];

      (readRegistrosDiaKV as jest.Mock).mockResolvedValue(mockRegistro);

      const egresos = await readEgresosKV("2025-09-16");

      expect(egresos).toBeNull();
    });
  });

  describe("writeEgresosKV", () => {
    it("actualiza egresos en registro existente", async () => {
      const mockRegistro: RegistroCortesDia = {
        fecha: "2025-09-16",
        barberos: [
          {
            fecha: "2025-09-16",
            barbero: "Joaco",
            servicios: [{ tipo: "corte", efectivo: 1, mercado_pago: 0 }],
          },
        ],
      };

      (readRegistrosDiaKV as jest.Mock).mockResolvedValue([mockRegistro]);

      const nuevosEgresos: Egresos = {
        efectivo: {
          insumos: 5000,
          gastos: 3000,
        },
        mp: {
          insumos: 2000,
          gastos: 1000,
        },
      };

      await writeEgresosKV("2025-09-16", nuevosEgresos);

      expect(upsertRegistroDiaKV).toHaveBeenCalledWith({
        ...mockRegistro,
        egresos: nuevosEgresos,
      });
    });

    it("crea nuevo registro si no existe", async () => {
      (readRegistrosDiaKV as jest.Mock).mockResolvedValue([]);

      const nuevosEgresos: Egresos = {
        efectivo: {
          insumos: 5000,
          gastos: 3000,
        },
        mp: {
          insumos: 2000,
          gastos: 1000,
        },
      };

      await writeEgresosKV("2025-09-16", nuevosEgresos);

      expect(upsertRegistroDiaKV).toHaveBeenCalledWith({
        fecha: "2025-09-16",
        barberos: [],
        egresos: nuevosEgresos,
      });
    });
  });
});

