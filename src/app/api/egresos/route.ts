import { NextResponse } from 'next/server';
import { readEgresosKV, writeEgresosKV } from '@/utils/egresosFromDB';
import type { Egresos } from '@/types/registroCortes';

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
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fecha, efectivo, mp } = body;

    if (!fecha) {
      return NextResponse.json({ error: 'Fecha requerida' }, { status: 400 });
    }

    // Validar formato de fecha (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return NextResponse.json({ error: 'Formato de fecha inválido. Debe ser YYYY-MM-DD' }, { status: 400 });
    }

    if (!efectivo || !mp) {
      return NextResponse.json({ error: 'Efectivo y MP son requeridos' }, { status: 400 });
    }

    if (
      typeof efectivo.insumos !== 'number' ||
      typeof efectivo.gastos !== 'number' ||
      typeof mp.insumos !== 'number' ||
      typeof mp.gastos !== 'number'
    ) {
      return NextResponse.json({ error: 'Todos los campos deben ser números' }, { status: 400 });
    }

    if (
      isNaN(efectivo.insumos) ||
      isNaN(efectivo.gastos) ||
      isNaN(mp.insumos) ||
      isNaN(mp.gastos)
    ) {
      return NextResponse.json({ error: 'Todos los campos deben ser números válidos' }, { status: 400 });
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
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

