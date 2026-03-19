import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { ArrowLeft } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Falha ao fazer login. Verifique suas credenciais.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-bg-dark">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-text-secondary hover:text-text-primary transition-colors mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para a Home
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold leading-9 tracking-tight text-text-primary">
          Entre na sua conta
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="bg-surface px-6 py-8 shadow-lg rounded-2xl border border-border-dark">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-error/10 border border-error/20 text-error p-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-text-secondary">
                Email
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border-0 py-2.5 px-3 bg-bg-dark text-text-primary shadow-sm ring-1 ring-inset ring-border-dark placeholder:text-text-muted focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-text-secondary">
                  Senha
                </label>
                <div className="text-sm">
                  <Link to="/forgot-password" className="font-semibold text-primary hover:text-primary-hover transition-colors">
                    Esqueceu a senha?
                  </Link>
                </div>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border-0 py-2.5 px-3 bg-bg-dark text-text-primary shadow-sm ring-1 ring-inset ring-border-dark placeholder:text-text-muted focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-xl bg-gradient-primary px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-md hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 transition-all"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          </form>
        </div>

        <p className="mt-8 text-center text-sm text-text-muted">
          Não tem uma conta?{' '}
          <Link to="/register" className="font-semibold leading-6 text-primary hover:text-primary-hover transition-colors">
            Cadastre-se grátis
          </Link>
        </p>
      </div>
    </div>
  );
}
