import CorteForm from "@/components/CorteForm";
import { readCortesKV } from "@/utils/cortesKv";
import { readCortes } from "@/utils/cortesData";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Registrar cortes | OG Barber",
};

export default async function CortesPage() {
  const cortes = process.env.UPSTASH_REDIS_REST_URL
    ? await readCortesKV()
    : await readCortes();
  return (
    <div className="p-8 max-w-2xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Registrar cortes del día</h1>
        <CorteForm />
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-2">Cortes registrados</h2>
        {cortes.length === 0 ? (
          <p className="text-sm text-gray-500">Aún no hay registros.</p>
        ) : (
          <ul className="space-y-2">
            {cortes.map((c, idx) => (
              <li
                key={idx}
                className="border p-3 rounded flex justify-between text-sm"
              >
                <span>
                  {c.tipo.replace("_", " ")} – {c.barbero}
                </span>
                <span>{c.formaDePago}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
