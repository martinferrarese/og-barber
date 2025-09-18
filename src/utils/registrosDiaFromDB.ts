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

export async function deleteRegistroDiaKV(fecha: string) {
  const registros = await readRegistrosDiaKV();
  const filtrados = registros.filter((d) => d.fecha !== fecha);

  await kv.del(KEY);
  if (filtrados.length > 0) {
    for (let i = filtrados.length - 1; i >= 0; i--) {
      await kv.lpush(KEY, JSON.stringify(filtrados[i]));
    }
  }
}

export async function upsertRegistroDiaKV(registro: RegistroCortesDia) {
  const registros = await readRegistrosDiaKV();
  const sinFecha = registros.filter((d) => d.fecha !== registro.fecha);
  sinFecha.unshift(registro);
  await kv.del(KEY);

  for (let i = sinFecha.length - 1; i >= 0; i--) {
    await kv.lpush(KEY, JSON.stringify(sinFecha[i]));
  }
}
