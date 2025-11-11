/**
 * Crea una fecha en zona horaria local desde un string YYYY-MM-DD
 * Evita problemas de zona horaria al crear fechas desde strings
 * @throws Error si el formato de fecha es inválido
 */
export function crearFechaLocal(fechaStr: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
    throw new Error('Formato de fecha inválido. Debe ser YYYY-MM-DD');
  }
  
  const [year, month, day] = fechaStr.split('-').map(Number);
  
  // Validar que los valores están en rangos válidos antes de crear la fecha
  if (month < 1 || month > 12) {
    throw new Error('Fecha inválida');
  }
  
  // Crear fecha y validar que los valores no fueron ajustados automáticamente
  const date = new Date(year, month - 1, day);
  
  // Si la fecha creada no coincide con los valores originales, es inválida
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new Error('Fecha inválida');
  }
  
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Convierte un Date a string YYYY-MM-DD en zona horaria local
 * Evita problemas de zona horaria al convertir fechas a strings
 */
export function fechaToString(date: Date): string {
  if (isNaN(date.getTime())) {
    throw new Error('Fecha inválida');
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

