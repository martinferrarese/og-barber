import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import RegistrosDiaPage from '@/app/registros-dia/page';
import type { RegistroCortesDia } from '@/types/registroCortes';

jest.mock('@/utils/registrosDiaFromDB', () => {
  const mockData: RegistroCortesDia[] = [
    {
      fecha: '2025-09-16',
      barberos: [
        {
          fecha: '2025-09-16',
          barbero: 'Joaco',
          servicios: [
            { tipo: 'corte', efectivo: 5, mercado_pago: 2 },
            { tipo: 'corte_con_barba', efectivo: 0, mercado_pago: 2 },
          ],
        },
        {
          fecha: '2025-09-16',
          barbero: 'Elias',
          servicios: [
            { tipo: 'corte', efectivo: 2, mercado_pago: 7 },
            { tipo: 'corte_con_barba', efectivo: 0, mercado_pago: 2 },
          ],
        },
      ],
    },
  ];
  return {
    readRegistrosDiaKV: jest.fn().mockResolvedValue(mockData),
  };
});

jest.mock('@/utils/preciosFromDB', () => ({
  readPreciosKV: jest.fn().mockResolvedValue({ corte: 12000, corteYBarba: 13000 }),
}));

describe('RegistrosDiaPage', () => {
  it('muestra totales correctos sin diferenciar MP/efectivo', async () => {
    render(await RegistrosDiaPage());

    // Totales esperados: suma de cantidad × precio sin diferenciar MP/efectivo
    // Joaco: (5+2) cortes * 12000 + (0+2) corte_y_barba * 13000 = 84000 + 26000 = 110000
    // Elias: (2+7) cortes * 12000 + (0+2) corte_y_barba * 13000 = 108000 + 26000 = 134000
    // Total: 110000 + 134000 = 244000
    const totalCalc = (5 + 2) * 12000 + (0 + 2) * 13000 + (2 + 7) * 12000 + (0 + 2) * 13000; // 244000

    await waitFor(() => {
      const fechaFormateada = new Date('2025-09-16').toLocaleDateString('es-AR', { timeZone: 'UTC' });
      expect(screen.getByText(fechaFormateada)).toBeInTheDocument();
      // Ahora solo muestra fecha y total en el resumen
      expect(
        screen.getByText((text) =>
          text.includes(`$${totalCalc.toLocaleString('es-AR')}`),
        ),
      ).toBeInTheDocument();
    });
  });
});
