export interface CorteEntry {
  tipo: 'corte' | 'corte_con_barba';
  barbero: string;
  formaDePago: 'efectivo' | 'mercado_pago';
  fecha?: string;
}
