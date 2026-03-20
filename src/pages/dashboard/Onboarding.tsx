import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, UserRound } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getPublicPreview, isSlugAvailable, reserveSlugAndCompleteOnboarding, slugify, uploadFile } from '../../lib/app-data';

export default function Onboarding() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [pageName, setPageName] = useState(profile?.pageName || profile?.name || '');
  const [slug, setSlug] = useState(profile?.slug || slugify(profile?.name || ''));
  const [bio, setBio] = useState(profile?.bio || '');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState(profile?.photoUrl || '');
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile?.onboardingCompleted) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, profile?.onboardingCompleted]);

  useEffect(() => {
    if (!slug || slug.length < 3) {
      setSlugStatus('idle');
      return;
    }

    const timer = window.setTimeout(async () => {
      setSlugStatus('checking');
      const available = await isSlugAvailable(slug, user?.uid);
      setSlugStatus(available ? 'available' : 'unavailable');
    }, 400);

    return () => window.clearTimeout(timer);
  }, [slug, user?.uid]);

  const previewUrl = useMemo(() => getPublicPreview(slug), [slug]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!user || !user.email) return;

    if (!pageName.trim()) {
      setError('Informe o nome da página.');
      return;
    }

    if (!slug.trim() || slug.length < 3) {
      setError('Escolha um username com pelo menos 3 caracteres.');
      return;
    }

    if (slugStatus === 'unavailable') {
      setError('Esse username já está em uso.');
      return;
    }

    setLoading(true);
    try {
      const photoUrl = photoFile ? await uploadFile(user.uid, 'avatars', photoFile) : photoPreview;
      await reserveSlugAndCompleteOnboarding({
        uid: user.uid,
        email: user.email,
        name: profile?.name || user.displayName || pageName,
        pageName: pageName.trim(),
        slug,
        bio: bio.trim(),
        photoUrl,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error(err);
      setError('Não foi possível concluir seu onboarding agora.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark px-5 py-8 text-text-primary sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="surface-panel p-7 sm:p-8">
          <p className="text-xs uppercase tracking-[0.34em] text-primary">Primeiro acesso</p>
          <h1 className="mt-4 text-4xl font-bold text-balance">Configure sua página com uma presença muito mais profissional.</h1>
          <p className="mt-3 text-sm text-text-secondary">Solicitamos apenas o essencial para publicar sua página com boa apresentação em celular e computador.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && <div className="rounded-2xl border border-error/20 bg-error/10 p-3 text-sm text-error">{error}</div>}

            <label className="block text-sm">
              <span className="mb-2 block text-text-secondary">Nome da página</span>
              <input value={pageName} onChange={(e) => setPageName(e.target.value)} required className="w-full rounded-2xl border border-border-dark bg-bg-dark/80 px-4 py-3.5 outline-none focus:border-primary" placeholder="Ex: Studio da Ana" />
            </label>

            <label className="block text-sm">
              <span className="mb-2 block text-text-secondary">Username único</span>
              <div className="flex overflow-hidden rounded-2xl border border-border-dark bg-bg-dark/80">
                <span className="border-r border-border-dark px-4 py-3.5 text-text-muted">/</span>
                <input
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  required
                  className="w-full bg-transparent px-4 py-3.5 outline-none"
                  placeholder="seu-username"
                />
              </div>
              <p className="mt-2 text-xs text-text-muted">Preview: {previewUrl}</p>
              {slugStatus === 'checking' && <p className="mt-1 text-xs text-text-muted">Verificando disponibilidade...</p>}
              {slugStatus === 'available' && <p className="mt-1 text-xs text-success">Username disponível.</p>}
              {slugStatus === 'unavailable' && <p className="mt-1 text-xs text-error">Esse username já está em uso.</p>}
            </label>

            <label className="block text-sm">
              <span className="mb-2 block text-text-secondary">Bio opcional</span>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="w-full rounded-2xl border border-border-dark bg-bg-dark/80 px-4 py-3.5 outline-none focus:border-primary" placeholder="Explique quem é você, o que vende e por que sua oferta é especial." />
            </label>

            <label className="block text-sm">
              <span className="mb-2 block text-text-secondary">Foto opcional</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setPhotoFile(file);
                  setPhotoPreview(file ? URL.createObjectURL(file) : profile?.photoUrl || '');
                }}
                className="w-full rounded-2xl border border-dashed border-border-dark bg-bg-dark/80 px-4 py-3.5 text-text-secondary"
              />
            </label>

            <button disabled={loading || slugStatus === 'checking' || slugStatus === 'unavailable'} className="w-full rounded-2xl bg-gradient-primary px-4 py-3.5 font-semibold text-white disabled:opacity-60">
              {loading ? 'Publicando...' : 'Concluir onboarding'}
            </button>
          </form>
        </section>

        <aside className="surface-panel p-7 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-primary">Preview</p>
              <h2 className="mt-3 text-2xl font-bold">Sua nova primeira impressão</h2>
            </div>
            <Sparkles className="h-6 w-6 text-primary" />
          </div>

          <div className="mt-6 rounded-[28px] border border-border-dark bg-bg-dark/75 p-6 text-center">
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" className="mx-auto h-24 w-24 rounded-full object-cover" />
            ) : (
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/15 text-3xl font-bold text-primary">
                {(pageName || 'L').charAt(0).toUpperCase()}
              </div>
            )}
            <h2 className="mt-5 text-3xl font-bold">{pageName || 'Sua página'}</h2>
            <p className="mt-2 text-sm text-text-muted">{previewUrl}</p>
            <p className="mt-4 whitespace-pre-wrap text-sm text-text-secondary">{bio || 'Sua bio opcional aparecerá aqui para dar mais contexto e autoridade à sua página.'}</p>

            <div className="mt-6 grid gap-3 text-left sm:grid-cols-2">
              <div className="surface-card p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-text-muted">Visual</p>
                <p className="mt-2 text-sm text-text-secondary">Cartões modernos, contraste melhorado e leitura confortável.</p>
              </div>
              <div className="surface-card p-4">
                <UserRound className="h-5 w-5 text-primary" />
                <p className="mt-2 text-sm text-text-secondary">Mais confiança para apresentar links, produtos e planos.</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
