import { useState } from "react";

/**
 * Hook para manejar el estado de focus/blur de inputs numéricos
 * Permite mostrar vacío cuando el input está enfocado y el valor es 0
 * 
 * @param fieldKey - Identificador único del campo (puede ser simple o compuesto)
 * @returns Objeto con getInputValue, handleFocus, handleBlur
 */
export function useFormInput(fieldKey: string) {
  const [isFocused, setIsFocused] = useState(false);

  /**
   * Obtiene el valor a mostrar en el input
   * Si está enfocado y el valor es 0, retorna string vacío
   * Si no está enfocado, retorna el valor como string
   */
  function getInputValue(value: number | undefined): string {
    const val = value ?? 0;
    if (isFocused && val === 0) {
      return "";
    }
    return val.toString();
  }

  function handleFocus() {
    setIsFocused(true);
  }

  function handleBlur() {
    setIsFocused(false);
  }

  return {
    getInputValue,
    handleFocus,
    handleBlur,
  };
}

/**
 * Hook para manejar múltiples campos con focus/blur
 * Útil cuando tienes muchos campos y quieres trackear cuáles están enfocados
 * 
 * @returns Objeto con getInputValue, handleFocus, handleBlur que aceptan fieldKey
 */
export function useFormInputs() {
  const [focusedFields, setFocusedFields] = useState<Set<string>>(new Set());

  /**
   * Obtiene el valor a mostrar en el input
   * @param fieldKey - Identificador único del campo
   * @param value - Valor numérico del campo
   * @returns String vacío si está enfocado y valor es 0, sino el valor como string
   */
  function getInputValue(fieldKey: string, value: number | undefined): string {
    const val = value ?? 0;
    if (focusedFields.has(fieldKey) && val === 0) {
      return "";
    }
    return val.toString();
  }

  function handleFocus(fieldKey: string) {
    setFocusedFields((prev) => new Set(prev).add(fieldKey));
  }

  function handleBlur(fieldKey: string) {
    setFocusedFields((prev) => {
      const newSet = new Set(prev);
      newSet.delete(fieldKey);
      return newSet;
    });
  }

  return {
    getInputValue,
    handleFocus,
    handleBlur,
  };
}

