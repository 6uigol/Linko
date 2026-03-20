import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { ArrowLeft } from 'lucide-react';
import { auth } from '../../lib/firebase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMessage('Enviamos o email de recuperação. Confira sua caixa de entrada.');
    } catch (err) {
      console.error(err);
      setError('Não foi possível enviar o email de recuperação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-dark px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-border-dark bg-surface p-8 shadow-2xl">
        <Link to="/login" className="mb-6 inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao login
        </Link>
        <h1 className="text-3xl font-bold">Recuperar senha</h1>
        <p className="mt-2 text-sm text-text-secondary">Digite seu email e enviaremos o link de redefinição.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {message && <div className="rounded-2xl border border-success/20 bg-success/10 p-3 text-sm text-success">{message}</div>}
          {error && <div className="rounded-2xl border border-error/20 bg-error/10 p-3 text-sm text-error">{error}</div>}

          <label className="block text-sm">
            <span className="mb-2 block text-text-secondary">Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-xl border border-border-dark bg-bg-dark px-4 py-3 outline-none focus:border-primary" />
          </label>

          <button disabled={loading} className="w-full rounded-xl bg-gradient-primary px-4 py-3 font-semibold text-white disabled:opacity-60">
            {loading ? 'Enviando...' : 'Enviar recuperação'}
          </button>
        </form>
      </div>
    </div>
  );
}
