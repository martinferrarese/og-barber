import type { RegistroCortesDia, Ingresos } from '@/types/registroCortes';
import { readRegistrosDiaKV, upsertRegistroDiaKV } from './registrosDiaFromDB';
import { readPreciosKV } from './preciosFromDB';

/**
 * Calcula el corte efectivo sumando todos los cortes (cantidad × precio)
 * sin diferenciar entre MP y efectivo
 */
export async function calcularCorteEfectivo(fecha: string): Promise<number> {
  const registros = await readRegistrosDiaKV();
  const registroDia = registros.find((r) => r.fecha === fecha);
  
  if (!registroDia || registroDia.barberos.length === 0) {
    return 0;
  }

  const precios = await readPreciosKV();
  let total = 0;

  registroDia.barberos.forEach((barbero) => {
    barbero.servicios.forEach((servicio) => {
      const cantidadTotal = servicio.efectivo + servicio.mercado_pago;
      if (servicio.tipo === 'corte') {
        total += cantidadTotal * precios.corte;
      } else if (servicio.tipo === 'corte_con_barba') {
        total += cantidadTotal * precios.corteYBarba;
      }
    });
  });

  return total;
}

/**
 * Lee los ingresos de una fecha específica
 */
export async function readIngresosKV(fecha: string): Promise<Ingresos | null> {
  const registros = await readRegistrosDiaKV();
  const registroDia = registros.find((r) => r.fecha === fecha);
  return registroDia?.ingresos || null;
}

/**
 * Guarda o actualiza los ingresos de una fecha específica
 */
export async function writeIngresosKV(fecha: string, ingresos: Ingresos): Promise<void> {
  const registros = await readRegistrosDiaKV();
  let registroDia = registros.find((r) => r.fecha === fecha);

  if (!registroDia) {
    // Si no existe el registro del día, crear uno nuevo con solo los ingresos
    registroDia = {
      fecha,
      barberos: [],
      ingresos,
    };
  } else {
    // Actualizar los ingresos en el registro existente
    registroDia.ingresos = ingresos;
  }

  await upsertRegistroDiaKV(registroDia);
}

