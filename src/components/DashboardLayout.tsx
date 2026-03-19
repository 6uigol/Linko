import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, User, Settings, Link as LinkIcon, ShoppingBag, Users, Package } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Visão Geral', path: '/dashboard', icon: Settings },
    { name: 'Perfil', path: '/dashboard/profile', icon: User },
    { name: 'Links & Blocos', path: '/dashboard/links', icon: LinkIcon },
    { name: 'Produtos', path: '/dashboard/products', icon: ShoppingBag },
    { name: 'Minhas Compras', path: '/dashboard/purchases', icon: Package },
  ];

  return (
    <div className="min-h-screen bg-bg-dark flex text-text-primary">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-border-dark flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border-dark">
          <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-primary">Linko</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border-dark">
          <button
            onClick={logout}
            className="flex w-full items-center px-4 py-3 text-sm font-medium text-error hover:bg-error/10 rounded-xl transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
