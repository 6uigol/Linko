import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ArrowLeft, MoonStar, ShieldCheck } from 'lucide-react';
import { auth } from '../../lib/firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = (location.state as { from?: { pathname?: string } } | undefined)?.from?.pathname || '/dashboard';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error(err);
      setError('Falha no login. Confira email e senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark px-5 py-8 text-text-primary sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch">
        <div className="surface-panel flex flex-col justify-between p-7 sm:p-8">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary">
              <ArrowLeft className="h-4 w-4" />
              Voltar para a home
            </Link>
            <p className="mt-10 text-xs uppercase tracking-[0.34em] text-primary">Acesso</p>
            <h1 className="mt-4 text-4xl font-bold text-balance">Entre em uma área mais profissional, clara e pronta para vender.</h1>
            <p className="mt-4 max-w-xl text-base text-text-secondary">
              Ao entrar, o painel passa a respeitar sua preferência visual e entrega uma experiência refinada em mobile e desktop.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="surface-card p-5">
              <MoonStar className="h-6 w-6 text-primary" />
              <p className="mt-4 font-semibold">Tema inteligente</p>
              <p className="mt-2 text-sm text-text-secondary">Modo light, dark ou sistema aplicado pela sua preferência de login.</p>
            </div>
            <div className="surface-card p-5">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <p className="mt-4 font-semibold">Operação organizada</p>
              <p className="mt-2 text-sm text-text-secondary">Produtos, compras, membros e pagamento com apresentação mais séria.</p>
            </div>
          </div>
        </div>

        <div className="surface-panel p-7 sm:p-8">
          <h2 className="text-3xl font-bold">Entrar</h2>
          <p className="mt-2 text-sm text-text-secondary">Acesse sua dashboard, produtos e área de membros.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && <div className="rounded-2xl border border-error/20 bg-error/10 p-3 text-sm text-error">{error}</div>}

            <label className="block text-sm">
              <span className="mb-2 block text-text-secondary">Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-2xl border border-border-dark bg-bg-dark/80 px-4 py-3.5 outline-none focus:border-primary" />
            </label>

            <label className="block text-sm">
              <div className="mb-2 flex items-center justify-between text-text-secondary">
                <span>Senha</span>
                <Link to="/forgot-password" className="text-primary hover:text-primary-hover">Esqueci a senha</Link>
              </div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-2xl border border-border-dark bg-bg-dark/80 px-4 py-3.5 outline-none focus:border-primary" />
            </label>

            <button disabled={loading} className="w-full rounded-2xl bg-gradient-primary px-4 py-3.5 font-semibold text-white disabled:opacity-60">
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-text-secondary">
            Não tem conta?{' '}
            <Link to="/register" className="font-semibold text-primary hover:text-primary-hover">
              Criar conta grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
