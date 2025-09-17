export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center gap-8">
      <h1 className="text-4xl font-extrabold">OG Barber</h1>
      <p className="text-lg max-w-md">
        Gestiona fácilmente los cortes diarios de tu barbería y lleva el control de
        pagos y barberos.
      </p>
      <a
        href="/cortes"
        className="bg-foreground text-background px-6 py-3 rounded font-medium hover:opacity-90"
      >
        Registrar cortes
      </a>
      <a
        href="/barberos"
        className="bg-foreground text-background px-6 py-3 rounded font-medium hover:opacity-90"
      >
        Administrar barberos
      </a>
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
    </main>
  );
}
