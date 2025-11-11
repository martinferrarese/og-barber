import { NextResponse } from 'next/server';

/**
 * Crea una respuesta de error estandarizada
 * Mantiene el formato { error: string } que el cliente espera
 * 
 * @param message - Mensaje de error
 * @param status - Código de estado HTTP (por defecto 400)
 * @returns NextResponse con formato { error: string }
 */
export function errorResponse(message: string, status: number = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Parsea el body JSON de manera segura
 * Maneja errores de JSON inválido y retorna null si falla
 * 
 * @param request - Request object de Next.js
 * @returns Promise con el objeto parseado o null si falla
 */
export async function parseJsonSafely<T>(request: Request): Promise<T | null> {
  try {
    return await request.json();
  } catch (error) {
    return null;
  }
}

/**
 * Valida que el formato de fecha sea YYYY-MM-DD
 * 
 * @param fecha - String con la fecha a validar
 * @returns true si el formato es válido, false en caso contrario
 */
export function validateDateFormat(fecha: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(fecha);
}

/**
 * Valida que un valor sea un número válido (no NaN)
 * 
 * @param value - Valor a validar
 * @returns true si es un número válido, false en caso contrario
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

