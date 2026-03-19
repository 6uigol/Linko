import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ShoppingBag, Users, Link as LinkIcon, Settings } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

export default function Dashboard() {
  const { profile } = useAuth();

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-text-primary">
          Olá, {profile?.name}
        </h1>
        <a
          href={`/${profile?.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl text-white bg-gradient-primary shadow-md hover:opacity-90 transition-all"
        >
          Ver minha página
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-surface overflow-hidden shadow-lg rounded-2xl border border-border-dark">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-text-secondary truncate">Vendas (Mês)</dt>
                  <dd className="text-xl font-bold text-text-primary">R$ 0,00</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-surface overflow-hidden shadow-lg rounded-2xl border border-border-dark">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-text-secondary truncate">Compradores</dt>
                  <dd className="text-xl font-bold text-text-primary">0</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface overflow-hidden shadow-lg rounded-2xl border border-border-dark">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <LinkIcon className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-text-secondary truncate">Cliques na Página</dt>
                  <dd className="text-xl font-bold text-text-primary">0</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface overflow-hidden shadow-lg rounded-2xl border border-border-dark">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-text-secondary truncate">Plano Atual</dt>
                  <dd className="text-xl font-bold text-text-primary uppercase">{profile?.plan}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Plan Warning */}
      {profile?.plan === 'free' && (
        <div className="mt-8 bg-warning/10 border border-warning/20 rounded-2xl p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-warning">Aviso de Limites do Plano Free</h3>
              <div className="mt-2 text-sm text-warning/80">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Limite de 5 links/blocos no plano Free</li>
                  <li>Limite de 3 produtos no plano Free</li>
                </ul>
                <p className="mt-3 font-medium">
                  Faça upgrade para adicionar mais de 3 produtos e links ilimitados.
                  <a href="#" className="underline ml-2 hover:text-warning transition-colors">
                    Fazer upgrade agora &rarr;
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
