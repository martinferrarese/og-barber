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

describe('RegistrosDiaPage', () => {
  it('muestra totales correctos para efectivo y MP', async () => {
    render(await RegistrosDiaPage());

    // Totales esperados
    const efectivoTotalCalc = 5 * 11000 + 2 * 11000; // 7 cortes efectivo
    const mpTotalCalc = 2 * 11000 + 2 * 12000 + 7 * 11000 + 2 * 12000; // 13 pagos MP
    const totalCalc = efectivoTotalCalc + mpTotalCalc;

    await waitFor(() => {
      const fechaFormateada = new Date('2025-09-16').toLocaleDateString('es-AR', { timeZone: 'UTC' });
      expect(screen.getByText(fechaFormateada)).toBeInTheDocument();
      expect(
        screen.getByText((text) =>
          text.includes(`Total: $${totalCalc.toLocaleString('es-AR')}`),
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText((t) =>
          t.includes(`Ef. $${efectivoTotalCalc.toLocaleString('es-AR')}`),
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText((t) =>
          t.includes(`MP $${mpTotalCalc.toLocaleString('es-AR')}`),
        ),
      ).toBeInTheDocument();
    });
  });
});
