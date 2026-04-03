import { cookies } from 'next/headers';
import Link from 'next/link';
import ClientDetail from '@/components/ClientDetail';

interface Client {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  nif: string;
  tipo: 'SINGULAR' | 'COLETIVO';
  address?: string | null;
  notes?: string | null;
  gdprConsentAt?: string | null;
  _count?: { matters: number };
  matters?: Array<{
    id: string;
    title: string;
    type: string;
    status: string;
    deadlineAt: string | null;
    createdAt: string;
  }>;
}

async function fetchClient(id: string): Promise<Client | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  if (!token) return null;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  try {
    const res = await fetch(`${API_URL}/clients/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (e) {
    return null;
  }
}

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await fetchClient(id);
  if (!client) {
    return (
      <div className="py-24 text-center">
        <h2 className="text-2xl font-bold text-navy">Cliente não encontrado</h2>
        <Link href="/clients" className="text-amber-500 hover:underline">
          Voltar à lista
        </Link>
      </div>
    );
  }
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <ClientDetail client={client} />
    </div>
  );
}
