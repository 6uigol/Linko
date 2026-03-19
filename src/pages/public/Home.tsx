import { Link } from 'react-router-dom';
import { ArrowRight, Link as LinkIcon, ShoppingBag, Users, Zap, CheckCircle2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-dark text-text-primary selection:bg-primary/30">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-50 border-b border-border-dark/50 bg-bg-dark/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <Link to="/" className="-m-1.5 p-1.5 flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <LinkIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-primary">Linko</span>
            </Link>
          </div>
          <div className="flex flex-1 justify-end gap-x-4 items-center">
            <Link to="/login" className="text-sm font-semibold leading-6 text-text-secondary hover:text-text-primary transition-colors">
              Entrar
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-md hover:opacity-90 transition-all"
            >
              Começar grátis
            </Link>
          </div>
        </nav>
      </header>

      <main className="isolate pt-24">
        {/* Hero Section */}
        <section className="relative px-6 lg:px-8 py-24 sm:py-32 overflow-hidden">
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#5B5CF6] to-[#3B82F6] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
          </div>
          
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-6xl mb-6">
              Tudo o que você precisa em um <span className="text-transparent bg-clip-text bg-gradient-primary">só link</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-text-secondary mb-10">
              Crie sua página pública, venda produtos digitais e gerencie sua área de membros. A plataforma completa para criadores de conteúdo.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto rounded-xl bg-gradient-primary px-8 py-4 text-base font-semibold text-white shadow-lg hover:opacity-90 transition-all flex items-center justify-center"
              >
                Criar minha página grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <p className="text-sm text-text-muted sm:hidden">Não precisa de cartão de crédito</p>
            </div>
            <p className="mt-4 text-sm text-text-muted hidden sm:block">Não precisa de cartão de crédito. Configure em 2 minutos.</p>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-surface/50 border-y border-border-dark/50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center mb-16">
              <h2 className="text-base font-semibold leading-7 text-primary">Venda mais rápido</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                Ferramentas poderosas para o seu negócio
              </p>
            </div>
            <div className="mx-auto max-w-2xl lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                <div className="flex flex-col bg-bg-dark p-8 rounded-2xl border border-border-dark shadow-sm hover:border-primary/50 transition-colors">
                  <dt className="flex items-center gap-x-3 text-xl font-semibold leading-7 text-text-primary mb-4">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10">
                      <LinkIcon className="h-6 w-6 text-primary" aria-hidden="true" />
                    </div>
                    Link na Bio
                  </dt>
                  <dd className="flex flex-auto flex-col text-base leading-7 text-text-secondary">
                    <p className="flex-auto">
                      Reúna todos os seus links importantes em uma única página com design moderno e otimizado para conversão.
                    </p>
                  </dd>
                </div>
                <div className="flex flex-col bg-bg-dark p-8 rounded-2xl border border-border-dark shadow-sm hover:border-primary/50 transition-colors">
                  <dt className="flex items-center gap-x-3 text-xl font-semibold leading-7 text-text-primary mb-4">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10">
                      <ShoppingBag className="h-6 w-6 text-primary" aria-hidden="true" />
                    </div>
                    Venda de Produtos
                  </dt>
                  <dd className="flex flex-auto flex-col text-base leading-7 text-text-secondary">
                    <p className="flex-auto">
                      Venda e-books, consultorias e produtos digitais diretamente na sua página com checkout integrado via Mercado Pago.
                    </p>
                  </dd>
                </div>
                <div className="flex flex-col bg-bg-dark p-8 rounded-2xl border border-border-dark shadow-sm hover:border-primary/50 transition-colors">
                  <dt className="flex items-center gap-x-3 text-xl font-semibold leading-7 text-text-primary mb-4">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10">
                      <Users className="h-6 w-6 text-primary" aria-hidden="true" />
                    </div>
                    Área de Membros
                  </dt>
                  <dd className="flex flex-auto flex-col text-base leading-7 text-text-secondary">
                    <p className="flex-auto">
                      Entregue seus conteúdos digitais de forma segura e automática para seus clientes logo após a compra.
                    </p>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl sm:text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">Planos simples e transparentes</h2>
              <p className="mt-6 text-lg leading-8 text-text-secondary">
                Comece de graça e faça upgrade quando precisar de mais recursos.
              </p>
            </div>
            
            <div className="mx-auto grid max-w-md grid-cols-1 gap-8 lg:max-w-4xl lg:grid-cols-2">
              {/* Free Plan */}
              <div className="flex flex-col justify-between rounded-3xl bg-surface p-8 ring-1 ring-border-dark xl:p-10">
                <div>
                  <div className="flex items-center justify-between gap-x-4">
                    <h3 className="text-lg font-semibold leading-8 text-text-primary">Free</h3>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-text-secondary">Perfeito para começar e testar a plataforma.</p>
                  <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-4xl font-bold tracking-tight text-text-primary">R$ 0</span>
                    <span className="text-sm font-semibold leading-6 text-text-secondary">/mês</span>
                  </p>
                  <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-text-secondary">
                    <li className="flex gap-x-3">
                      <CheckCircle2 className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                      Até 5 links ou blocos de texto
                    </li>
                    <li className="flex gap-x-3">
                      <CheckCircle2 className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                      Até 3 produtos digitais
                    </li>
                    <li className="flex gap-x-3">
                      <CheckCircle2 className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                      Checkout integrado (Mercado Pago)
                    </li>
                    <li className="flex gap-x-3">
                      <CheckCircle2 className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                      Área de membros básica
                    </li>
                  </ul>
                </div>
                <Link
                  to="/register"
                  className="mt-8 block rounded-xl bg-bg-dark px-3 py-3 text-center text-sm font-semibold leading-6 text-text-primary ring-1 ring-inset ring-border-dark hover:ring-primary/50 transition-all"
                >
                  Começar grátis
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="flex flex-col justify-between rounded-3xl bg-surface p-8 ring-2 ring-primary xl:p-10 relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-primary px-4 py-1 text-xs font-semibold text-white">
                  Mais Popular
                </div>
                <div>
                  <div className="flex items-center justify-between gap-x-4">
                    <h3 className="text-lg font-semibold leading-8 text-primary">Pro</h3>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-text-secondary">Para criadores que querem escalar suas vendas.</p>
                  <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-4xl font-bold tracking-tight text-text-primary">R$ 29</span>
                    <span className="text-sm font-semibold leading-6 text-text-secondary">/mês</span>
                  </p>
                  <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-text-secondary">
                    <li className="flex gap-x-3">
                      <CheckCircle2 className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                      Links e blocos ilimitados
                    </li>
                    <li className="flex gap-x-3">
                      <CheckCircle2 className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                      Produtos ilimitados
                    </li>
                    <li className="flex gap-x-3">
                      <CheckCircle2 className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                      Taxa zero da plataforma nas vendas
                    </li>
                    <li className="flex gap-x-3">
                      <CheckCircle2 className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                      Suporte prioritário
                    </li>
                  </ul>
                </div>
                <Link
                  to="/register"
                  className="mt-8 block rounded-xl bg-gradient-primary px-3 py-3 text-center text-sm font-semibold leading-6 text-white shadow-md hover:opacity-90 transition-all"
                >
                  Assinar Pro
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-dark/50 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-gradient-primary flex items-center justify-center">
              <LinkIcon className="h-3 w-3 text-white" />
            </div>
            <span className="text-lg font-bold text-text-primary">Linko</span>
          </div>
          <p className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} Linko. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
