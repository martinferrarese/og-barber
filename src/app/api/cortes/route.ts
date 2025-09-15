import { NextResponse } from 'next/server';
import { readCortes, addCorte } from '@/utils/cortesData';

export async function GET() {
  const cortes = await readCortes();
  return NextResponse.json(cortes);
}

export async function POST(request: Request) {
  const data = await request.json();
  await addCorte(data);
  return NextResponse.json({ ok: true });
}
