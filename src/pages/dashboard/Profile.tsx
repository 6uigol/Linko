import React, { useEffect, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { uploadFile } from '../../lib/app-data';

export default function Profile() {
  const { user, profile } = useAuth();
  const [name, setName] = useState('');
  const [pageName, setPageName] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [accent, setAccent] = useState('#5B5CF6');
  const [background, setBackground] = useState('#0B0F1A');
  const [surface, setSurface] = useState('#111827');
  const [text, setText] = useState('#F9FAFB');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name || '');
    setPageName(profile.pageName || '');
    setBio(profile.bio || '');
    setPhotoUrl(profile.photoUrl || '');
    setAccent(profile.theme?.accent || '#5B5CF6');
    setBackground(profile.theme?.background || '#0B0F1A');
    setSurface(profile.theme?.surface || '#111827');
    setText(profile.theme?.text || '#F9FAFB');
  }, [profile]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !profile?.slug) return;
    setLoading(true);
    setMessage('');

    try {
      const uploadedPhoto = photoFile ? await uploadFile(user.uid, 'avatars', photoFile) : photoUrl;
      const payload = {
        name: name.trim(),
        pageName: pageName.trim(),
        bio: bio.trim(),
        photoUrl: uploadedPhoto,
        theme: { accent, background, surface, text },
      };

      await Promise.all([
        updateDoc(doc(db, 'users', user.uid), payload),
        updateDoc(doc(db, 'pages', profile.slug), payload),
      ]);

      setMessage('Perfil e identidade visual atualizados com sucesso.');
    } catch (err) {
      console.error(err);
      setMessage('Não foi possível salvar suas alterações.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="rounded-3xl border border-border-dark bg-surface p-8 shadow-xl">
        <h1 className="text-3xl font-bold">Perfil, branding e página</h1>
        <p className="mt-2 text-sm text-text-secondary">Edite seus dados públicos e personalize as cores da sua página.</p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            {message && <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3 text-sm text-text-primary">{message}</div>}

            <label className="block text-sm">
              <span className="mb-2 block text-text-secondary">Seu link público</span>
              <input disabled value={profile?.slug ? `${window.location.origin}/${profile.slug}` : ''} className="w-full rounded-xl border border-border-dark bg-bg-dark px-4 py-3 text-text-muted" />
            </label>

            <label className="block text-sm">
              <span className="mb-2 block text-text-secondary">Nome</span>
              <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-xl border border-border-dark bg-bg-dark px-4 py-3 outline-none focus:border-primary" />
            </label>

            <label className="block text-sm">
              <span className="mb-2 block text-text-secondary">Nome da página</span>
              <input value={pageName} onChange={(e) => setPageName(e.target.value)} required className="w-full rounded-xl border border-border-dark bg-bg-dark px-4 py-3 outline-none focus:border-primary" />
            </label>

            <label className="block text-sm">
              <span className="mb-2 block text-text-secondary">Bio</span>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="w-full rounded-xl border border-border-dark bg-bg-dark px-4 py-3 outline-none focus:border-primary" />
            </label>

            <label className="block text-sm">
              <span className="mb-2 block text-text-secondary">Foto</span>
              <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} className="w-full rounded-xl border border-dashed border-border-dark bg-bg-dark px-4 py-3 text-text-secondary" />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ['Cor destaque', accent, setAccent],
                ['Fundo', background, setBackground],
                ['Cartões', surface, setSurface],
                ['Texto', text, setText],
              ].map(([label, value, setter]) => (
                <label key={label} className="block text-sm">
                  <span className="mb-2 block text-text-secondary">{label}</span>
                  <input type="color" value={value as string} onChange={(e) => (setter as React.Dispatch<React.SetStateAction<string>>)(e.target.value)} className="h-12 w-full rounded-xl border border-border-dark bg-bg-dark p-1" />
                </label>
              ))}
            </div>

            <button disabled={loading} className="rounded-xl bg-gradient-primary px-5 py-3 font-semibold text-white disabled:opacity-60">
              {loading ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>

          <div className="rounded-3xl border border-border-dark p-6" style={{ background, color: text }}>
            <p className="text-sm opacity-70">Preview rápido</p>
            <div className="mt-6 rounded-[2rem] p-6" style={{ background: surface }}>
              {photoFile || photoUrl ? (
                <img src={photoFile ? URL.createObjectURL(photoFile) : photoUrl} alt="Preview" className="mx-auto h-20 w-20 rounded-full object-cover" />
              ) : (
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold" style={{ background: accent }}>
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
              <h2 className="mt-4 text-center text-2xl font-bold">{pageName || 'Sua página'}</h2>
              <p className="mt-3 text-center text-sm opacity-80">{bio || 'Sua bio aparecerá aqui.'}</p>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
