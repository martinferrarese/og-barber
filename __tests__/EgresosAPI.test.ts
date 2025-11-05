/** @jest-environment node */
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/egresos/route';
import { readEgresosKV, writeEgresosKV } from '@/utils/egresosFromDB';

jest.mock('@/utils/egresosFromDB', () => ({
  readEgresosKV: jest.fn(),
  writeEgresosKV: jest.fn(),
}));

describe('/api/egresos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('retorna egresos si existen', async () => {
      const mockEgresos = {
        efectivo: {
          insumos: 5000,
          gastos: 3000,
        },
        mp: {
          insumos: 2000,
          gastos: 1000,
        },
      };

      (readEgresosKV as jest.Mock).mockResolvedValue(mockEgresos);

      const request = new NextRequest('http://localhost:3000/api/egresos?fecha=2025-09-16');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockEgresos);
    });

    it('retorna valores por defecto si no hay egresos', async () => {
      (readEgresosKV as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/egresos?fecha=2025-09-16');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        efectivo: {
          insumos: 0,
          gastos: 0,
        },
        mp: {
          insumos: 0,
          gastos: 0,
        },
      });
    });

    it('retorna error si falta la fecha', async () => {
      const request = new NextRequest('http://localhost:3000/api/egresos');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Fecha requerida');
    });

    it('retorna error si el formato de fecha es inválido', async () => {
      const request = new NextRequest('http://localhost:3000/api/egresos?fecha=2025/09/16');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Formato de fecha inválido. Debe ser YYYY-MM-DD');
    });
  });

  describe('POST', () => {
    it('guarda egresos correctamente', async () => {
      (writeEgresosKV as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/egresos', {
        method: 'POST',
        body: JSON.stringify({
          fecha: '2025-09-16',
          efectivo: {
            insumos: 5000,
            gastos: 3000,
          },
          mp: {
            insumos: 2000,
            gastos: 1000,
          },
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(writeEgresosKV).toHaveBeenCalledWith('2025-09-16', {
        efectivo: {
          insumos: 5000,
          gastos: 3000,
        },
        mp: {
          insumos: 2000,
          gastos: 1000,
        },
      });
    });

    it('retorna error si falta la fecha', async () => {
      const request = new NextRequest('http://localhost:3000/api/egresos', {
        method: 'POST',
        body: JSON.stringify({
          efectivo: {
            insumos: 5000,
            gastos: 3000,
          },
          mp: {
            insumos: 2000,
            gastos: 1000,
          },
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Fecha requerida');
    });

    it('retorna error si falta efectivo o mp', async () => {
      const request = new NextRequest('http://localhost:3000/api/egresos', {
        method: 'POST',
        body: JSON.stringify({
          fecha: '2025-09-16',
          efectivo: {
            insumos: 5000,
            gastos: 3000,
          },
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Efectivo y MP son requeridos');
    });

    it('retorna error si los valores no son números', async () => {
      const request = new NextRequest('http://localhost:3000/api/egresos', {
        method: 'POST',
        body: JSON.stringify({
          fecha: '2025-09-16',
          efectivo: {
            insumos: '5000',
            gastos: 3000,
          },
          mp: {
            insumos: 2000,
            gastos: 1000,
          },
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Todos los campos deben ser números');
    });

    it('asegura que los valores no sean negativos', async () => {
      (writeEgresosKV as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/egresos', {
        method: 'POST',
        body: JSON.stringify({
          fecha: '2025-09-16',
          efectivo: {
            insumos: -1000,
            gastos: 3000,
          },
          mp: {
            insumos: 2000,
            gastos: -500,
          },
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      await response.json(); // Consumir la respuesta
      expect(writeEgresosKV).toHaveBeenCalledWith('2025-09-16', {
        efectivo: {
          insumos: 0,
          gastos: 3000,
        },
        mp: {
          insumos: 2000,
          gastos: 0,
        },
      });
    });
  });
});

