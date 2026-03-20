import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleDollarSign, Package, ShoppingCart, UserRound } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { fetchDashboardMetrics, formatCurrency, formatDate, type PurchaseRecord } from '../../lib/app-data';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [metrics, setMetrics] = useState({ totalSales: 0, buyers: 0, products: 0, blocks: 0, transactions: [] as PurchaseRecord[] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      setLoading(true);
      try {
        setMetrics(await fetchDashboardMetrics(user.uid));
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [user]);

  const cards = [
    { title: 'Total de vendas', value: formatCurrency(metrics.totalSales), icon: CircleDollarSign },
    { title: 'Compradores', value: String(metrics.buyers), icon: UserRound },
    { title: 'Produtos cadastrados', value: String(metrics.products), icon: Package },
    { title: 'Blocos ativos', value: String(metrics.blocks), icon: ShoppingCart },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-text-muted">Bem-vindo de volta</p>
          <h1 className="text-3xl font-bold">Olá, {profile?.name}</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/dashboard/links" className="rounded-xl border border-border-dark px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-surface">
            Abrir editor
          </Link>
          {profile?.slug && (
            <a href={`/${profile.slug}`} target="_blank" rel="noreferrer" className="rounded-xl bg-gradient-primary px-4 py-3 text-sm font-semibold text-white">
              Ver página pública
            </a>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="rounded-3xl border border-border-dark bg-surface p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <p className="text-sm text-text-secondary">{card.title}</p>
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-4 text-3xl font-bold">{loading ? '...' : card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-3xl border border-border-dark bg-surface p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Histórico de transações</h2>
              <p className="text-sm text-text-secondary">Últimos pagamentos do seu negócio.</p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-border-dark">
            <table className="min-w-full divide-y divide-border-dark text-sm">
              <thead className="bg-bg-dark text-left text-text-muted">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {metrics.transactions.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-text-muted" colSpan={4}>Nenhuma transação encontrada ainda.</td>
                  </tr>
                ) : (
                  metrics.transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-4 py-3">{transaction.buyerName || transaction.buyerEmail}</td>
                      <td className="px-4 py-3">{formatCurrency(transaction.amount)}</td>
                      <td className="px-4 py-3 capitalize">{transaction.status}</td>
                      <td className="px-4 py-3">{formatDate(transaction.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-3xl border border-border-dark bg-surface p-6 shadow-xl">
            <h2 className="text-xl font-bold">Status do plano</h2>
            <p className="mt-2 text-sm text-text-secondary">Plano atual: <span className="font-semibold uppercase text-primary">{profile?.plan}</span></p>
            <ul className="mt-4 space-y-2 text-sm text-text-secondary">
              <li>• Free: até 5 blocos e 3 produtos.</li>
              <li>• Pro: blocos e produtos ilimitados.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-border-dark bg-surface p-6 shadow-xl">
            <h2 className="text-xl font-bold">Lista de compradores</h2>
            <p className="mt-2 text-sm text-text-secondary">Você já converteu {metrics.buyers} comprador(es) únicos.</p>
            <Link to="/dashboard/purchases" className="mt-5 inline-block rounded-xl border border-border-dark px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-bg-dark">
              Ver acessos liberados
            </Link>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
