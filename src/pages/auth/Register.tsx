import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { ArrowLeft, Sparkles, WalletCards } from 'lucide-react';
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
    <div className="min-h-screen bg-bg-dark px-5 py-8 text-text-primary sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.96fr_1.04fr] lg:items-stretch">
        <div className="surface-panel flex flex-col justify-between p-7 sm:p-8">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary">
              <ArrowLeft className="h-4 w-4" />
              Voltar para a home
            </Link>
            <p className="mt-10 text-xs uppercase tracking-[0.34em] text-primary">Comece melhor</p>
            <h1 className="mt-4 text-4xl font-bold text-balance">Crie sua conta e já entre com estrutura premium desde o primeiro acesso.</h1>
            <p className="mt-4 max-w-xl text-base text-text-secondary">
              O cadastro já nasce com identidade profissional, preferência de tema pronta para uso e área de pagamento manual configurável no painel.
            </p>
          </div>

          <div className="mt-10 space-y-4">
            <div className="surface-card flex items-start gap-4 p-5">
              <div className="rounded-2xl bg-primary/12 p-3 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Experiência mais bonita</p>
                <p className="mt-1 text-sm text-text-secondary">Novo layout com mais contraste, ritmo visual e hierarquia de informação.</p>
              </div>
            </div>
            <div className="surface-card flex items-start gap-4 p-5">
              <div className="rounded-2xl bg-primary/12 p-3 text-primary">
                <WalletCards className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Pagamento mais flexível</p>
                <p className="mt-1 text-sm text-text-secondary">Configure o recebimento manual e prepare convites para assinatura com mais autoridade.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="surface-panel p-7 sm:p-8">
          <h2 className="text-3xl font-bold">Criar conta</h2>
          <p className="mt-2 text-sm text-text-secondary">Cadastre seu nome, email e senha. Sem pedir URL no cadastro.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && <div className="rounded-2xl border border-error/20 bg-error/10 p-3 text-sm text-error">{error}</div>}

            <label className="block text-sm">
              <span className="mb-2 block text-text-secondary">Nome</span>
              <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-2xl border border-border-dark bg-bg-dark/80 px-4 py-3.5 outline-none focus:border-primary" />
            </label>

            <label className="block text-sm">
              <span className="mb-2 block text-text-secondary">Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-2xl border border-border-dark bg-bg-dark/80 px-4 py-3.5 outline-none focus:border-primary" />
            </label>

            <label className="block text-sm">
              <span className="mb-2 block text-text-secondary">Senha</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-2xl border border-border-dark bg-bg-dark/80 px-4 py-3.5 outline-none focus:border-primary" />
            </label>

            <label className="block text-sm">
              <span className="mb-2 block text-text-secondary">Confirmar senha</span>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full rounded-2xl border border-border-dark bg-bg-dark/80 px-4 py-3.5 outline-none focus:border-primary" />
            </label>

            <button disabled={loading} className="w-full rounded-2xl bg-gradient-primary px-4 py-3.5 font-semibold text-white disabled:opacity-60">
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
    </div>
  );
}
