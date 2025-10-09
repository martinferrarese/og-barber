export type Servicio = 'corte' | 'corte_con_barba';

export interface RegistroCorteItem {
  /** Tipo de servicio */
  tipo: Servicio;
  /** Cantidad pagada en efectivo */
  efectivo: number;
  /** Cantidad pagada vía Mercado Pago */
  mercado_pago: number;
}

/** Corte con monto personalizado (fuera de los precios estándar) */
export interface CorteEspecial {
  /** Monto del corte especial */
  monto: number;
  /** Descripción opcional del corte especial */
  descripcion?: string;
}

/**
 * Estructura para almacenar los cortes de un barbero en un día determinado.
 * Se guarda la fecha normalizada en formato YYYY-MM-DD para facilitar consultas.
 */
export interface RegistroCortes {
  /** Fecha en formato YYYY-MM-DD */
  fecha: string;
  /** Nombre del barbero */
  barbero: string;
  /** Listado de servicios con cantidades discriminadas por forma de pago */
  servicios: RegistroCorteItem[];
  /** Cortes especiales con montos personalizados (opcional para retrocompatibilidad) */
  cortesEspeciales?: CorteEspecial[];
}

/** Agrupa los registros de todos los barberos para un mismo día */
export interface RegistroCortesDia {
  /** Fecha en formato YYYY-MM-DD */
  fecha: string;
  /** Registros por barbero */
  barberos: RegistroCortes[];
}
