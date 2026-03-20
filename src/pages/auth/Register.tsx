import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { ArrowLeft } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { createInitialProfile } from '../../lib/app-data';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('Use ao menos 6 caracteres na senha.');
      return;
    }

    setLoading(true);

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(user, { displayName: name.trim() });
      await createInitialProfile(user.uid, { email: user.email ?? email.trim(), name: name.trim() });
      navigate('/onboarding');
    } catch (err) {
      console.error(err);
      setError('Não foi possível criar sua conta agora. Verifique os dados e tente novamente.');
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
        <h1 className="text-3xl font-bold">Criar conta</h1>
        <p className="mt-2 text-sm text-text-secondary">Cadastre seu nome, email e senha. Sem pedir URL no cadastro.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && <div className="rounded-2xl border border-error/20 bg-error/10 p-3 text-sm text-error">{error}</div>}

          <label className="block text-sm">
            <span className="mb-2 block text-text-secondary">Nome</span>
            <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-xl border border-border-dark bg-bg-dark px-4 py-3 outline-none focus:border-primary" />
          </label>

          <label className="block text-sm">
            <span className="mb-2 block text-text-secondary">Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-xl border border-border-dark bg-bg-dark px-4 py-3 outline-none focus:border-primary" />
          </label>

          <label className="block text-sm">
            <span className="mb-2 block text-text-secondary">Senha</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-xl border border-border-dark bg-bg-dark px-4 py-3 outline-none focus:border-primary" />
          </label>

          <label className="block text-sm">
            <span className="mb-2 block text-text-secondary">Confirmar senha</span>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full rounded-xl border border-border-dark bg-bg-dark px-4 py-3 outline-none focus:border-primary" />
          </label>

          <button disabled={loading} className="w-full rounded-xl bg-gradient-primary px-4 py-3 font-semibold text-white disabled:opacity-60">
            {loading ? 'Criando conta...' : 'Cadastrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Já tem conta?{' '}
          <Link to="/login" className="font-semibold text-primary hover:text-primary-hover">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
