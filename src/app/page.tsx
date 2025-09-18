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
    <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center gap-8">
      <Image src={logo} alt="OG Barber" priority />
      <p className="text-lg max-w-md">
        Gestiona fácilmente los cortes diarios de tu barbería y lleva el control de
        pagos y barberos.
      </p>
      <a
        href="/registro-dia"
        className="bg-foreground text-background px-6 py-3 rounded font-medium hover:opacity-90"
      >
        Cargar día
      </a>
      <a
        href="/registros-dia"
        className="bg-foreground text-background px-6 py-3 rounded font-medium hover:opacity-90"
      >
        Ver registros diarios
      </a>
      <a
        href="/barberos"
        className="bg-foreground text-background px-6 py-3 rounded font-medium hover:opacity-90"
      >
        Administrar barberos
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
