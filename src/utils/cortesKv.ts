import { kv } from '@vercel/kv';
import type { CorteEntry } from '@/types/corte';

const KEY = 'cortes';

export async function addCorteKV(corte: CorteEntry) {
  await kv.lpush(KEY, JSON.stringify({ ...corte, fecha: new Date().toISOString() }));
}

export async function readCortesKV(): Promise<CorteEntry[]> {
  const items = await kv.lrange<string>(KEY, 0, -1);
  return items.map((it) => JSON.parse(it));
}
