import type { Egresos } from '@/types/registroCortes';
import { readRegistrosDiaKV, upsertRegistroDiaKV } from './registrosDiaFromDB';

/**
 * Lee los egresos de una fecha específica
 */
export async function readEgresosKV(fecha: string): Promise<Egresos | null> {
  const registros = await readRegistrosDiaKV();
  const registroDia = registros.find((r) => r.fecha === fecha);
  return registroDia?.egresos || null;
}

/**
 * Guarda o actualiza los egresos de una fecha específica
 * Asegura que se preserven los datos existentes de barberos e ingresos
 */
export async function writeEgresosKV(fecha: string, egresos: Egresos): Promise<void> {
  // Leer siempre la versión más reciente para evitar condiciones de carrera
  const registros = await readRegistrosDiaKV();
  let registroDia = registros.find((r) => r.fecha === fecha);

  if (!registroDia) {
    // Si no existe el registro del día, crear uno nuevo con solo los egresos
    registroDia = {
      fecha,
      barberos: [],
      egresos,
    };
  } else {
    // Actualizar los egresos en el registro existente preservando los demás datos
    registroDia = {
      ...registroDia,
      egresos,
    };
  }

  await upsertRegistroDiaKV(registroDia);
}

