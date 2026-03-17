import { LegalIntelligenceDashboard } from '@/components/intel/LegalIntelligenceDashboard';

export const metadata = {
  title: 'Inteligência Jurídica | Advocatus IA',
  description: 'Pesquisa avançada de legislação e jurisprudência brasileira.',
};

export default function IntelligencePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <LegalIntelligenceDashboard />
    </div>
  );
}
