import { NextResponse } from 'next/server';
import {
  readRegistrosDiaKV,
  deleteRegistroDiaKV,
  upsertRegistroDiaKV,
} from '@/utils/registrosDiaFromDB';

export async function GET() {
  const registros = await readRegistrosDiaKV();
  return NextResponse.json(registros);
}

export async function POST(request: Request) {
  const data = await request.json();
  await upsertRegistroDiaKV(data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const { fecha } = await request.json();
  await deleteRegistroDiaKV(fecha);
  return NextResponse.json({ ok: true });
}
