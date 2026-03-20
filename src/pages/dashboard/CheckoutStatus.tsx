import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Clock3, XCircle } from 'lucide-react';

const contentMap = {
  success: {
    title: 'Pagamento aprovado',
    description: 'Seu pagamento foi recebido. O acesso será liberado automaticamente.',
    icon: CheckCircle2,
    color: 'text-success',
  },
  pending: {
    title: 'Pagamento pendente',
    description: 'Ainda estamos aguardando a confirmação do Mercado Pago.',
    icon: Clock3,
    color: 'text-warning',
  },
  failure: {
    title: 'Pagamento recusado',
    description: 'O pagamento não foi aprovado. Você pode tentar novamente.',
    icon: XCircle,
    color: 'text-error',
  },
};

export default function CheckoutStatus() {
  const { status = 'pending' } = useParams<{ status: keyof typeof contentMap }>();
  const content = contentMap[status as keyof typeof contentMap] || contentMap.pending;
  const Icon = content.icon;

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-dark px-6 py-12 text-text-primary">
      <div className="w-full max-w-lg rounded-3xl border border-border-dark bg-surface p-8 text-center shadow-2xl">
        <Icon className={`mx-auto h-16 w-16 ${content.color}`} />
        <h1 className="mt-5 text-3xl font-bold">{content.title}</h1>
        <p className="mt-3 text-text-secondary">{content.description}</p>
        <p className="mt-4 text-sm text-text-muted">Use o mesmo email da compra para ver o acesso na área de membros.</p>
        <Link to="/dashboard/purchases" className="mt-8 inline-flex rounded-xl bg-gradient-primary px-5 py-3 font-semibold text-white">
          Ir para a área de membros
        </Link>
      </div>
    </div>
  );
}
