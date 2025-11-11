import { kv } from '@vercel/kv';

const KEY = 'precios';

export interface Precios {
  corte: number;
  corteYBarba: number;
}

export const PRECIOS_DEFAULT: Precios = {
  corte: 12000,
  corteYBarba: 13000,
};

export async function readPreciosKV(): Promise<Precios> {
  const raw = await kv.get<Precios>(KEY);
  if (!raw) {
    // Si no existen precios guardados, guardar los default
    await writePreciosKV(PRECIOS_DEFAULT);
    return PRECIOS_DEFAULT;
  }
  return raw;
}

export async function writePreciosKV(precios: Precios): Promise<void> {
  await kv.set(KEY, precios);
}
