'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import RegistroDiaForm from '@/components/RegistroDiaForm';

function RegistroDiaPageContent() {
  const searchParams = useSearchParams();
  const fecha = searchParams.get('fecha') || undefined;

  return (
    <div className="min-h-screen flex justify-center items-start p-4 md:p-8">
      <RegistroDiaForm initialFecha={fecha} />
    </div>
  );
}

export default function RegistroDiaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex justify-center items-start p-4 md:p-8">
          <p className="text-gray-500">Cargando...</p>
        </div>
      }
    >
      <RegistroDiaPageContent />
    </Suspense>
  );
}
