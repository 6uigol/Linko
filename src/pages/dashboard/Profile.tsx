import React, { useEffect, useMemo, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { CreditCard, MoonStar, Palette, Sparkles } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { DEFAULT_PAYMENT_CONFIG, DEFAULT_THEME, uploadFile, type AppearanceMode } from '../../lib/app-data';

export default function Profile() {
  const { user, profile } = useAuth();
  const [name, setName] = useState('');
  const [pageName, setPageName] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [accent, setAccent] = useState(DEFAULT_THEME.accent);
  const [background, setBackground] = useState(DEFAULT_THEME.background);
  const [surface, setSurface] = useState(DEFAULT_THEME.surface);
  const [text, setText] = useState(DEFAULT_THEME.text);
  const [appearance, setAppearance] = useState<AppearanceMode>('system');
  const [paymentLabel, setPaymentLabel] = useState(DEFAULT_PAYMENT_CONFIG.pixOrTransferLabel);
  const [bankName, setBankName] = useState(DEFAULT_PAYMENT_CONFIG.bankName);
  const [institutionCode, setInstitutionCode] = useState(DEFAULT_PAYMENT_CONFIG.institutionCode);
  const [branch, setBranch] = useState(DEFAULT_PAYMENT_CONFIG.branch);
  const [account, setAccount] = useState(DEFAULT_PAYMENT_CONFIG.account);
  const [holder, setHolder] = useState(DEFAULT_PAYMENT_CONFIG.holder);
  const [paymentMessage, setPaymentMessage] = useState(DEFAULT_PAYMENT_CONFIG.message);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name || '');
    setPageName(profile.pageName || '');
    setBio(profile.bio || '');
    setPhotoUrl(profile.photoUrl || '');
    setAccent(profile.theme?.accent || DEFAULT_THEME.accent);
    setBackground(profile.theme?.background || DEFAULT_THEME.background);
    setSurface(profile.theme?.surface || DEFAULT_THEME.surface);
    setText(profile.theme?.text || DEFAULT_THEME.text);
    setAppearance(profile.appearance || 'system');
    setPaymentLabel(profile.paymentConfig?.pixOrTransferLabel || DEFAULT_PAYMENT_CONFIG.pixOrTransferLabel);
    setBankName(profile.paymentConfig?.bankName || DEFAULT_PAYMENT_CONFIG.bankName);
    setInstitutionCode(profile.paymentConfig?.institutionCode || DEFAULT_PAYMENT_CONFIG.institutionCode);
    setBranch(profile.paymentConfig?.branch || DEFAULT_PAYMENT_CONFIG.branch);
    setAccount(profile.paymentConfig?.account || DEFAULT_PAYMENT_CONFIG.account);
    setHolder(profile.paymentConfig?.holder || DEFAULT_PAYMENT_CONFIG.holder);
    setPaymentMessage(profile.paymentConfig?.message || DEFAULT_PAYMENT_CONFIG.message);
  }, [profile]);

  const previewPhoto = useMemo(() => (photoFile ? URL.createObjectURL(photoFile) : photoUrl), [photoFile, photoUrl]);

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
        appearance,
        theme: { accent, background, surface, text },
        paymentConfig: {
          pixOrTransferLabel: paymentLabel.trim(),
          bankName: bankName.trim(),
          institutionCode: institutionCode.trim(),
          branch: branch.trim(),
          account: account.trim(),
          holder: holder.trim(),
          message: paymentMessage.trim(),
        },
      };

      await Promise.all([
        updateDoc(doc(db, 'users', user.uid), payload),
        updateDoc(doc(db, 'pages', profile.slug), payload),
      ]);

      setMessage('Perfil, tema e recebimento atualizados com sucesso.');
    } catch (err) {
      console.error(err);
      setMessage('Não foi possível salvar suas alterações.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <section className="surface-panel p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.34em] text-primary">Perfil e operação</p>
          <h1 className="mt-3 text-4xl font-bold">Deixe sua experiência incrível e o recebimento pronto para fechar vendas.</h1>
          <p className="mt-3 text-sm text-text-secondary">Edite seus dados públicos, escolha light/dark/sistema, refine a identidade visual e ajuste a conta principal de recebimento manual.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            {message && <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3 text-sm text-text-primary">{message}</div>}

            <div className="grid gap-8 xl:grid-cols-2">
              <div className="space-y-5">
                <div>
                  <div className="mb-3 flex items-center gap-3">
                    <Palette className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Dados públicos</h2>
                  </div>

                  <label className="block text-sm">
                    <span className="mb-2 block text-text-secondary">Seu link público</span>
                    <input disabled value={profile?.slug ? `${window.location.origin}/${profile.slug}` : ''} className="w-full rounded-2xl border border-border-dark bg-bg-dark/70 px-4 py-3.5 text-text-muted" />
                  </label>
                </div>

                <label className="block text-sm">
                  <span className="mb-2 block text-text-secondary">Nome</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-2xl border border-border-dark bg-bg-dark/70 px-4 py-3.5 outline-none focus:border-primary" />
                </label>

                <label className="block text-sm">
                  <span className="mb-2 block text-text-secondary">Nome da página</span>
                  <input value={pageName} onChange={(e) => setPageName(e.target.value)} required className="w-full rounded-2xl border border-border-dark bg-bg-dark/70 px-4 py-3.5 outline-none focus:border-primary" />
                </label>

                <label className="block text-sm">
                  <span className="mb-2 block text-text-secondary">Bio</span>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="w-full rounded-2xl border border-border-dark bg-bg-dark/70 px-4 py-3.5 outline-none focus:border-primary" />
                </label>

                <label className="block text-sm">
                  <span className="mb-2 block text-text-secondary">Foto</span>
                  <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} className="w-full rounded-2xl border border-dashed border-border-dark bg-bg-dark/70 px-4 py-3.5 text-text-secondary" />
                </label>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="mb-3 flex items-center gap-3">
                    <MoonStar className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Tema e aparência</h2>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { value: 'light', label: 'Light' },
                      { value: 'dark', label: 'Dark' },
                      { value: 'system', label: 'Sistema' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setAppearance(option.value as AppearanceMode)}
                        className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${appearance === option.value ? 'border-primary bg-primary/12 text-primary' : 'border-border-dark bg-bg-dark/70 text-text-secondary hover:bg-card'}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    ['Cor destaque', accent, setAccent],
                    ['Fundo', background, setBackground],
                    ['Cartões', surface, setSurface],
                    ['Texto', text, setText],
                  ].map(([label, value, setter]) => (
                    <label key={label} className="block text-sm">
                      <span className="mb-2 block text-text-secondary">{label}</span>
                      <input type="color" value={value as string} onChange={(e) => (setter as React.Dispatch<React.SetStateAction<string>>)(e.target.value)} className="h-14 w-full rounded-2xl border border-border-dark bg-bg-dark/70 p-1" />
                    </label>
                  ))}
                </div>

                <div className="rounded-[28px] border border-border-dark bg-bg-dark/70 p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Pagamento manual</h2>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm sm:col-span-2">
                      <span className="mb-2 block text-text-secondary">Rótulo</span>
                      <input value={paymentLabel} onChange={(e) => setPaymentLabel(e.target.value)} className="w-full rounded-2xl border border-border-dark bg-surface px-4 py-3.5" />
                    </label>
                    <label className="block text-sm sm:col-span-2">
                      <span className="mb-2 block text-text-secondary">Instituição</span>
                      <input value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full rounded-2xl border border-border-dark bg-surface px-4 py-3.5" />
                    </label>
                    <label className="block text-sm">
                      <span className="mb-2 block text-text-secondary">Código do banco</span>
                      <input value={institutionCode} onChange={(e) => setInstitutionCode(e.target.value)} className="w-full rounded-2xl border border-border-dark bg-surface px-4 py-3.5" />
                    </label>
                    <label className="block text-sm">
                      <span className="mb-2 block text-text-secondary">Agência</span>
                      <input value={branch} onChange={(e) => setBranch(e.target.value)} className="w-full rounded-2xl border border-border-dark bg-surface px-4 py-3.5" />
                    </label>
                    <label className="block text-sm">
                      <span className="mb-2 block text-text-secondary">Conta</span>
                      <input value={account} onChange={(e) => setAccount(e.target.value)} className="w-full rounded-2xl border border-border-dark bg-surface px-4 py-3.5" />
                    </label>
                    <label className="block text-sm">
                      <span className="mb-2 block text-text-secondary">Titular</span>
                      <input value={holder} onChange={(e) => setHolder(e.target.value)} className="w-full rounded-2xl border border-border-dark bg-surface px-4 py-3.5" />
                    </label>
                    <label className="block text-sm sm:col-span-2">
                      <span className="mb-2 block text-text-secondary">Mensagem para o cliente</span>
                      <textarea value={paymentMessage} onChange={(e) => setPaymentMessage(e.target.value)} rows={3} className="w-full rounded-2xl border border-border-dark bg-surface px-4 py-3.5" />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <button disabled={loading} className="rounded-2xl bg-gradient-primary px-5 py-3.5 font-semibold text-white disabled:opacity-60">
              {loading ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </form>
        </section>

        <aside className="space-y-6">
          <div className="surface-panel p-6" style={{ background, color: text }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70">Preview rápido</p>
                <h2 className="mt-2 text-2xl font-bold">Como sua página aparece</h2>
              </div>
              <Sparkles className="h-5 w-5" style={{ color: accent }} />
            </div>
            <div className="mt-6 rounded-[28px] p-6 shadow-2xl" style={{ background: surface }}>
              {previewPhoto ? (
                <img src={previewPhoto} alt="Preview" className="mx-auto h-20 w-20 rounded-full object-cover" />
              ) : (
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold" style={{ background: accent }}>
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
              <h3 className="mt-4 text-center text-2xl font-bold">{pageName || 'Sua página'}</h3>
              <p className="mt-3 text-center text-sm opacity-80">{bio || 'Sua bio aparecerá aqui.'}</p>
              <button className="mt-6 w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white" style={{ background: accent }}>
                Assinar agora
              </button>
            </div>
          </div>

          <div className="surface-panel p-6">
            <h2 className="text-2xl font-bold">Incentivo para assinatura</h2>
            <p className="mt-3 text-sm text-text-secondary">Use a conta configurada para fechar upgrades e assinaturas de forma consultiva, enquanto mantém o checkout principal para fluxo automático.</p>
            <div className="mt-5 space-y-3">
              {[
                'CTA de assinatura em destaque',
                'Preferência visual salva por login',
                'Conta de recebimento manual pronta',
                'Mais confiança na experiência pública',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-border-dark bg-card/70 px-4 py-3 text-sm text-text-secondary">{item}</div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}
