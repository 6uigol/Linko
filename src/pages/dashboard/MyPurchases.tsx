import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock3, Download, ShieldCheck, XCircle } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { fetchMyPurchases, formatCurrency, formatDate, type PurchaseRecord } from '../../lib/app-data';

export default function MyPurchases() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user?.email) return;
      setLoading(true);
      try {
        setPurchases(await fetchMyPurchases(user.email));
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [user?.email]);

  const statusMeta = {
    pending: { label: 'Pendente', icon: Clock3 },
    paid: { label: 'Pago', icon: CheckCircle2 },
    refused: { label: 'Recusado', icon: XCircle },
  };

  return (
    <DashboardLayout>
      <div className="rounded-3xl border border-border-dark bg-surface p-6 shadow-xl">
        <h1 className="text-3xl font-bold">Área de membros</h1>
        <p className="mt-2 text-sm text-text-secondary">Seus conteúdos e produtos liberados após a confirmação da compra.</p>

        <div className="mt-6 space-y-4">
          {loading ? (
            <p className="text-sm text-text-muted">Carregando compras...</p>
          ) : purchases.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border-dark p-6 text-sm text-text-muted">Nenhuma compra encontrada para este email.</div>
          ) : (
            purchases.map((purchase) => {
              const meta = statusMeta[purchase.status];
              const Icon = meta.icon;
              const canAccess = purchase.status === 'paid';
              return (
                <article key={purchase.id} className="rounded-3xl border border-border-dark bg-bg-dark p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-bold">{purchase.productDetails?.name || 'Produto'}</h2>
                      </div>
                      <p className="mt-2 text-sm text-text-secondary">{purchase.productDetails?.description || 'Sem descrição disponível.'}</p>
                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-text-muted">
                        <span>Data: {formatDate(purchase.createdAt)}</span>
                        <span>Valor: {formatCurrency(purchase.amount)}</span>
                        <span>Email: {purchase.buyerEmail}</span>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-border-dark px-4 py-2 text-sm">
                      <Icon className="h-4 w-4" />
                      {meta.label}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    {canAccess && purchase.productDetails?.type === 'digital' && purchase.productDetails?.fileUrl ? (
                      <a href={purchase.productDetails.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-3 text-sm font-semibold text-white">
                        <Download className="h-4 w-4" />
                        Acessar conteúdo
                      </a>
                    ) : canAccess ? (
                      <span className="rounded-xl border border-success/20 bg-success/10 px-4 py-3 text-sm font-semibold text-success">Acesso liberado</span>
                    ) : (
                      <span className="rounded-xl border border-warning/20 bg-warning/10 px-4 py-3 text-sm font-semibold text-warning">Acesso bloqueado até confirmação do pagamento</span>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
