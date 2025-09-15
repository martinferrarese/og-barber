import { NextResponse } from 'next/server';
import { readCortes, addCorte } from '@/utils/cortesFromFile';
import { readCortesKV, addCorteKV } from '@/utils/cortesFromDB';

const useKV = !!process.env.KV_REST_API_URL;

export async function GET() {
  const cortes = useKV ? await readCortesKV() : await readCortes();
  return NextResponse.json(cortes);
}

export async function POST(request: Request) {
  const data = await request.json();
  if (useKV) {
    await addCorteKV(data);
  } else {
    await addCorte(data);
  }
  return NextResponse.json({ ok: true });
}
