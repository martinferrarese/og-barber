/**
 * @jest-environment node
 */

import { GET, POST } from "@/app/api/precios/route";
import { readPreciosKV, writePreciosKV } from "@/utils/preciosFromDB";

jest.mock("@/utils/preciosFromDB", () => ({
  readPreciosKV: jest.fn(),
  writePreciosKV: jest.fn(),
}));

describe("API /api/precios", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("retorna los precios guardados", async () => {
      const preciosMock = { corte: 15000, corteYBarba: 16000 };
      (readPreciosKV as jest.Mock).mockResolvedValue(preciosMock);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(preciosMock);
      expect(readPreciosKV).toHaveBeenCalled();
    });
  });

  describe("POST", () => {
    it("guarda precios válidos", async () => {
      const precios = { corte: 15000, corteYBarba: 16000 };
      const request = new Request("http://localhost/api/precios", {
        method: "POST",
        body: JSON.stringify(precios),
        headers: { "Content-Type": "application/json" },
      });

      (writePreciosKV as jest.Mock).mockResolvedValue(undefined);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ ok: true });
      expect(writePreciosKV).toHaveBeenCalledWith(precios);
    });

    it("rechaza precios inválidos (no son números)", async () => {
      const preciosInvalidos = { corte: "15000", corteYBarba: 16000 };
      const request = new Request("http://localhost/api/precios", {
        method: "POST",
        body: JSON.stringify(preciosInvalidos),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Precios inválidos");
      expect(writePreciosKV).not.toHaveBeenCalled();
    });

    it("rechaza precios negativos", async () => {
      const preciosNegativos = { corte: -1000, corteYBarba: 16000 };
      const request = new Request("http://localhost/api/precios", {
        method: "POST",
        body: JSON.stringify(preciosNegativos),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Los precios no pueden ser negativos");
      expect(writePreciosKV).not.toHaveBeenCalled();
    });
  });
});

