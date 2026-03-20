import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ArrowLeft } from 'lucide-react';
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
    <div className="flex min-h-screen items-center justify-center bg-bg-dark px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-border-dark bg-surface p-8 shadow-2xl">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary">
          <ArrowLeft className="h-4 w-4" />
          Voltar para a home
        </Link>
        <h1 className="text-3xl font-bold">Entrar</h1>
        <p className="mt-2 text-sm text-text-secondary">Acesse sua dashboard, produtos e área de membros.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && <div className="rounded-2xl border border-error/20 bg-error/10 p-3 text-sm text-error">{error}</div>}

          <label className="block text-sm">
            <span className="mb-2 block text-text-secondary">Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-xl border border-border-dark bg-bg-dark px-4 py-3 outline-none focus:border-primary" />
          </label>

          <label className="block text-sm">
            <div className="mb-2 flex items-center justify-between text-text-secondary">
              <span>Senha</span>
              <Link to="/forgot-password" className="text-primary hover:text-primary-hover">Esqueci a senha</Link>
            </div>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-xl border border-border-dark bg-bg-dark px-4 py-3 outline-none focus:border-primary" />
          </label>

          <button disabled={loading} className="w-full rounded-xl bg-gradient-primary px-4 py-3 font-semibold text-white disabled:opacity-60">
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
  );
}
