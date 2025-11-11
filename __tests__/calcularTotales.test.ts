import { calcularTotales } from '@/app/registros-dia/page';
import type { RegistroCortesDia } from '@/types/registroCortes';

describe('calcularTotales', () => {
  it('suma cortes especiales al total', () => {
    const dia: RegistroCortesDia = {
      fecha: '2025-09-16',
      barberos: [
        {
          fecha: '2025-09-16',
          barbero: 'Joaco',
          servicios: [{ tipo: 'corte', cantidad: 3, precio: 12000 }],
          cortesEspeciales: [{ monto: 5000 }, { monto: 3000 }],
        },
      ],
    };

    const { cortes, especiales } = calcularTotales(dia);

    expect(cortes).toBe(36000); // 3 * 12000 = 36000
    expect(especiales).toBe(8000); // 5000 + 3000
  });

  it('maneja undefined en cortesEspeciales', () => {
    const dia: RegistroCortesDia = {
      fecha: '2025-09-16',
      barberos: [
        {
          fecha: '2025-09-16',
          barbero: 'Joaco',
          servicios: [{ tipo: 'corte', cantidad: 3, precio: 12000 }],
          // Sin cortesEspeciales
        },
      ],
    };

    const result = calcularTotales(dia);

    expect(result.especiales).toBe(0);
  });

  it('maneja array vacío de cortesEspeciales', () => {
    const dia: RegistroCortesDia = {
      fecha: '2025-09-16',
      barberos: [
        {
          fecha: '2025-09-16',
          barbero: 'Joaco',
          servicios: [{ tipo: 'corte', cantidad: 3, precio: 12000 }],
          cortesEspeciales: [],
        },
      ],
    };

    const result = calcularTotales(dia);

    expect(result.especiales).toBe(0);
  });

  it('suma cortes especiales de múltiples barberos', () => {
    const dia: RegistroCortesDia = {
      fecha: '2025-09-16',
      barberos: [
        {
          fecha: '2025-09-16',
          barbero: 'Joaco',
          servicios: [{ tipo: 'corte', cantidad: 3, precio: 12000 }],
          cortesEspeciales: [{ monto: 5000 }],
        },
        {
          fecha: '2025-09-16',
          barbero: 'Elias',
          servicios: [{ tipo: 'corte', cantidad: 3, precio: 12000 }],
          cortesEspeciales: [{ monto: 8000 }, { monto: 2000 }],
        },
      ],
    };

    const result = calcularTotales(dia);

    // Cortes: 3*12000 + 3*12000 = 36000 + 36000 = 72000
    expect(result.cortes).toBe(72000);
    // Especiales: 5000 + 8000 + 2000 = 15000
    expect(result.especiales).toBe(15000);
  });

  it('calcula correctamente cuando un barbero tiene especiales y otro no', () => {
    const dia: RegistroCortesDia = {
      fecha: '2025-09-16',
      barberos: [
        {
          fecha: '2025-09-16',
          barbero: 'Joaco',
          servicios: [{ tipo: 'corte', cantidad: 1, precio: 12000 }],
          cortesEspeciales: [{ monto: 5000 }],
        },
        {
          fecha: '2025-09-16',
          barbero: 'Elias',
          servicios: [{ tipo: 'corte', cantidad: 1, precio: 12000 }],
          // Sin cortesEspeciales
        },
      ],
    };

    const result = calcularTotales(dia);

    expect(result.cortes).toBe(24000); // (1 + 1) * 12000 = 24000
    expect(result.especiales).toBe(5000); // solo del primero
  });

  it('incluye retiros en los totales', () => {
    const dia: RegistroCortesDia = {
      fecha: '2025-09-16',
      barberos: [
        {
          fecha: '2025-09-16',
          barbero: 'Joaco',
          servicios: [{ tipo: 'corte', cantidad: 3, precio: 12000 }],
          retiroEfectivo: 5000,
          retiroMP: 3000,
        },
      ],
    };

    const result = calcularTotales(dia);

    expect(result.cortes).toBe(36000); // 3 * 12000 = 36000
    expect(result.retirosEfectivo).toBe(5000);
    expect(result.retirosMP).toBe(3000);
  });

  it('suma retiros de múltiples barberos', () => {
    const dia: RegistroCortesDia = {
      fecha: '2025-09-16',
      barberos: [
        {
          fecha: '2025-09-16',
          barbero: 'Joaco',
          servicios: [{ tipo: 'corte', cantidad: 1, precio: 12000 }],
          retiroEfectivo: 5000,
          retiroMP: 2000,
        },
        {
          fecha: '2025-09-16',
          barbero: 'Elias',
          servicios: [{ tipo: 'corte', cantidad: 1, precio: 12000 }],
          retiroEfectivo: 3000,
          retiroMP: 1000,
        },
      ],
    };

    const result = calcularTotales(dia);

    expect(result.retirosEfectivo).toBe(8000); // 5000 + 3000
    expect(result.retirosMP).toBe(3000); // 2000 + 1000
  });

  it('maneja registros sin retiros', () => {
    const dia: RegistroCortesDia = {
      fecha: '2025-09-16',
      barberos: [
        {
          fecha: '2025-09-16',
          barbero: 'Joaco',
          servicios: [{ tipo: 'corte', cantidad: 3, precio: 12000 }],
        },
      ],
    };

    const result = calcularTotales(dia);

    expect(result.retirosEfectivo).toBe(0);
    expect(result.retirosMP).toBe(0);
  });

  it('calcula correctamente con corte y barba', () => {
    const dia: RegistroCortesDia = {
      fecha: '2025-09-16',
      barberos: [
        {
          fecha: '2025-09-16',
          barbero: 'Joaco',
          servicios: [
            { tipo: 'corte', cantidad: 3, precio: 12000 },
            { tipo: 'corte_con_barba', cantidad: 3, precio: 13000 },
          ],
        },
      ],
    };

    const result = calcularTotales(dia);

    // Cortes: 3*12000 + 3*13000 = 36000 + 39000 = 75000
    expect(result.cortes).toBe(75000);
  });

  it('preserva precios guardados al calcular totales', () => {
    const dia: RegistroCortesDia = {
      fecha: '2025-09-16',
      barberos: [
        {
          fecha: '2025-09-16',
          barbero: 'Joaco',
          servicios: [
            { tipo: 'corte', cantidad: 2, precio: 10000 }, // Precio antiguo guardado
            { tipo: 'corte_con_barba', cantidad: 1, precio: 11000 }, // Precio antiguo guardado
          ],
        },
      ],
    };

    const result = calcularTotales(dia);

    // Debe usar los precios guardados, no los actuales
    // 2*10000 + 1*11000 = 20000 + 11000 = 31000
    expect(result.cortes).toBe(31000);
  });
});
