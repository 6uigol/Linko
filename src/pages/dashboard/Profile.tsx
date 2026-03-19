import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import DashboardLayout from '../../components/DashboardLayout';

export default function Profile() {
  const { profile, user, refreshProfile } = useAuth();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setMessage('');

    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        name,
        bio,
      });
      await refreshProfile();
      setMessage('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error(error);
      setMessage('Erro ao atualizar perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Editar Perfil</h1>
      </div>

      <div className="bg-surface shadow-lg rounded-2xl p-6 border border-border-dark">
        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <div className={`p-4 rounded-xl text-sm ${message.includes('sucesso') ? 'bg-success/10 border border-success/20 text-success' : 'bg-error/10 border border-error/20 text-error'}`}>
              {message}
            </div>
          )}

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-text-secondary">
              Sua URL (Não editável)
            </label>
            <div className="mt-2">
              <input
                type="text"
                disabled
                value={`linko.com/${profile?.slug}`}
                className="block w-full rounded-xl border-0 py-2.5 px-3 bg-bg-dark text-text-muted shadow-sm ring-1 ring-inset ring-border-dark sm:text-sm sm:leading-6 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-secondary">
              Nome de Exibição
            </label>
            <div className="mt-2">
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="block w-full rounded-xl border-0 py-2.5 px-3 bg-bg-dark text-text-primary shadow-sm ring-1 ring-inset ring-border-dark placeholder:text-text-muted focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-text-secondary">
              Biografia
            </label>
            <div className="mt-2">
              <textarea
                id="bio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="block w-full rounded-xl border-0 py-2.5 px-3 bg-bg-dark text-text-primary shadow-sm ring-1 ring-inset ring-border-dark placeholder:text-text-muted focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all"
                placeholder="Conte um pouco sobre você..."
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 transition-all"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
