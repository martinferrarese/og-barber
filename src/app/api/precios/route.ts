import { NextResponse } from 'next/server';
import { readPreciosKV, writePreciosKV, Precios } from '@/utils/preciosFromDB';

export async function GET() {
  const precios = await readPreciosKV();
  return NextResponse.json(precios);
}

export async function POST(request: Request) {
  const precios: Precios = await request.json();
  
  if (typeof precios.corte !== 'number' || typeof precios.corteYBarba !== 'number') {
    return NextResponse.json({ error: 'Precios inválidos' }, { status: 400 });
  }
  
  if (precios.corte < 0 || precios.corteYBarba < 0) {
    return NextResponse.json({ error: 'Los precios no pueden ser negativos' }, { status: 400 });
  }
  
  await writePreciosKV(precios);
  return NextResponse.json({ ok: true });
}

