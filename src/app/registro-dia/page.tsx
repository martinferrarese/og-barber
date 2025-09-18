import RegistroDiaForm from '@/components/RegistroDiaForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Carga del día | OG Barber' };

export default function RegistroDiaPage() {
  return (
    <div className="min-h-screen flex justify-center items-start p-4 md:p-8">
      <RegistroDiaForm />
    </div>
  );
}
