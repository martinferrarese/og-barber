import { NextResponse } from 'next/server';
import { readPreciosKV, writePreciosKV, Precios } from '@/utils/preciosFromDB';
import { errorResponse, parseJsonSafely, isValidNumber } from '@/utils/apiHelpers';

export async function GET() {
  try {
    const precios = await readPreciosKV();
    return NextResponse.json(precios);
  } catch (error) {
    console.error('Error al leer precios:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al leer precios';
    return errorResponse(errorMessage, 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await parseJsonSafely<Precios>(request);
    if (!body) {
      return errorResponse('Body JSON inválido', 400);
    }

    const { corte, corteYBarba } = body;
    
    if (!isValidNumber(corte) || !isValidNumber(corteYBarba)) {
      return errorResponse('Precios inválidos', 400);
    }
    
    if (corte < 0 || corteYBarba < 0) {
      return errorResponse('Los precios no pueden ser negativos', 400);
    }
    
    await writePreciosKV({ corte, corteYBarba });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error al guardar precios:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al guardar precios';
    return errorResponse(errorMessage, 500);
  }
}

