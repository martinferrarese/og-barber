import { NextResponse } from 'next/server';
import { readIngresosKV, writeIngresosKV, calcularCorteEfectivo } from '@/utils/ingresosFromDB';
import type { Ingresos } from '@/types/registroCortes';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fecha = searchParams.get('fecha');

  if (!fecha) {
    return NextResponse.json({ error: 'Fecha requerida' }, { status: 400 });
  }

  try {
    const ingresos = await readIngresosKV(fecha);
    const corteEfectivo = await calcularCorteEfectivo(fecha);
    
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
      corteEfectivo,
    });
  } catch (error) {
    console.error('Error al leer ingresos:', error);
    return NextResponse.json({ error: 'Error al leer ingresos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fecha, insumos, color, bebidas } = body;

    if (!fecha) {
      return NextResponse.json({ error: 'Fecha requerida' }, { status: 400 });
    }

    if (typeof insumos !== 'number' || typeof color !== 'number' || typeof bebidas !== 'number') {
      return NextResponse.json({ error: 'Insumos, color y bebidas deben ser números' }, { status: 400 });
    }

    // Calcular corte efectivo automáticamente
    const corteEfectivo = await calcularCorteEfectivo(fecha);

    const ingresos: Ingresos = {
      corteEfectivo,
      insumos,
      color,
      bebidas,
    };

    await writeIngresosKV(fecha, ingresos);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error al guardar ingresos:', error);
    return NextResponse.json({ error: 'Error al guardar ingresos' }, { status: 500 });
  }
}

