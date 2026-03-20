import { Link } from 'react-router-dom';
import { CheckCircle2, Layers3, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react';

const features = [
  { icon: Layers3, title: 'Editor visual', text: 'Blocos de links, textos, produtos e conteúdos exclusivos com preview em tempo real.' },
  { icon: ShoppingBag, title: 'Vendas e checkout', text: 'Checkout com Mercado Pago, webhook validado e atualização automática de status.' },
  { icon: ShieldCheck, title: 'Área de membros', text: 'Acesso liberado após a compra com validação por produto e comprador.' },
  { icon: Sparkles, title: 'Escalável', text: 'Estrutura pronta para expansão futura com Firebase, Vercel e regras de segurança.' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-dark text-text-primary">
      <header className="border-b border-border-dark bg-bg-dark/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary">Linko</p>
            <h1 className="text-lg font-semibold">Página pública + vendas + membros</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-text-secondary hover:text-text-primary">Entrar</Link>
            <Link to="/register" className="rounded-xl bg-gradient-primary px-4 py-3 text-sm font-semibold text-white">Começar grátis</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary">
              <CheckCircle2 className="h-4 w-4" /> Sistema funcional sem IA embarcada
            </p>
            <h2 className="mt-6 text-5xl font-bold leading-tight">Venda seus produtos e concentre tudo em um único link.</h2>
            <p className="mt-6 max-w-2xl text-lg text-text-secondary">Cadastro, login, onboarding com slug único, dashboard com métricas, editor, área pública, checkout Mercado Pago, conteúdos pagos e proteção por acesso.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/register" className="rounded-xl bg-gradient-primary px-6 py-4 text-base font-semibold text-white">Criar minha conta</Link>
              <Link to="/login" className="rounded-xl border border-border-dark px-6 py-4 text-base font-semibold text-text-secondary hover:bg-surface">Já tenho conta</Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border-dark bg-surface p-8 shadow-2xl">
            <div className="rounded-[1.5rem] border border-border-dark bg-bg-dark p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-primary">Fluxo pronto</p>
              <ul className="mt-6 space-y-4 text-sm text-text-secondary">
                <li>• Cadastro com nome, email e senha.</li>
                <li>• Onboarding sem pedir URL no cadastro.</li>
                <li>• Upload de produto digital no Firebase Storage.</li>
                <li>• Checkout Mercado Pago com retorno de status.</li>
                <li>• Área de membros e acesso pós-compra.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="border-y border-border-dark bg-surface/50 py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article key={feature.title} className="rounded-3xl border border-border-dark bg-bg-dark p-6">
                    <Icon className="h-8 w-8 text-primary" />
                    <h3 className="mt-4 text-xl font-bold">{feature.title}</h3>
                    <p className="mt-3 text-sm text-text-secondary">{feature.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
