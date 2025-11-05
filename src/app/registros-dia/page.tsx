import { readRegistrosDiaKV } from '@/utils/registrosDiaFromDB';
import { readPreciosKV } from '@/utils/preciosFromDB';
import type { RegistroCortesDia } from '@/types/registroCortes';
import DeleteRegistroDiaButton from '@/components/DeleteRegistroDiaButton';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Registros diarios | OG Barber' };

function calcularTotales(dia: RegistroCortesDia, precios: { corte: number; corteYBarba: number }) {
  const PRECIOS = { corte: precios.corte, corte_con_barba: precios.corteYBarba } as const;
  let cortes = 0; // Suma de todos los cortes sin diferenciar MP/efectivo
  let especiales = 0;
  let retirosEfectivo = 0;
  let retirosMP = 0;
  dia.barberos.forEach((b) => {
    b.servicios.forEach((s) => {
      const precio = PRECIOS[s.tipo];
      const cantidadTotal = s.efectivo + s.mercado_pago;
      cortes += cantidadTotal * precio;
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
  return { cortes, especiales, retirosEfectivo, retirosMP };
}

export { calcularTotales };

export default async function RegistrosDiaPage() {
  const registros = await readRegistrosDiaKV();
  const precios = await readPreciosKV();
  registros.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Registros diarios</h1>

      {registros.length === 0 ? (
        <p className="text-sm text-gray-500">Aún no hay registros.</p>
      ) : (
        <ul className="space-y-4">
          {registros.map((dia, idx) => {
            const { cortes, especiales, retirosEfectivo, retirosMP } = calcularTotales(dia, precios);
            // Calcular total: cortes + especiales - retiros + ingresos adicionales - egresos
            const ingresosAdicionales = dia.ingresos 
              ? dia.ingresos.insumos + dia.ingresos.color + dia.ingresos.bebidas
              : 0;
            // Calcular total de egresos
            const totalEgresos = dia.egresos
              ? dia.egresos.efectivo.insumos + dia.egresos.efectivo.gastos + dia.egresos.mp.insumos + dia.egresos.mp.gastos
              : 0;
            const total = cortes + especiales - retirosEfectivo - retirosMP + ingresosAdicionales - totalEgresos;
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
                  <div className="flex justify-between items-center mt-2">
                    <h3 className="font-semibold">Cortes y retiros</h3>
                    <div className="flex gap-4">
                      <a
                        href={`/carga-rapida?fecha=${encodeURIComponent(dia.fecha)}`}
                        className="btn btn-secondary text-xs"
                      >
                        Editar día
                      </a>
                      <DeleteRegistroDiaButton fecha={dia.fecha} />
                    </div>
                  </div>

                  <div className="mt-3 pl-4">
                    {dia.barberos.map((b, i) => {
                      const PRECIOS_BARBERO = { corte: precios.corte, corte_con_barba: precios.corteYBarba } as const;
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

                  {/* Sección de Ingresos */}
                  {dia.ingresos && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">Ingresos</h3>
                        <a
                          href={`/ingreso-efectivo?fecha=${encodeURIComponent(dia.fecha)}`}
                          className="btn btn-secondary text-xs"
                        >
                          Editar ingresos
                        </a>
                      </div>
                      <ul className="text-sm ml-4 list-disc space-y-1">
                        <li>
                          Corte efectivo: ${dia.ingresos.corteEfectivo.toLocaleString('es-AR')}
                        </li>
                        <li>
                          Insumos: ${dia.ingresos.insumos.toLocaleString('es-AR')}
                        </li>
                        <li>
                          Color: ${dia.ingresos.color.toLocaleString('es-AR')}
                        </li>
                        <li>
                          Bebidas: ${dia.ingresos.bebidas.toLocaleString('es-AR')}
                        </li>
                      </ul>
                      <div className="mt-2 ml-4">
                        <p className="text-sm font-semibold">
                          Total ingresos: ${(dia.ingresos.corteEfectivo + dia.ingresos.insumos + dia.ingresos.color + dia.ingresos.bebidas).toLocaleString('es-AR')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Sección de Egresos */}
                  {dia.egresos && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">Egresos</h3>
                        <a
                          href={`/egresos?fecha=${encodeURIComponent(dia.fecha)}`}
                          className="btn btn-secondary text-xs"
                        >
                          Editar egresos
                        </a>
                      </div>
                      <div className="ml-4">
                        <div className="mb-2">
                          <p className="text-sm font-medium mb-1">Efectivo:</p>
                          <ul className="text-sm ml-4 list-disc space-y-1">
                            <li>
                              Insumos: ${dia.egresos.efectivo.insumos.toLocaleString('es-AR')}
                            </li>
                            <li>
                              Gastos: ${dia.egresos.efectivo.gastos.toLocaleString('es-AR')}
                            </li>
                          </ul>
                          <p className="text-sm font-semibold mt-1 ml-4">
                            Total efectivo: ${(dia.egresos.efectivo.insumos + dia.egresos.efectivo.gastos).toLocaleString('es-AR')}
                          </p>
                        </div>
                        <div className="mb-2">
                          <p className="text-sm font-medium mb-1">MP:</p>
                          <ul className="text-sm ml-4 list-disc space-y-1">
                            <li>
                              Insumos: ${dia.egresos.mp.insumos.toLocaleString('es-AR')}
                            </li>
                            <li>
                              Gastos: ${dia.egresos.mp.gastos.toLocaleString('es-AR')}
                            </li>
                          </ul>
                          <p className="text-sm font-semibold mt-1 ml-4">
                            Total MP: ${(dia.egresos.mp.insumos + dia.egresos.mp.gastos).toLocaleString('es-AR')}
                          </p>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm font-semibold">
                            Total egresos: ${(dia.egresos.efectivo.insumos + dia.egresos.efectivo.gastos + dia.egresos.mp.insumos + dia.egresos.mp.gastos).toLocaleString('es-AR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
