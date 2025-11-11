import { Suspense, ReactNode } from "react";
import LoadingSpinner from "./LoadingSpinner";

interface PageSuspenseProps {
  children: ReactNode;
  fallback?: ReactNode;
  showSpinner?: boolean;
  spinnerMessage?: string;
}

/**
 * Wrapper de Suspense para páginas con fallback consistente
 * Por defecto muestra LoadingSpinner, pero permite personalización
 * 
 * @param children - Componente hijo a envolver
 * @param fallback - Fallback personalizado (opcional)
 * @param showSpinner - Si es true, muestra LoadingSpinner (por defecto true)
 * @param spinnerMessage - Mensaje para el spinner (opcional)
 */
export default function PageSuspense({
  children,
  fallback,
  showSpinner = true,
  spinnerMessage,
}: PageSuspenseProps) {
  let fallbackContent: ReactNode = null;

  if (fallback !== undefined) {
    // Si se proporciona un fallback explícito, usarlo
    fallbackContent = fallback;
  } else if (showSpinner) {
    // Si no hay fallback pero showSpinner es true, usar LoadingSpinner
    fallbackContent = spinnerMessage ? (
      <LoadingSpinner message={spinnerMessage} />
    ) : (
      <LoadingSpinner />
    );
  }
  // Si showSpinner es false y no hay fallback, queda null

  return <Suspense fallback={fallbackContent}>{children}</Suspense>;
}

