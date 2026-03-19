import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, getDocs, query, collection, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';

export default function Onboarding() {
  const { user, profile, refreshProfile } = useAuth();
  const [pageName, setPageName] = useState('');
  const [slug, setSlug] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  
  const [slugError, setSlugError] = useState('');
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Redirect if already completed
  useEffect(() => {
    if (profile?.onboardingCompleted) {
      navigate('/dashboard');
    }
  }, [profile, navigate]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Apenas letras minúsculas, números e hífens
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(value);
    setSlugError('');
  };

  const checkSlugAvailability = async (slugToCheck: string) => {
    if (!slugToCheck) return false;
    
    setIsCheckingSlug(true);
    try {
      const q = query(collection(db, 'users'), where('slug', '==', slugToCheck));
      const querySnapshot = await getDocs(q);
      
      // If it's not empty, it means the slug is taken.
      // We also need to make sure the taken slug doesn't belong to the current user (though unlikely in onboarding)
      const isTaken = !querySnapshot.empty && querySnapshot.docs[0].id !== user?.uid;
      
      if (isTaken) {
        setSlugError('Este link já está em uso. Que tal tentar: ' + slugToCheck + '-' + Math.floor(Math.random() * 1000));
        return false;
      }
      
      setSlugError('');
      return true;
    } catch (err) {
      console.error('Error checking slug:', err);
      return false;
    } finally {
      setIsCheckingSlug(false);
    }
  };

  // Debounce slug check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (slug.length > 2) {
        checkSlugAvailability(slug);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!user) return;
    
    if (!pageName.trim()) {
      setError('O nome da página é obrigatório.');
      return;
    }

    if (!slug.trim()) {
      setError('O link da página é obrigatório.');
      return;
    }

    if (slugError) {
      setError('Por favor, escolha um link válido e disponível.');
      return;
    }

    setLoading(true);

    try {
      // Final check before saving
      const isAvailable = await checkSlugAvailability(slug);
      if (!isAvailable) {
        throw new Error('Este link já está em uso. Escolha outro.');
      }

      // Update user profile
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        pageName,
        slug,
        bio,
        photoUrl,
        onboardingCompleted: true,
      });

      await refreshProfile();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Falha ao salvar os dados. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-bg-dark">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-text-primary">
          Crie sua página pública
        </h2>
        <p className="mt-2 text-center text-sm text-text-secondary">
          Personalize como as pessoas vão ver o seu perfil.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-8 px-4 shadow-lg sm:rounded-2xl sm:px-10 border border-border-dark">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-error/10 border border-error/20 text-error p-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="pageName" className="block text-sm font-medium text-text-secondary">
                Nome da Página <span className="text-error">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="pageName"
                  name="pageName"
                  type="text"
                  required
                  value={pageName}
                  onChange={(e) => setPageName(e.target.value)}
                  className="block w-full rounded-xl border-0 py-2.5 px-3 bg-bg-dark text-text-primary shadow-sm ring-1 ring-inset ring-border-dark placeholder:text-text-muted focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm transition-all"
                  placeholder="Ex: Guilherme Lima"
                />
              </div>
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-text-secondary">
                Seu Link Único <span className="text-error">*</span>
              </label>
              <div className="mt-1 flex rounded-xl shadow-sm ring-1 ring-inset ring-border-dark focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary bg-bg-dark overflow-hidden transition-all">
                <span className="inline-flex items-center px-3 text-text-muted sm:text-sm border-r border-border-dark bg-surface/50">
                  linko.com/
                </span>
                <input
                  type="text"
                  name="slug"
                  id="slug"
                  required
                  value={slug}
                  onChange={handleSlugChange}
                  className="block w-full min-w-0 flex-1 border-0 bg-transparent py-2.5 px-3 text-text-primary placeholder:text-text-muted focus:ring-0 sm:text-sm"
                  placeholder="seu-nome"
                />
              </div>
              {slugError && (
                <p className="mt-2 text-sm text-error" id="slug-error">
                  {slugError}
                </p>
              )}
              {isCheckingSlug && (
                <p className="mt-2 text-sm text-text-muted">Verificando disponibilidade...</p>
              )}
              {!slugError && !isCheckingSlug && slug.length > 2 && (
                <p className="mt-2 text-sm text-success">
                  Link disponível! Sua página será: <strong>linko.com/{slug}</strong>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-text-secondary">
                Bio (Opcional)
              </label>
              <div className="mt-1">
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="block w-full rounded-xl border-0 py-2.5 px-3 bg-bg-dark text-text-primary shadow-sm ring-1 ring-inset ring-border-dark placeholder:text-text-muted focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm transition-all"
                  placeholder="Conte um pouco sobre você..."
                />
              </div>
            </div>

            <div>
              <label htmlFor="photoUrl" className="block text-sm font-medium text-text-secondary">
                URL da Foto de Perfil (Opcional)
              </label>
              <div className="mt-1">
                <input
                  id="photoUrl"
                  name="photoUrl"
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="block w-full rounded-xl border-0 py-2.5 px-3 bg-bg-dark text-text-primary shadow-sm ring-1 ring-inset ring-border-dark placeholder:text-text-muted focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm transition-all"
                  placeholder="https://exemplo.com/sua-foto.jpg"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !!slugError || isCheckingSlug}
                className="flex w-full justify-center rounded-xl bg-gradient-primary px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-md hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 transition-all"
              >
                {loading ? 'Salvando...' : 'Concluir e ir para o Dashboard'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
