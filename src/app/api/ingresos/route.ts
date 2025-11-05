import { NextResponse } from 'next/server';
import { readIngresosKV, writeIngresosKV, calcularCorteEfectivo } from '@/utils/ingresosFromDB';
import type { Ingresos } from '@/types/registroCortes';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fecha = searchParams.get('fecha');

  if (!fecha) {
    return NextResponse.json({ error: 'Fecha requerida' }, { status: 400 });
  }

  // Validar formato de fecha
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return NextResponse.json({ error: 'Formato de fecha inválido. Debe ser YYYY-MM-DD' }, { status: 400 });
  }

  try {
    // Siempre calcular el corte efectivo más reciente
    const corteEfectivo = await calcularCorteEfectivo(fecha);
    const ingresos = await readIngresosKV(fecha);
    
    // Si no hay ingresos guardados, retornar con corte efectivo calculado
    if (!ingresos) {
      return NextResponse.json({
        corteEfectivo,
        insumos: 0,
        color: 0,
        bebidas: 0,
      });
    }

    // Retornar ingresos guardados con corte efectivo actualizado
    return NextResponse.json({
      ...ingresos,
      corteEfectivo, // Siempre usar el cálculo más reciente
    });
  } catch (error) {
    console.error('Error al leer ingresos:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al leer ingresos';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fecha, insumos, color, bebidas } = body;

    if (!fecha) {
      return NextResponse.json({ error: 'Fecha requerida' }, { status: 400 });
    }

    // Validar formato de fecha (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return NextResponse.json({ error: 'Formato de fecha inválido. Debe ser YYYY-MM-DD' }, { status: 400 });
    }

    if (typeof insumos !== 'number' || typeof color !== 'number' || typeof bebidas !== 'number') {
      return NextResponse.json({ error: 'Insumos, color y bebidas deben ser números' }, { status: 400 });
    }

    if (isNaN(insumos) || isNaN(color) || isNaN(bebidas)) {
      return NextResponse.json({ error: 'Insumos, color y bebidas deben ser números válidos' }, { status: 400 });
    }

    // Calcular corte efectivo automáticamente
    const corteEfectivo = await calcularCorteEfectivo(fecha);

    const ingresos: Ingresos = {
      corteEfectivo,
      insumos: Math.max(0, insumos), // Asegurar que no sean negativos
      color: Math.max(0, color),
      bebidas: Math.max(0, bebidas),
    };

    await writeIngresosKV(fecha, ingresos);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error al guardar ingresos:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al guardar ingresos';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

