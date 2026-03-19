import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Verifique seu email para redefinir sua senha.');
    } catch (err: any) {
      setError('Falha ao redefinir a senha. Verifique se o email está correto.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-bg-dark">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Link to="/login" className="inline-flex items-center text-sm font-medium text-text-secondary hover:text-text-primary transition-colors mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para o Login
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold leading-9 tracking-tight text-text-primary">
          Recuperar senha
        </h2>
        <p className="mt-2 text-center text-sm text-text-secondary">
          Digite seu email e enviaremos um link para você redefinir sua senha.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="bg-surface px-6 py-8 shadow-lg rounded-2xl border border-border-dark">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-error/10 border border-error/20 text-error p-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            {message && (
              <div className="bg-success/10 border border-success/20 text-success p-3 rounded-xl text-sm">
                {message}
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
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-xl bg-gradient-primary px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-md hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 transition-all"
              >
                {loading ? 'Enviando...' : 'Enviar link de recuperação'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
