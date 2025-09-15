import { kv } from '@vercel/kv';

const KEY = 'barberos';

export async function readBarberosKV(): Promise<string[]> {
  const raw = await kv.lrange<string>(KEY, 0, -1);
  return raw as string[];
}

export async function addBarberoKV(nombre: string): Promise<void> {
  await kv.lpush(KEY, nombre);
}

export async function deleteBarberoKV(nombre: string): Promise<void> {
  const barberos = await readBarberosKV();
  const updated = barberos.filter((b) => b !== nombre);
  // Replace list: delete key then re-lpush
  await kv.del(KEY);
  if (updated.length) {
    // lpush reverses order, so push reversed to maintain original
    for (const n of updated.slice().reverse()) {
      await kv.lpush(KEY, n);
    }
  }
}
