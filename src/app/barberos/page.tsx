import BarberoForm from '@/components/BarberoForm';
import DeleteBarberoButton from '@/components/DeleteBarberoButton';
import { readBarberosKV } from '@/utils/barberosFromDB';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Administrar barberos | OG Barber',
};

export default async function BarberosPage() {
  const barberos = await readBarberosKV();

  return (
    <div className="p-8 max-w-2xl mx-auto flex flex-col gap-8">
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
