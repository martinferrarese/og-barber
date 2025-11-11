/**
 * Ordena la lista de barberos poniendo "Bruno" y "Lucas" al final
 * @param barberos Lista de nombres de barberos
 * @returns Lista ordenada con Bruno y Lucas al final
 */
export function ordenarBarberos(barberos: string[]): string[] {
  const otros = barberos.filter((b) => b !== "Bruno" && b !== "Lucas");
  const bruno = barberos.find((b) => b === "Bruno");
  const lucas = barberos.find((b) => b === "Lucas");
  
  const ordenados = [...otros];
  if (bruno) ordenados.push(bruno);
  if (lucas) ordenados.push(lucas);
  
  return ordenados;
}

