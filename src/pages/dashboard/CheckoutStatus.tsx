import React, { useEffect, useState } from 'react';
import { useLocation, Link, useParams } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';

export default function CheckoutStatus() {
  const { status } = useParams<{ status: string }>();
  const location = useLocation();
  const [paymentId, setPaymentId] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const payment_id = searchParams.get('payment_id');
    if (payment_id) {
      setPaymentId(payment_id);
    }
  }, [location]);

  const getStatusContent = () => {
    switch (status) {
      case 'success':
        return {
          icon: <CheckCircle className="h-16 w-16 text-success mb-4" />,
          title: 'Pagamento Aprovado!',
          message: 'Sua compra foi confirmada com sucesso. Você já pode acessar o conteúdo.',
          color: 'text-success'
        };
      case 'failure':
        return {
          icon: <XCircle className="h-16 w-16 text-error mb-4" />,
          title: 'Pagamento Recusado',
          message: 'Houve um problema com o seu pagamento. Por favor, tente novamente.',
          color: 'text-error'
        };
      case 'pending':
        return {
          icon: <Clock className="h-16 w-16 text-warning mb-4" />,
          title: 'Pagamento Pendente',
          message: 'Estamos aguardando a confirmação do pagamento. Isso pode levar alguns minutos.',
          color: 'text-warning'
        };
      default:
        return {
          icon: <Clock className="h-16 w-16 text-text-muted mb-4" />,
          title: 'Status Desconhecido',
          message: 'Não foi possível determinar o status do pagamento.',
          color: 'text-text-primary'
        };
    }
  };

  const content = getStatusContent();

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center w-full max-w-md">
        <div className="bg-surface p-8 rounded-2xl shadow-lg border border-border-dark w-full text-center flex flex-col items-center">
          {content.icon}
          <h1 className={`text-2xl font-bold mb-2 ${content.color}`}>{content.title}</h1>
          <p className="text-text-secondary mb-6">{content.message}</p>
          
          {status === 'success' && (
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6 text-sm text-text-primary text-left">
              <strong>Importante:</strong> Se você ainda não tem uma conta, crie uma com o <strong>mesmo email</strong> usado na compra para acessar seus produtos na área "Minhas Compras".
            </div>
          )}

          {paymentId && (
            <p className="text-sm text-text-muted mb-8">
              ID do Pagamento: {paymentId}
            </p>
          )}

          <Link
            to="/dashboard/purchases"
            className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-xl text-white bg-gradient-primary shadow-md hover:opacity-90 transition-all w-full justify-center"
          >
            Acessar Minhas Compras
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
