import { NextResponse } from 'next/server';
import {
  readBarberosKV,
  addBarberoKV,
  deleteBarberoKV,
} from '@/utils/barberosFromDB';

export async function GET() {
  const barberos = await readBarberosKV();
  return NextResponse.json(barberos);
}

export async function POST(request: Request) {
  const { nombre } = await request.json();
  if (!nombre) {
    return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });
  }
  await addBarberoKV(nombre);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const { nombre } = await request.json();
  if (!nombre) {
    return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });
  }
  await deleteBarberoKV(nombre);
  return NextResponse.json({ ok: true });
}
