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

    expect(efectivo).toBe(22000); // 2 * 11000
    expect(mp).toBe(11000); // 1 * 11000
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

    // Efectivo: 3*11000 + 2*11000 = 55000
    expect(result.efectivo).toBe(55000);
    // MP: 0 + 1*11000 = 11000
    expect(result.mp).toBe(11000);
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

    expect(result.efectivo).toBe(22000); // 2 * 11000
    expect(result.mp).toBe(0);
    expect(result.especiales).toBe(5000); // solo del primero
  });
});
