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
  it('muestra totales correctos para efectivo y MP', async () => {
    render(await RegistrosDiaPage());

    // Totales esperados con nuevos precios
    // Joaco: 5 cortes ef * 12000 + 2 cortes MP * 12000 + 2 corte_y_barba MP * 13000 = 60000 + 24000 + 26000 = 110000
    // Elias: 2 cortes ef * 12000 + 7 cortes MP * 12000 + 2 corte_y_barba MP * 13000 = 24000 + 84000 + 26000 = 134000
    const efectivoTotalCalc = 5 * 12000 + 2 * 12000; // 7 cortes efectivo = 84000
    const mpTotalCalc = 2 * 12000 + 2 * 13000 + 7 * 12000 + 2 * 13000; // MP = 24000 + 26000 + 84000 + 26000 = 160000
    const totalCalc = efectivoTotalCalc + mpTotalCalc; // 84000 + 160000 = 244000

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
