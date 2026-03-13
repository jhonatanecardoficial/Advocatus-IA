import { cookies } from 'next/headers';
import Link from 'next/link';
import MatterDetail from '@/components/MatterDetail';

interface Matter {
  id: string;
  title: string;
  type: string;
  status: string;
  court_reference?: string | null;
  citius_reference?: string | null;
  opposing_party?: string | null;
  opposing_counsel?: string | null;
  deadline_at?: string | null;
  opened_at?: string | null;
  closed_at?: string | null;
  client_id: string;
  responsible_id?: string | null;
  createdAt: string;
}

async function fetchMatter(id: string): Promise<Matter | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) return null;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  try {
    const res = await fetch(`${API_URL}/matters/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export default async function MatterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const matter = await fetchMatter(id);

  if (!matter) {
    return (
      <div className="py-24 text-center">
        <h2 className="text-2xl font-bold text-navy">Processo não encontrado</h2>
        <Link href="/matters" className="text-amber-500 hover:underline">
          Voltar à lista
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <MatterDetail matter={matter} />
    </div>
  );
}
