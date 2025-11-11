import { NextResponse } from 'next/server';
import { readEgresosKV, writeEgresosKV } from '@/utils/egresosFromDB';
import type { Egresos } from '@/types/registroCortes';
import { errorResponse, parseJsonSafely, validateDateFormat, isValidNumber } from '@/utils/apiHelpers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fecha = searchParams.get('fecha');

    if (!fecha) {
      return errorResponse('Fecha requerida', 400);
    }

    if (!validateDateFormat(fecha)) {
      return errorResponse('Formato de fecha inválido. Debe ser YYYY-MM-DD', 400);
    }

    const egresos = await readEgresosKV(fecha);
    
    // Si no hay egresos guardados, retornar valores por defecto
    if (!egresos) {
      return NextResponse.json({
        efectivo: {
          insumos: 0,
          gastos: 0,
        },
        mp: {
          insumos: 0,
          gastos: 0,
        },
      });
    }

    return NextResponse.json(egresos);
  } catch (error) {
    console.error('Error al leer egresos:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al leer egresos';
    return errorResponse(errorMessage, 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await parseJsonSafely<{ fecha?: string; efectivo?: { insumos?: number; gastos?: number }; mp?: { insumos?: number; gastos?: number } }>(request);
    if (!body) {
      return errorResponse('Body JSON inválido', 400);
    }

    const { fecha, efectivo, mp } = body;

    if (!fecha || typeof fecha !== 'string') {
      return errorResponse('Fecha requerida', 400);
    }

    if (!validateDateFormat(fecha)) {
      return errorResponse('Formato de fecha inválido. Debe ser YYYY-MM-DD', 400);
    }

    if (!efectivo || !mp) {
      return errorResponse('Efectivo y MP son requeridos', 400);
    }

    if (
      !isValidNumber(efectivo.insumos) ||
      !isValidNumber(efectivo.gastos) ||
      !isValidNumber(mp.insumos) ||
      !isValidNumber(mp.gastos)
    ) {
      return errorResponse('Todos los campos deben ser números válidos', 400);
    }

    const egresos: Egresos = {
      efectivo: {
        insumos: Math.max(0, efectivo.insumos),
        gastos: Math.max(0, efectivo.gastos),
      },
      mp: {
        insumos: Math.max(0, mp.insumos),
        gastos: Math.max(0, mp.gastos),
      },
    };

    await writeEgresosKV(fecha, egresos);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error al guardar egresos:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al guardar egresos';
    return errorResponse(errorMessage, 500);
  }
}

