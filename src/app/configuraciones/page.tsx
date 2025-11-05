export const metadata = {
  title: 'Configuraciones | OG Barber',
};

export default function ConfiguracionesPage() {
  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto flex flex-col gap-8">
      <h1 className="text-2xl font-bold mb-4">Configuraciones</h1>
      
      <div className="flex flex-col gap-4">
        <a
          href="/barberos"
          className="btn btn-primary md:inline-block md:w-auto w-full text-center"
        >
          Administrar barberos
        </a>
        <a
          href="/configuraciones/precios"
          className="btn btn-primary md:inline-block md:w-auto w-full text-center"
        >
          Ajustar precios
        </a>
      </div>
    </div>
  );
}

