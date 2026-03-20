import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CircleDollarSign, Package, ShoppingCart, Star, TrendingUp, UserRound, WalletCards } from 'lucide-react';
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

  const cards = useMemo(() => ([
    { title: 'Total de vendas', value: formatCurrency(metrics.totalSales), icon: CircleDollarSign, hint: 'Receita validada' },
    { title: 'Compradores', value: String(metrics.buyers), icon: UserRound, hint: 'Clientes ativos' },
    { title: 'Produtos cadastrados', value: String(metrics.products), icon: Package, hint: 'Itens à venda' },
    { title: 'Blocos ativos', value: String(metrics.blocks), icon: ShoppingCart, hint: 'Experiências publicadas' },
  ]), [metrics.blocks, metrics.buyers, metrics.products, metrics.totalSales]);

  return (
    <DashboardLayout>
      <section className="surface-panel overflow-hidden p-6 sm:p-8">
        <div className="bg-grid-premium absolute inset-0 opacity-25" />
        <div className="relative grid gap-8 xl:grid-cols-[1.2fr_0.8fr] xl:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Star className="h-4 w-4" />
              Painel mais profissional, responsivo e pronto para conversão
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight text-balance sm:text-5xl">
              Olá, {profile?.name}. Agora sua operação ficou mais elegante, clara e pronta para vender melhor.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-text-secondary sm:text-lg">
              Visual refinado, navegação mobile com hambúrguer à esquerda, incentivo para upgrade e identidade visual ajustável entre light, dark ou sistema.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/dashboard/links" className="inline-flex items-center gap-2 rounded-2xl bg-gradient-primary px-5 py-3.5 text-sm font-semibold text-white shadow-[0_18px_45px_-28px_rgba(109,94,247,0.95)]">
                Abrir editor
                <ArrowRight className="h-4 w-4" />
              </Link>
              {profile?.slug && (
                <a href={`/${profile.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl border border-border-dark bg-surface/80 px-5 py-3.5 text-sm font-semibold text-text-primary hover:bg-card">
                  Ver página pública
                  <ArrowRight className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          <div className="surface-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-text-muted">Próximo passo</p>
                <h2 className="mt-3 text-2xl font-bold">Convide o cliente para assinar o Pro</h2>
              </div>
              <div className="rounded-2xl bg-amber-500/12 p-3 text-amber-400">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 text-sm text-text-secondary">
              Dê mais valor com tema premium, catálogo expandido, experiência de checkout mais robusta e pagamento manual configurado para fechar vendas consultivas.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                'Mais blocos e produtos',
                'Experiência visual premium',
                'Pagamento manual configurado',
                'Layout otimizado em celular e desktop',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-border-dark bg-bg-dark/55 px-4 py-3 text-sm text-text-secondary">
                  {item}
                </div>
              ))}
            </div>
            <Link to="/dashboard/profile" className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:opacity-90">
              Configurar assinatura e recebimento
              <WalletCards className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.title} className="surface-card p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-text-secondary">{card.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-text-muted">{card.hint}</p>
                </div>
                <div className="rounded-2xl bg-primary/12 p-3 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-5 text-3xl font-bold">{loading ? '...' : card.value}</p>
            </article>
          );
        })}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="surface-panel p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Histórico de transações</h2>
              <p className="text-sm text-text-secondary">Últimos pagamentos do seu negócio em uma apresentação mais clara.</p>
            </div>
            <span className="rounded-full border border-border-dark bg-card/70 px-3 py-2 text-xs uppercase tracking-[0.24em] text-text-muted">
              {metrics.transactions.length} registros
            </span>
          </div>

          <div className="mt-6 overflow-hidden rounded-[24px] border border-border-dark">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-dark text-sm">
                <thead className="bg-card/75 text-left text-text-muted">
                  <tr>
                    <th className="px-4 py-4">Cliente</th>
                    <th className="px-4 py-4">Valor</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-dark bg-surface/40">
                  {metrics.transactions.length === 0 ? (
                    <tr>
                      <td className="px-4 py-8 text-text-muted" colSpan={4}>Nenhuma transação encontrada ainda.</td>
                    </tr>
                  ) : (
                    metrics.transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-card/60">
                        <td className="px-4 py-4">{transaction.buyerName || transaction.buyerEmail}</td>
                        <td className="px-4 py-4">{formatCurrency(transaction.amount)}</td>
                        <td className="px-4 py-4 capitalize">
                          <span className="rounded-full border border-border-dark bg-bg-dark/55 px-3 py-1.5 text-xs font-semibold tracking-[0.18em]">
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">{formatDate(transaction.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <section className="surface-panel p-6">
            <h2 className="text-2xl font-bold">Status do plano</h2>
            <p className="mt-3 text-sm text-text-secondary">
              Plano atual: <span className="font-semibold uppercase text-primary">{profile?.plan}</span>
            </p>
            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl border border-border-dark bg-card/70 p-4 text-sm text-text-secondary">Free: até 5 blocos e 3 produtos.</div>
              <div className="rounded-2xl border border-border-dark bg-card/70 p-4 text-sm text-text-secondary">Pro: blocos, produtos e personalização avançada sem limite.</div>
            </div>
            <Link to="/dashboard/profile" className="mt-5 inline-flex rounded-2xl border border-border-dark px-4 py-3 text-sm font-semibold text-text-primary hover:bg-card">
              Ajustar plano e recebimento
            </Link>
          </section>

          <section className="surface-panel p-6">
            <h2 className="text-2xl font-bold">Base de compradores</h2>
            <p className="mt-3 text-sm text-text-secondary">Você já converteu {metrics.buyers} comprador(es) únicos.</p>
            <div className="mt-5 rounded-2xl border border-border-dark bg-card/70 p-4 text-sm text-text-secondary">
              Use o pagamento manual configurado para negociar convites, upgrades e planos anuais de forma consultiva.
            </div>
            <Link to="/dashboard/purchases" className="mt-5 inline-flex rounded-2xl border border-border-dark px-4 py-3 text-sm font-semibold text-text-primary hover:bg-card">
              Ver acessos liberados
            </Link>
          </section>
        </div>
      </section>
    </DashboardLayout>
  );
}
