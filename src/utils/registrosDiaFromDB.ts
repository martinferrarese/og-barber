import { kv } from '@vercel/kv';
import type { RegistroCortesDia } from '@/types/registroCortes';

const KEY = 'registrosDia';

export async function addRegistroDiaKV(registro: RegistroCortesDia) {
  await kv.lpush(KEY, JSON.stringify(registro));
}

export async function readRegistrosDiaKV(): Promise<RegistroCortesDia[]> {
  const raw = await kv.lrange(KEY, 0, -1);
  return raw
    .map((it: unknown) => {
      if (typeof it === 'string') {
        try {
          return JSON.parse(it) as RegistroCortesDia;
        } catch {
          return null;
        }
      }
      return it as RegistroCortesDia;
    })
    .filter(Boolean) as RegistroCortesDia[];
}
