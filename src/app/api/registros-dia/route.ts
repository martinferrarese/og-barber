import { NextResponse } from 'next/server';
import {
  addRegistroDiaKV,
  readRegistrosDiaKV,
} from '@/utils/registrosDiaFromDB';

export async function GET() {
  const registros = await readRegistrosDiaKV();
  return NextResponse.json(registros);
}

export async function POST(request: Request) {
  const data = await request.json();
  await addRegistroDiaKV(data);
  return NextResponse.json({ ok: true });
}
