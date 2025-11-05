import { readRegistrosDiaKV } from '@/utils/registrosDiaFromDB';
import type { RegistroCortesDia } from '@/types/registroCortes';
import DeleteRegistroDiaButton from '@/components/DeleteRegistroDiaButton';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Registros diarios | OG Barber' };

function calcularTotales(dia: RegistroCortesDia) {
  const PRECIOS = { corte: 12000, corte_con_barba: 13000 } as const;
  let efectivo = 0;
  let mp = 0;
  let especiales = 0;
  let retirosEfectivo = 0;
  let retirosMP = 0;
  dia.barberos.forEach((b) => {
    b.servicios.forEach((s) => {
      const precio = PRECIOS[s.tipo];
      efectivo += s.efectivo * precio;
      mp += s.mercado_pago * precio;
    });
    // Sumar cortes especiales
    if (b.cortesEspeciales) {
      especiales += b.cortesEspeciales.reduce((acc, c) => acc + c.monto, 0);
    }
    // Sumar retiros
    if (b.retiroEfectivo) {
      retirosEfectivo += b.retiroEfectivo;
    }
    if (b.retiroMP) {
      retirosMP += b.retiroMP;
    }
  });
  return { efectivo, mp, especiales, retirosEfectivo, retirosMP };
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
            const { efectivo, mp, especiales, retirosEfectivo, retirosMP } = calcularTotales(dia);
            const total = efectivo + mp + especiales - retirosEfectivo - retirosMP;
            // Forzamos la zona horaria a UTC para evitar el desfase de un día
            const fechaFormateada = new Date(dia.fecha).toLocaleDateString(
              'es-AR',
              { timeZone: 'UTC' }
            );
            // Calcular resumen de servicios
            let totalCortes = 0;
            let totalCorteYBarba = 0;
            dia.barberos.forEach((b) => {
              b.servicios.forEach((s) => {
                if (s.tipo === 'corte') {
                  totalCortes += s.efectivo + s.mercado_pago;
                } else if (s.tipo === 'corte_con_barba') {
                  totalCorteYBarba += s.efectivo + s.mercado_pago;
                }
              });
            });

            return (
              <li key={idx} className="border rounded p-4">
                <details className="cursor-pointer">
                  <summary className="flex justify-between items-center font-medium">
                    <span className="font-semibold text-xl">
                      {fechaFormateada}
                    </span>
                    <span className="font-semibold text-lg">
                      ${total.toLocaleString('es-AR')}
                    </span>
                  </summary>
                  <div className="mt-3 text-sm text-gray-600 border-b pb-2 mb-3">
                    <p>
                      {dia.barberos.length} barbero{dia.barberos.length !== 1 ? 's' : ''} •{' '}
                      {totalCortes > 0 && `${totalCortes} corte${totalCortes !== 1 ? 's' : ''}`}
                      {totalCortes > 0 && totalCorteYBarba > 0 && ' • '}
                      {totalCorteYBarba > 0 && `${totalCorteYBarba} corte${totalCorteYBarba !== 1 ? 's' : ''} y barba`}
                    </p>
                  </div>
                  <div className="flex gap-4 mt-2">
                    <a
                      href={`/carga-rapida?fecha=${encodeURIComponent(dia.fecha)}`}
                      className="btn btn-secondary text-xs"
                    >
                      Editar día
                    </a>
                    <DeleteRegistroDiaButton fecha={dia.fecha} />
                  </div>

                  <div className="mt-3 pl-4">
                    {dia.barberos.map((b, i) => {
                      const PRECIOS_BARBERO = { corte: 12000, corte_con_barba: 13000 } as const;
                      let totalBarbero = 0;
                      b.servicios.forEach((s) => {
                        const precio = PRECIOS_BARBERO[s.tipo];
                        totalBarbero += (s.efectivo + s.mercado_pago) * precio;
                      });
                      if (b.cortesEspeciales) {
                        totalBarbero += b.cortesEspeciales.reduce((acc, c) => acc + c.monto, 0);
                      }
                      if (b.retiroEfectivo) totalBarbero -= b.retiroEfectivo;
                      if (b.retiroMP) totalBarbero -= b.retiroMP;

                      return (
                        <div key={i} className="mb-3 pb-3 border-b last:border-b-0">
                          <h3 className="font-semibold">{b.barbero}</h3>
                          <ul className="text-sm ml-4 list-disc">
                            {b.servicios.map((s, j) => {
                              const precio = PRECIOS_BARBERO[s.tipo];
                              const cantidadTotal = s.efectivo + s.mercado_pago;
                              const totalServicio = cantidadTotal * precio;
                              return (
                                <li key={j}>
                                  {s.tipo.replace('_', ' ')}: {cantidadTotal} — Total: ${totalServicio.toLocaleString('es-AR')}
                                </li>
                              );
                            })}
                          </ul>
                          {b.cortesEspeciales &&
                            b.cortesEspeciales.length > 0 && (
                              <div className="mt-2 ml-4">
                                <p className="text-sm font-medium">
                                  Cortes especiales:
                                </p>
                                <ul className="text-sm ml-4 list-disc">
                                  {b.cortesEspeciales.map((c, j) => (
                                    <li key={j}>
                                      ${c.monto.toLocaleString('es-AR')}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          {(b.retiroEfectivo || b.retiroMP) && (
                            <div className="mt-2 ml-4">
                              <p className="text-sm font-medium">Retiros:</p>
                              <ul className="text-sm ml-4 list-disc">
                                {b.retiroEfectivo && (
                                  <li>Efectivo: ${b.retiroEfectivo.toLocaleString('es-AR')}</li>
                                )}
                                {b.retiroMP && (
                                  <li>MP: ${b.retiroMP.toLocaleString('es-AR')}</li>
                                )}
                              </ul>
                            </div>
                          )}
                          <div className="mt-2 ml-4">
                            <p className="text-sm font-semibold">
                              Total barbero: ${totalBarbero.toLocaleString('es-AR')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
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
