import React, { useEffect, useState } from 'react';
import { Edit2, Package, Plus, Trash2 } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { deleteStorageFile, fetchProducts, formatCurrency, removeProduct, saveProduct, uploadFile, type ProductRecord } from '../../lib/app-data';

const defaultForm = {
  id: '',
  type: 'simple' as ProductRecord['type'],
  name: '',
  description: '',
  price: '',
  imageUrl: '',
  stock: '',
};

export default function Products() {
  const { user, profile } = useAuth();
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [form, setForm] = useState(defaultForm);
  const [digitalFile, setDigitalFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const limitReached = profile?.plan === 'free' && products.length >= 3 && !form.id;

  async function loadProducts() {
    if (!user) return;
    setLoading(true);
    try {
      setProducts(await fetchProducts(user.uid));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts();
  }, [user]);

  const resetForm = () => {
    setForm(defaultForm);
    setDigitalFile(null);
  };

  const editProduct = (product: ProductRecord) => {
    setForm({
      id: product.id,
      type: product.type,
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      imageUrl: product.imageUrl || '',
      stock: product.stock != null ? String(product.stock) : '',
    });
    setDigitalFile(null);
  };

  const submitProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage('');

    try {
      let fileUrl = products.find((product) => product.id === form.id)?.fileUrl || '';
      if (form.type === 'digital' && digitalFile) {
        fileUrl = await uploadFile(user.uid, 'products', digitalFile);
      }

      await saveProduct(user.uid, {
        id: form.id || undefined,
        type: form.type,
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        imageUrl: form.imageUrl.trim(),
        stock: form.type === 'simple' && form.stock ? Number(form.stock) : null,
        fileUrl,
        isActive: true,
      });
      setMessage('Produto salvo com sucesso.');
      resetForm();
      await loadProducts();
    } catch (err) {
      console.error(err);
      setMessage('Não foi possível salvar o produto.');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (product: ProductRecord) => {
    if (!user) return;
    await saveProduct(user.uid, { ...product, isActive: !product.isActive });
    await loadProducts();
  };

  const handleRemove = async (product: ProductRecord) => {
    await removeProduct(product.id);
    if (product.fileUrl) {
      await deleteStorageFile(product.fileUrl);
    }
    await loadProducts();
  };

  return (
    <DashboardLayout>
      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <section className="rounded-3xl border border-border-dark bg-surface p-6 shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">Produtos</h1>
              <p className="mt-2 text-sm text-text-secondary">Cadastre produtos simples ou digitais com upload no Firebase Storage.</p>
            </div>
            <div className="rounded-2xl border border-border-dark px-3 py-2 text-xs text-text-muted">{products.length}/ {profile?.plan === 'free' ? '3' : '∞'} produtos</div>
          </div>

          {message && <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/10 p-3 text-sm">{message}</div>}

          <form onSubmit={submitProduct} className="mt-6 space-y-4 rounded-3xl border border-border-dark bg-bg-dark p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{form.id ? 'Editar produto' : 'Novo produto'}</h2>
              <Plus className="h-4 w-4 text-primary" />
            </div>
            <label className="block text-sm">
              <span className="mb-2 block text-text-secondary">Tipo</span>
              <select value={form.type} onChange={(e) => setForm((current) => ({ ...current, type: e.target.value as ProductRecord['type'] }))} className="w-full rounded-xl border border-border-dark bg-surface px-4 py-3">
                <option value="simple">Produto simples</option>
                <option value="digital">Produto digital</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-2 block text-text-secondary">Nome</span>
              <input value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} required className="w-full rounded-xl border border-border-dark bg-surface px-4 py-3" />
            </label>
            <label className="block text-sm">
              <span className="mb-2 block text-text-secondary">Descrição</span>
              <textarea value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} rows={4} className="w-full rounded-xl border border-border-dark bg-surface px-4 py-3" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-2 block text-text-secondary">Preço</span>
                <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm((current) => ({ ...current, price: e.target.value }))} required className="w-full rounded-xl border border-border-dark bg-surface px-4 py-3" />
              </label>
              <label className="block text-sm">
                <span className="mb-2 block text-text-secondary">Imagem (URL opcional)</span>
                <input type="url" value={form.imageUrl} onChange={(e) => setForm((current) => ({ ...current, imageUrl: e.target.value }))} className="w-full rounded-xl border border-border-dark bg-surface px-4 py-3" />
              </label>
            </div>

            {form.type === 'simple' ? (
              <label className="block text-sm">
                <span className="mb-2 block text-text-secondary">Estoque opcional</span>
                <input type="number" min="0" value={form.stock} onChange={(e) => setForm((current) => ({ ...current, stock: e.target.value }))} className="w-full rounded-xl border border-border-dark bg-surface px-4 py-3" />
              </label>
            ) : (
              <label className="block text-sm">
                <span className="mb-2 block text-text-secondary">Arquivo digital</span>
                <input type="file" onChange={(e) => setDigitalFile(e.target.files?.[0] ?? null)} required={!form.id} className="w-full rounded-xl border border-dashed border-border-dark bg-surface px-4 py-3 text-text-secondary" />
              </label>
            )}

            <div className="flex gap-3">
              <button disabled={saving || limitReached} className="flex-1 rounded-xl bg-gradient-primary px-4 py-3 font-semibold text-white disabled:opacity-60">
                {saving ? 'Salvando...' : 'Salvar produto'}
              </button>
              {form.id && (
                <button type="button" onClick={resetForm} className="rounded-xl border border-border-dark px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-surface">
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-3xl border border-border-dark bg-surface p-6 shadow-xl">
          <h2 className="text-xl font-bold">Catálogo cadastrado</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {loading ? (
              <p className="text-sm text-text-muted">Carregando produtos...</p>
            ) : products.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border-dark p-5 text-sm text-text-muted">Nenhum produto cadastrado ainda.</div>
            ) : (
              products.map((product) => (
                <article key={product.id} className="rounded-3xl border border-border-dark bg-bg-dark p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-text-muted">{product.type}</p>
                      <h3 className="mt-1 text-lg font-bold">{product.name}</h3>
                    </div>
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <p className="mt-3 text-sm text-text-secondary">{product.description || 'Sem descrição informada.'}</p>
                  <p className="mt-4 text-xl font-bold text-primary">{formatCurrency(product.price)}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button onClick={() => editProduct(product)} className="rounded-xl border border-border-dark p-2 hover:bg-surface"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => void toggleStatus(product)} className="rounded-xl border border-border-dark px-3 py-2 text-sm hover:bg-surface">{product.isActive ? 'Inativar' : 'Ativar'}</button>
                    <button onClick={() => void handleRemove(product)} className="rounded-xl border border-error/20 bg-error/10 p-2 text-error"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
