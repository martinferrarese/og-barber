export default function LoadingSpinner({ message = "Cargando..." }: { message?: string }) {
  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mb-4"></div>
      <p className="text-gray-400">{message}</p>
    </div>
  );
}

