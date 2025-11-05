import { readPreciosKV, writePreciosKV } from "@/utils/preciosFromDB";
import { kv } from "@vercel/kv";

jest.mock("@vercel/kv", () => ({
  kv: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

describe("preciosFromDB", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("readPreciosKV", () => {
    it("retorna precios guardados si existen", async () => {
      const preciosGuardados = { corte: 15000, corteYBarba: 16000 };
      (kv.get as jest.Mock).mockResolvedValue(preciosGuardados);

      const precios = await readPreciosKV();

      expect(precios).toEqual(preciosGuardados);
      expect(kv.get).toHaveBeenCalledWith("precios");
    });

    it("retorna precios por defecto si no existen y los guarda", async () => {
      (kv.get as jest.Mock).mockResolvedValue(null);

      const precios = await readPreciosKV();

      expect(precios).toEqual({ corte: 12000, corteYBarba: 13000 });
      expect(kv.set).toHaveBeenCalledWith("precios", { corte: 12000, corteYBarba: 13000 });
    });
  });

  describe("writePreciosKV", () => {
    it("guarda los precios correctamente", async () => {
      const precios = { corte: 15000, corteYBarba: 16000 };

      await writePreciosKV(precios);

      expect(kv.set).toHaveBeenCalledWith("precios", precios);
    });
  });
});

