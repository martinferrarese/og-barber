import { readRegistrosDiaKV } from '@/utils/registrosDiaFromDB';
import type { RegistroCortesDia } from '@/types/registroCortes';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Registros diarios | OG Barber' };

function calcularTotales(dia: RegistroCortesDia) {
  const PRECIOS = { corte: 11000, corte_con_barba: 12000 } as const;
  let efectivo = 0;
  let mp = 0;
  dia.barberos.forEach((b) => {
    b.servicios.forEach((s) => {
      const precio = PRECIOS[s.tipo];
      efectivo += s.efectivo * precio;
      mp += s.mercado_pago * precio;
    });
  });
  return { efectivo, mp };
}

export { calcularTotales };

export default async function RegistrosDiaPage() {
  const registros = await readRegistrosDiaKV();
  registros.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Registros diarios</h1>

      {registros.length === 0 ? (
        <p className="text-sm text-gray-500">Aún no hay registros.</p>
      ) : (
        <ul className="space-y-4">
          {registros.map((dia, idx) => {
            const { efectivo, mp } = calcularTotales(dia);
            const total = efectivo + mp;
            const fechaFormateada = new Date(dia.fecha).toLocaleDateString('es-AR');
            return (
              <li key={idx} className="border rounded p-4">
                <details className="cursor-pointer">
                  <summary className="flex flex-col font-medium gap-1">
                    <span className="font-semibold text-xl">{fechaFormateada}</span>
                    <span>
                      Ef. ${efectivo.toLocaleString('es-AR')} / MP ${mp.toLocaleString('es-AR')}
                    </span>
                    <span className="font-semibold">Total: ${total.toLocaleString('es-AR')}</span>
                  </summary>

                  <div className="mt-3 pl-4">
                    {dia.barberos.map((b, i) => (
                      <div key={i} className="mb-3">
                        <h3 className="font-semibold">{b.barbero}</h3>
                        <ul className="text-sm ml-4 list-disc">
                          {b.servicios.map((s, j) => (
                            <li key={j}>
                              {s.tipo.replace('_', ' ')} — Ef: {s.efectivo}, MP: {s.mercado_pago}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
