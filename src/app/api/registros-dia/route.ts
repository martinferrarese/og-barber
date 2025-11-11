import { NextResponse } from 'next/server';
import {
  readRegistrosDiaKV,
  deleteRegistroDiaKV,
  upsertRegistroDiaKV,
} from '@/utils/registrosDiaFromDB';
import { errorResponse, parseJsonSafely, validateDateFormat } from '@/utils/apiHelpers';

export async function GET() {
  try {
    const registros = await readRegistrosDiaKV();
    return NextResponse.json(registros);
  } catch (error) {
    console.error('Error al leer registros del día:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al leer registros del día';
    return errorResponse(errorMessage, 500);
  }
}

export async function POST(request: Request) {
  try {
    const data = await parseJsonSafely(request);
    if (!data) {
      return errorResponse('Body JSON inválido', 400);
    }

    await upsertRegistroDiaKV(data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error al guardar registro del día:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al guardar registro del día';
    return errorResponse(errorMessage, 500);
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await parseJsonSafely<{ fecha?: string }>(request);
    if (!body) {
      return errorResponse('Body JSON inválido', 400);
    }

    const { fecha } = body;
    if (!fecha || typeof fecha !== 'string') {
      return errorResponse('Fecha requerida', 400);
    }

    if (!validateDateFormat(fecha)) {
      return errorResponse('Formato de fecha inválido. Debe ser YYYY-MM-DD', 400);
    }

    await deleteRegistroDiaKV(fecha);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error al eliminar registro del día:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al eliminar registro del día';
    return errorResponse(errorMessage, 500);
  }
}
