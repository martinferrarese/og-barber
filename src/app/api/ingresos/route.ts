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
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fecha, cortesEfectivo, cortesMP, insumos, color, bebidas } = body;

    if (!fecha) {
      return NextResponse.json({ error: 'Fecha requerida' }, { status: 400 });
    }

    // Validar formato de fecha (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return NextResponse.json({ error: 'Formato de fecha inválido. Debe ser YYYY-MM-DD' }, { status: 400 });
    }

    if (
      typeof cortesEfectivo !== 'number' ||
      typeof cortesMP !== 'number' ||
      typeof insumos !== 'number' ||
      typeof color !== 'number' ||
      typeof bebidas !== 'number'
    ) {
      return NextResponse.json({ error: 'Todos los campos deben ser números' }, { status: 400 });
    }

    if (
      isNaN(cortesEfectivo) ||
      isNaN(cortesMP) ||
      isNaN(insumos) ||
      isNaN(color) ||
      isNaN(bebidas)
    ) {
      return NextResponse.json({ error: 'Todos los campos deben ser números válidos' }, { status: 400 });
    }

    // Calcular corte efectivo automáticamente
    const corteEfectivo = await calcularCorteEfectivo(fecha);

    // Validar que la suma coincida
    const sumaCortes = cortesEfectivo + cortesMP;
    if (sumaCortes !== corteEfectivo) {
      return NextResponse.json({
        error: `La suma de Cortes efectivo (${cortesEfectivo.toLocaleString('es-AR')}) + Cortes MP (${cortesMP.toLocaleString('es-AR')}) = ${sumaCortes.toLocaleString('es-AR')} no coincide con el total de Cortes (${corteEfectivo.toLocaleString('es-AR')})`
      }, { status: 400 });
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
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

