import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Eye, Plus, Trash2 } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { fetchBlocks, reorderBlocks, removeBlock, saveBlock, type BlockRecord } from '../../lib/app-data';

const initialForm = {
  type: 'link' as BlockRecord['type'],
  title: '',
  url: '',
  content: '',
  productId: '',
};

export default function Links() {
  const { user, profile } = useAuth();
  const [blocks, setBlocks] = useState<BlockRecord[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const limitReached = profile?.plan === 'free' && blocks.length >= 5;

  async function loadBlocks() {
    if (!user) return;
    setLoading(true);
    try {
      setBlocks(await fetchBlocks(user.uid));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBlocks();
  }, [user]);

  const previewBlocks = useMemo(() => [...blocks].sort((a, b) => a.order - b.order), [blocks]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !profile?.pageId) return;
    if (limitReached) return;
    setSaving(true);
    setMessage('');
    try {
      await saveBlock(user.uid, profile.pageId, {
        ...form,
        isActive: true,
        order: blocks.length,
      });
      setForm(initialForm);
      setMessage('Bloco salvo com sucesso.');
      await loadBlocks();
    } catch (err) {
      console.error(err);
      setMessage('Não foi possível salvar o bloco.');
    } finally {
      setSaving(false);
    }
  };

  const moveBlock = async (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    next.forEach((block, order) => {
      block.order = order;
    });
    setBlocks(next.map((item) => ({ ...item })));
    await reorderBlocks(next);
  };

  const toggleBlock = async (block: BlockRecord) => {
    if (!user || !profile?.pageId) return;
    await saveBlock(user.uid, profile.pageId, { ...block, isActive: !block.isActive });
    await loadBlocks();
  };

  return (
    <DashboardLayout>
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-3xl border border-border-dark bg-surface p-6 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Editor da página</h1>
              <p className="mt-2 text-sm text-text-secondary">Adicione, remova e reordene blocos com preview em tempo real.</p>
            </div>
            <div className="rounded-2xl border border-border-dark px-3 py-2 text-xs text-text-muted">
              {blocks.length}/ {profile?.plan === 'free' ? '5' : '∞'} blocos
            </div>
          </div>

          {message && <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/10 p-3 text-sm">{message}</div>}

          <form onSubmit={handleCreate} className="mt-6 space-y-4 rounded-3xl border border-border-dark bg-bg-dark p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Novo bloco</h2>
              <Plus className="h-4 w-4 text-primary" />
            </div>

            <label className="block text-sm">
              <span className="mb-2 block text-text-secondary">Tipo</span>
              <select value={form.type} onChange={(e) => setForm((current) => ({ ...current, type: e.target.value as BlockRecord['type'] }))} className="w-full rounded-xl border border-border-dark bg-surface px-4 py-3">
                <option value="link">Link</option>
                <option value="text">Texto</option>
                <option value="product">Produto em destaque</option>
                <option value="content">Conteúdo exclusivo</option>
              </select>
            </label>

            <label className="block text-sm">
              <span className="mb-2 block text-text-secondary">Título</span>
              <input value={form.title} onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))} required className="w-full rounded-xl border border-border-dark bg-surface px-4 py-3" />
            </label>

            {form.type === 'link' && (
              <label className="block text-sm">
                <span className="mb-2 block text-text-secondary">URL</span>
                <input type="url" value={form.url} onChange={(e) => setForm((current) => ({ ...current, url: e.target.value }))} required className="w-full rounded-xl border border-border-dark bg-surface px-4 py-3" />
              </label>
            )}

            {(form.type === 'text' || form.type === 'content') && (
              <label className="block text-sm">
                <span className="mb-2 block text-text-secondary">Conteúdo</span>
                <textarea value={form.content} onChange={(e) => setForm((current) => ({ ...current, content: e.target.value }))} rows={4} required className="w-full rounded-xl border border-border-dark bg-surface px-4 py-3" />
              </label>
            )}

            {(form.type === 'product' || form.type === 'content') && (
              <label className="block text-sm">
                <span className="mb-2 block text-text-secondary">ID do produto relacionado</span>
                <input value={form.productId} onChange={(e) => setForm((current) => ({ ...current, productId: e.target.value }))} className="w-full rounded-xl border border-border-dark bg-surface px-4 py-3" placeholder="Opcional para vincular compra/acesso" />
              </label>
            )}

            <button disabled={saving || limitReached} className="w-full rounded-xl bg-gradient-primary px-4 py-3 font-semibold text-white disabled:opacity-60">
              {saving ? 'Salvando...' : 'Adicionar bloco'}
            </button>
          </form>

          <div className="mt-6 space-y-3">
            {loading ? (
              <p className="text-sm text-text-muted">Carregando blocos...</p>
            ) : blocks.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border-dark p-5 text-sm text-text-muted">Nenhum bloco criado ainda.</p>
            ) : (
              blocks.map((block, index) => (
                <div key={block.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border-dark bg-bg-dark p-4">
                  <div className="flex-1">
                    <p className="font-semibold">{block.title}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-text-muted">{block.type}</p>
                  </div>
                  <button onClick={() => void moveBlock(index, -1)} type="button" className="rounded-xl border border-border-dark p-2 hover:bg-surface"><ArrowUp className="h-4 w-4" /></button>
                  <button onClick={() => void moveBlock(index, 1)} type="button" className="rounded-xl border border-border-dark p-2 hover:bg-surface"><ArrowDown className="h-4 w-4" /></button>
                  <button onClick={() => void toggleBlock(block)} type="button" className="rounded-xl border border-border-dark px-3 py-2 text-sm hover:bg-surface">{block.isActive ? 'Ocultar' : 'Ativar'}</button>
                  <button onClick={() => void removeBlock(block.id).then(loadBlocks)} type="button" className="rounded-xl border border-error/20 bg-error/10 p-2 text-error"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-border-dark bg-surface p-6 shadow-xl">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Preview em tempo real</h2>
          </div>
          <div className="mt-6 rounded-[2rem] border border-border-dark bg-bg-dark p-6">
            <div className="mx-auto max-w-md space-y-4">
              {previewBlocks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border-dark p-6 text-center text-sm text-text-muted">Seu preview aparecerá aqui.</div>
              ) : (
                previewBlocks.filter((block) => block.isActive).map((block) => (
                  <div key={block.id} className="rounded-2xl border border-border-dark bg-surface p-4">
                    <p className="font-semibold">{block.title}</p>
                    {block.type === 'link' && <p className="mt-2 text-sm text-primary">{block.url}</p>}
                    {block.type !== 'link' && <p className="mt-2 whitespace-pre-wrap text-sm text-text-secondary">{block.content || 'Conteúdo do bloco.'}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
