'use client';

import { useEffect, useState } from 'react';
import BarberoForm from '@/components/BarberoForm';
import DeleteBarberoButton from '@/components/DeleteBarberoButton';

export default function BarberosPage() {
  const [barberos, setBarberos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBarberos();
  }, []);

  async function loadBarberos() {
    try {
      const res = await fetch('/api/barberos');
      const data = await res.json();
      setBarberos(data);
    } catch (error) {
      console.error('Error cargando barberos:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Administrar barberos</h1>
        <BarberoForm />
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-2">Lista de barberos</h2>
        {barberos.length === 0 ? (
          <p className="text-sm text-gray-500">Aún no hay barberos.</p>
        ) : (
          <ul className="space-y-2">
            {barberos.map((b, idx) => (
              <li
                key={idx}
                className="border p-3 rounded flex justify-between text-sm"
              >
                <span>{b}</span>
                <DeleteBarberoButton nombre={b} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
