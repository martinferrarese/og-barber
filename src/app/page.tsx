"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import logo from "@/assets/og-barber.jpeg";

function HomeClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);
  const [diaToast, setDiaToast] = useState<string | null>(null);

  // Detectar el query param sólo al llegar a la página
  useEffect(() => {
    const diaQuery = searchParams.get("diaCargada");
    if (diaQuery) {
      setDiaToast(diaQuery);
      setShowToast(true);

      // Limpiar el parámetro de la URL sin crear una nueva entrada en el history
      const url = new URL(window.location.href);
      url.searchParams.delete("diaCargada");
      router.replace(url.pathname + url.search);
    }
    // Sólo queremos ejecutar esto cuando cambie el objeto searchParams
  }, [searchParams, router]);

  // Ocultar el toast después de 4 s
  useEffect(() => {
    if (showToast) {
      const t = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(t);
    }
  }, [showToast]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-start p-8 text-center gap-8">
      <Image src={logo} alt="OG Barber" priority />
      <a
        href="/carga-rapida"
        className="btn btn-primary md:inline-block md:w-auto w-full text-center"
      >
        Carga rápida
      </a>
      <a
        href="/ingreso-efectivo"
        className="btn btn-primary md:inline-block md:w-auto w-full text-center"
      >
        Ingreso efectivo
      </a>
      <a
        href="/registros-dia"
        className="btn btn-primary md:inline-block md:w-auto w-full text-center"
      >
        Ver registros diarios
      </a>
      <a
        href="/configuraciones"
        className="btn btn-primary md:inline-block md:w-auto w-full text-center"
      >
        Configuraciones
      </a>

      {showToast && diaToast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow">
          Se cargó el día {diaToast}
        </div>
      )}
    </main>
  );
}

// Página principal que envuelve el Client Component en un Suspense
export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeClient />
    </Suspense>
  );
}
