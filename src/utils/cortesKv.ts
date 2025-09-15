import { kv } from '@vercel/kv';
import type { CorteEntry } from '@/types/corte';

const KEY = 'cortes';

export async function addCorteKV(corte: CorteEntry) {
  await kv.lpush(
    KEY,
    JSON.stringify({ ...corte, fecha: new Date().toISOString() }),
  );
}

export async function readCortesKV(): Promise<CorteEntry[]> {
  const raw = await kv.lrange(KEY, 0, -1);
  return raw
    .map((it: unknown) => {
      if (typeof it === 'string') {
        try {
          return JSON.parse(it);
        } catch {
          return null;
        }
      }
      return it as CorteEntry;
    })
    .filter(Boolean) as CorteEntry[];
}
