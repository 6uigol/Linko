import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CreditCard, Home, LayoutTemplate, LogOut, Menu, MoonStar, Package, ShoppingBag, User, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: Home },
  { name: 'Perfil e tema', path: '/dashboard/profile', icon: User },
  { name: 'Editor', path: '/dashboard/links', icon: LayoutTemplate },
  { name: 'Produtos', path: '/dashboard/products', icon: ShoppingBag },
  { name: 'Área de membros', path: '/dashboard/purchases', icon: Package },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { logout, profile } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const appearanceLabel = useMemo(() => {
    switch (profile?.appearance) {
      case 'light':
        return 'Light';
      case 'system':
        return 'Sistema';
      default:
        return 'Dark';
    }
  }, [profile?.appearance]);

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between border-b border-border-dark px-5 py-5">
        <div>
          <p className="text-xs uppercase tracking-[0.34em] text-primary">Linko</p>
          <h1 className="mt-2 text-lg font-semibold">Painel premium</h1>
        </div>
        <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {profile?.plan ?? 'free'}
        </div>
      </div>

      <div className="px-5 pt-5">
        <div className="surface-card p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-text-muted">Experiência</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="rounded-2xl bg-primary/12 p-3 text-primary">
              <MoonStar className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">Tema {appearanceLabel}</p>
              <p className="text-sm text-text-secondary">A interface acompanha sua preferência de login.</p>
            </div>
          </div>
        </div>
      </div>

      <nav className="grid gap-2 p-5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium transition-all ${
                active
                  ? 'bg-gradient-primary text-white shadow-[0_14px_40px_-24px_rgba(109,94,247,0.9)]'
                  : 'text-text-secondary hover:bg-card hover:text-text-primary'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4 px-5 pb-5">
        <div className="surface-card p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-emerald-500/12 p-3 text-emerald-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">Modo assinatura</p>
              <p className="mt-1 text-sm text-text-secondary">Ative seu Linko Pro para desbloquear catálogo e blocos ilimitados.</p>
            </div>
          </div>
          <Link to="/dashboard/profile" onClick={() => setIsMenuOpen(false)} className="mt-4 inline-flex rounded-xl bg-gradient-primary px-4 py-3 text-sm font-semibold text-white">
            Ver plano e pagamento
          </Link>
        </div>

        <button
          onClick={() => void logout()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border-dark px-4 py-3.5 text-sm font-semibold text-text-secondary transition hover:bg-card hover:text-text-primary"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-bg-dark text-text-primary lg:flex">
      <div className="sticky top-0 z-30 border-b border-border-dark bg-bg-dark/85 backdrop-blur xl:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-border-dark bg-surface/80 px-4 py-3 text-sm font-semibold text-text-primary"
          >
            <Menu className="h-5 w-5" />
            Menu
          </button>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.28em] text-primary">Linko</p>
            <p className="text-sm text-text-secondary">{profile?.pageName ?? profile?.name ?? 'Criador'}</p>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-sm xl:hidden" onClick={() => setIsMenuOpen(false)}>
          <aside className="flex h-full w-[88%] max-w-sm flex-col border-r border-border-dark bg-bg-dark" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border-dark px-5 py-4">
              <p className="text-sm font-semibold">Navegação</p>
              <button type="button" onClick={() => setIsMenuOpen(false)} className="rounded-xl border border-border-dark p-2 text-text-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}

      <aside className="hidden min-h-screen w-80 flex-col border-r border-border-dark bg-bg-dark/80 backdrop-blur xl:flex">
        {sidebarContent}
      </aside>

      <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 xl:px-10 xl:py-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
