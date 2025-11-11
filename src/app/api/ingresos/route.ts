import { NextResponse } from 'next/server';
import { readIngresosKV, writeIngresosKV, calcularCorteEfectivo } from '@/utils/ingresosFromDB';
import type { Ingresos } from '@/types/registroCortes';
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

    // Siempre calcular el corte efectivo más reciente
    const corteEfectivo = await calcularCorteEfectivo(fecha);
    const ingresos = await readIngresosKV(fecha);
    
    // Si no hay ingresos guardados, retornar con corte efectivo calculado
    if (!ingresos) {
      return NextResponse.json({
        corteEfectivo,
        cortesEfectivo: 0,
        cortesMP: 0,
        insumos: 0,
        color: 0,
        bebidas: 0,
      });
    }

    // Retornar ingresos guardados con corte efectivo actualizado
    return NextResponse.json({
      ...ingresos,
      corteEfectivo, // Siempre usar el cálculo más reciente
      cortesEfectivo: ingresos.cortesEfectivo ?? 0,
      cortesMP: ingresos.cortesMP ?? 0,
    });
  } catch (error) {
    console.error('Error al leer ingresos:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al leer ingresos';
    return errorResponse(errorMessage, 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await parseJsonSafely<{ fecha?: string; cortesEfectivo?: number; cortesMP?: number; insumos?: number; color?: number; bebidas?: number }>(request);
    if (!body) {
      return errorResponse('Body JSON inválido', 400);
    }

    const { fecha, cortesEfectivo, cortesMP, insumos, color, bebidas } = body;

    if (!fecha || typeof fecha !== 'string') {
      return errorResponse('Fecha requerida', 400);
    }

    if (!validateDateFormat(fecha)) {
      return errorResponse('Formato de fecha inválido. Debe ser YYYY-MM-DD', 400);
    }

    if (
      !isValidNumber(cortesEfectivo) ||
      !isValidNumber(cortesMP) ||
      !isValidNumber(insumos) ||
      !isValidNumber(color) ||
      !isValidNumber(bebidas)
    ) {
      return errorResponse('Todos los campos deben ser números válidos', 400);
    }

    // Calcular corte efectivo automáticamente
    const corteEfectivo = await calcularCorteEfectivo(fecha);

    // Validar que la suma coincida
    const sumaCortes = cortesEfectivo + cortesMP;
    if (sumaCortes !== corteEfectivo) {
      return errorResponse(
        `La suma de Cortes efectivo (${cortesEfectivo.toLocaleString('es-AR')}) + Cortes MP (${cortesMP.toLocaleString('es-AR')}) = ${sumaCortes.toLocaleString('es-AR')} no coincide con el total de Cortes (${corteEfectivo.toLocaleString('es-AR')})`
      );
    }

    const ingresos: Ingresos = {
      corteEfectivo,
      cortesEfectivo: Math.max(0, cortesEfectivo),
      cortesMP: Math.max(0, cortesMP),
      insumos: Math.max(0, insumos), // Asegurar que no sean negativos
      color: Math.max(0, color),
      bebidas: Math.max(0, bebidas),
    };

    await writeIngresosKV(fecha, ingresos);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error al guardar ingresos:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al guardar ingresos';
    return errorResponse(errorMessage, 500);
  }
}

