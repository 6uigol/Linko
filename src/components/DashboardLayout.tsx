import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutTemplate, LogOut, Package, ShoppingBag, User } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-bg-dark text-text-primary lg:flex">
      <aside className="border-b border-border-dark bg-surface lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-dark">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Linko</p>
            <h1 className="text-lg font-semibold">Painel do criador</h1>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary uppercase">
            {profile?.plan ?? 'free'}
          </span>
        </div>

        <nav className="grid gap-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  active ? 'bg-primary/15 text-primary' : 'text-text-secondary hover:bg-bg-dark hover:text-text-primary'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 pb-4 lg:absolute lg:bottom-0 lg:w-72">
          <button
            onClick={() => void logout()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border-dark px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-bg-dark hover:text-text-primary"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
