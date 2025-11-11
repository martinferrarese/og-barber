import { NextResponse } from 'next/server';
import {
  readBarberosKV,
  addBarberoKV,
  deleteBarberoKV,
} from '@/utils/barberosFromDB';
import { errorResponse, parseJsonSafely } from '@/utils/apiHelpers';

export async function GET() {
  try {
    const barberos = await readBarberosKV();
    return NextResponse.json(barberos);
  } catch (error) {
    console.error('Error al leer barberos:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al leer barberos';
    return errorResponse(errorMessage, 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await parseJsonSafely<{ nombre?: string }>(request);
    if (!body) {
      return errorResponse('Body JSON inválido', 400);
    }

    const { nombre } = body;
    if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
      return errorResponse('Nombre requerido', 400);
    }

    await addBarberoKV(nombre.trim());
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error al agregar barbero:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al agregar barbero';
    return errorResponse(errorMessage, 500);
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await parseJsonSafely<{ nombre?: string }>(request);
    if (!body) {
      return errorResponse('Body JSON inválido', 400);
    }

    const { nombre } = body;
    if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
      return errorResponse('Nombre requerido', 400);
    }

    await deleteBarberoKV(nombre.trim());
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error al eliminar barbero:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al eliminar barbero';
    return errorResponse(errorMessage, 500);
  }
}
