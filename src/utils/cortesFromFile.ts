import { promises as fs } from 'fs';
import { join } from 'path';
import type { CorteEntry } from '@/types/corte';

const dataPath = join(process.cwd(), 'data/cortes.json');

export async function readCortes(): Promise<CorteEntry[]> {
  try {
    const data = await fs.readFile(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}

export async function addCorte(corte: CorteEntry): Promise<void> {
  const cortes = await readCortes();
  cortes.push({ ...corte, fecha: new Date().toISOString() });
  await fs.mkdir(join(process.cwd(), 'data'), { recursive: true });
  await fs.writeFile(dataPath, JSON.stringify(cortes, null, 2));
}
