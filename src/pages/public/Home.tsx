import { Link } from 'react-router-dom';
import { CheckCircle2, Layers3, MenuSquare, MoonStar, ShieldCheck, ShoppingBag, Sparkles, WalletCards } from 'lucide-react';

const features = [
  { icon: Layers3, title: 'Editor visual refinado', text: 'Blocos de links, textos, produtos e conteúdos exclusivos com preview em tempo real e navegação mais limpa.' },
  { icon: ShoppingBag, title: 'Vendas com presença premium', text: 'Checkout existente, pagamento manual configurável e vitrine com mais confiança visual para aumentar conversão.' },
  { icon: MenuSquare, title: 'Mobile profissional', text: 'Novo menu hambúrguer à esquerda e melhor leitura no celular sem perder a força da versão desktop.' },
  { icon: MoonStar, title: 'Light, dark ou sistema', text: 'A interface acompanha a preferência escolhida no login e mantém consistência visual em todo o painel.' },
  { icon: ShieldCheck, title: 'Área de membros', text: 'Acesso liberado após compra com proteção por produto, comprador e experiência de entrega mais clara.' },
  { icon: Sparkles, title: 'Assinatura pronta para vender', text: 'CTA de upgrade, percepção premium e estrutura para escalar seu plano com mais autoridade.' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-dark text-text-primary">
      <header className="sticky top-0 z-20 border-b border-border-dark bg-bg-dark/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.34em] text-primary">Linko</p>
            <h1 className="mt-2 text-lg font-semibold">Página profissional + vendas + membros</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden text-sm text-text-secondary transition hover:text-text-primary sm:inline-flex">Entrar</Link>
            <Link to="/register" className="rounded-2xl bg-gradient-primary px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_-28px_rgba(109,94,247,0.95)]">Começar grátis</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-8 lg:py-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary">
              <CheckCircle2 className="h-4 w-4" />
              Visual redesenhado para parecer software premium de verdade
            </p>
            <h2 className="mt-6 max-w-3xl text-4xl font-bold leading-tight text-balance sm:text-5xl lg:text-6xl">
              Venda, entregue e gerencie assinaturas em uma interface muito mais bonita e profissional.
            </h2>
            <p className="mt-6 max-w-2xl text-base text-text-secondary sm:text-lg">
              Layout mais elegante, experiência otimizada para celular e computador, modo light/dark por preferência do login e um bloco de pagamento manual pronto para sua operação receber com mais flexibilidade.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/register" className="rounded-2xl bg-gradient-primary px-6 py-4 text-base font-semibold text-white shadow-[0_20px_55px_-30px_rgba(109,94,247,0.95)]">Criar minha conta</Link>
              <Link to="/login" className="rounded-2xl border border-border-dark bg-surface/80 px-6 py-4 text-base font-semibold text-text-primary hover:bg-card">Já tenho conta</Link>
            </div>
          </div>

          <div className="surface-panel relative overflow-hidden p-6 sm:p-8">
            <div className="bg-grid-premium absolute inset-0 opacity-30" />
            <div className="relative grid gap-5">
              <div className="surface-card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-text-muted">Fluxo principal</p>
                    <h3 className="mt-2 text-2xl font-bold">Dashboard impecável</h3>
                  </div>
                  <WalletCards className="h-8 w-8 text-primary" />
                </div>
                <ul className="mt-5 space-y-3 text-sm text-text-secondary">
                  <li>• Login com preferência light/dark/sistema.</li>
                  <li>• Menu hambúrguer lateral para celular.</li>
                  <li>• CTA de assinatura com percepção premium.</li>
                  <li>• Recebimento manual configurável para vendas consultivas.</li>
                </ul>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="surface-card p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-text-muted">Celular</p>
                  <p className="mt-3 text-lg font-semibold">Navegação clara</p>
                  <p className="mt-2 text-sm text-text-secondary">Menu, espaçamento e hierarquia pensados para uso com uma mão.</p>
                </div>
                <div className="surface-card p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-text-muted">Desktop</p>
                  <p className="mt-3 text-lg font-semibold">Mais autoridade</p>
                  <p className="mt-2 text-sm text-text-secondary">Blocos amplos, cards elegantes e uma leitura mais corporativa.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border-dark bg-surface/40 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.34em] text-primary">Experiência</p>
                <h3 className="mt-3 text-3xl font-bold text-balance">Tudo ficou mais sério, elegante e pronto para vender.</h3>
              </div>
              <p className="max-w-2xl text-sm text-text-secondary sm:text-base">A proposta agora é transmitir valor na primeira dobra, incentivar upgrade e deixar o criador com mais controle de interface e pagamento.</p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article key={feature.title} className="surface-card p-6">
                    <div className="rounded-2xl bg-primary/12 p-3 text-primary w-fit">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h4 className="mt-5 text-xl font-bold">{feature.title}</h4>
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
