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
          servicios: [{ tipo: 'corte', efectivo: 2, mercado_pago: 1 }],
          cortesEspeciales: [{ monto: 5000 }, { monto: 3000 }],
        },
      ],
    };

    const { efectivo, mp, especiales } = calcularTotales(dia);

    expect(efectivo).toBe(24000); // 2 * 12000
    expect(mp).toBe(12000); // 1 * 12000
    expect(especiales).toBe(8000); // 5000 + 3000
  });

  it('maneja undefined en cortesEspeciales', () => {
    const dia: RegistroCortesDia = {
      fecha: '2025-09-16',
      barberos: [
        {
          fecha: '2025-09-16',
          barbero: 'Joaco',
          servicios: [{ tipo: 'corte', efectivo: 2, mercado_pago: 1 }],
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
          servicios: [{ tipo: 'corte', efectivo: 2, mercado_pago: 1 }],
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
          servicios: [{ tipo: 'corte', efectivo: 3, mercado_pago: 0 }],
          cortesEspeciales: [{ monto: 5000 }],
        },
        {
          fecha: '2025-09-16',
          barbero: 'Elias',
          servicios: [{ tipo: 'corte', efectivo: 2, mercado_pago: 1 }],
          cortesEspeciales: [{ monto: 8000 }, { monto: 2000 }],
        },
      ],
    };

    const result = calcularTotales(dia);

    // Efectivo: 3*12000 + 2*12000 = 60000
    expect(result.efectivo).toBe(60000);
    // MP: 0 + 1*12000 = 12000
    expect(result.mp).toBe(12000);
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
          servicios: [{ tipo: 'corte', efectivo: 1, mercado_pago: 0 }],
          cortesEspeciales: [{ monto: 5000 }],
        },
        {
          fecha: '2025-09-16',
          barbero: 'Elias',
          servicios: [{ tipo: 'corte', efectivo: 1, mercado_pago: 0 }],
          // Sin cortesEspeciales
        },
      ],
    };

    const result = calcularTotales(dia);

    expect(result.efectivo).toBe(24000); // 2 * 12000
    expect(result.mp).toBe(0);
    expect(result.especiales).toBe(5000); // solo del primero
  });

  it('incluye retiros en los totales', () => {
    const dia: RegistroCortesDia = {
      fecha: '2025-09-16',
      barberos: [
        {
          fecha: '2025-09-16',
          barbero: 'Joaco',
          servicios: [{ tipo: 'corte', efectivo: 2, mercado_pago: 1 }],
          retiroEfectivo: 5000,
          retiroMP: 3000,
        },
      ],
    };

    const result = calcularTotales(dia);

    expect(result.efectivo).toBe(24000); // 2 * 12000
    expect(result.mp).toBe(12000); // 1 * 12000
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
          servicios: [{ tipo: 'corte', efectivo: 1, mercado_pago: 0 }],
          retiroEfectivo: 5000,
          retiroMP: 2000,
        },
        {
          fecha: '2025-09-16',
          barbero: 'Elias',
          servicios: [{ tipo: 'corte', efectivo: 1, mercado_pago: 0 }],
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
          servicios: [{ tipo: 'corte', efectivo: 2, mercado_pago: 1 }],
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
            { tipo: 'corte', efectivo: 2, mercado_pago: 1 },
            { tipo: 'corte_con_barba', efectivo: 1, mercado_pago: 2 },
          ],
        },
      ],
    };

    const result = calcularTotales(dia);

    // Efectivo: 2*12000 + 1*13000 = 37000
    expect(result.efectivo).toBe(37000);
    // MP: 1*12000 + 2*13000 = 38000
    expect(result.mp).toBe(38000);
  });
});
