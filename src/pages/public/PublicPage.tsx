import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Lock, Package, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchAccessByEmail, fetchPublicPage, formatCurrency, type AccessRecord, type BlockRecord, type PageRecord, type ProductRecord } from '../../lib/app-data';

export default function PublicPage() {
  const { slug = '' } = useParams();
  const { user } = useAuth();
  const [page, setPage] = useState<PageRecord | null>(null);
  const [blocks, setBlocks] = useState<BlockRecord[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [access, setAccess] = useState<AccessRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkoutError, setCheckoutError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchPublicPage(slug);
        if (!data) {
          setError('Página não encontrada.');
          return;
        }
        setPage(data.page);
        setBlocks(data.blocks);
        setProducts(data.products);
      } catch (err) {
        console.error(err);
        setError('Não foi possível carregar a página.');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [slug]);

  useEffect(() => {
    async function loadAccess() {
      if (!user?.email || !page?.userId) return;
      setAccess(await fetchAccessByEmail(user.email, page.userId));
    }
    void loadAccess();
  }, [page?.userId, user?.email]);

  const accessProductIds = useMemo(() => new Set(access.filter((item) => item.status === 'active').map((item) => item.productId)), [access]);

  const startCheckout = async (product: ProductRecord) => {
    setCheckoutError('');
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          buyerName: user?.displayName || '',
          buyerEmail: user?.email || '',
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar checkout.');
      }
      window.location.href = data.initPoint;
    } catch (err) {
      console.error(err);
      setCheckoutError('Não foi possível iniciar o checkout agora.');
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-bg-dark"><div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" /></div>;
  }

  if (!page || error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg-dark px-6 text-text-primary">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-3 text-text-secondary">{error}</p>
        <Link to="/" className="mt-6 text-primary">Voltar para a home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10" style={{ background: page.theme?.background || '#0B0F1A', color: page.theme?.text || '#F9FAFB' }}>
      <div className="mx-auto max-w-xl">
        <div className="rounded-[2rem] border border-white/10 p-8 text-center shadow-2xl" style={{ background: page.theme?.surface || '#111827' }}>
          {page.photoUrl ? (
            <img src={page.photoUrl} alt={page.pageName} className="mx-auto h-24 w-24 rounded-full object-cover" />
          ) : (
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold" style={{ background: page.theme?.accent || '#5B5CF6' }}>
              {page.pageName.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="mt-5 text-3xl font-bold">{page.pageName}</h1>
          {page.bio && <p className="mt-3 text-sm opacity-80">{page.bio}</p>}

          {checkoutError && <div className="mt-6 rounded-2xl border border-error/20 bg-error/10 p-3 text-sm text-error">{checkoutError}</div>}

          <div className="mt-8 space-y-4 text-left">
            {blocks.map((block) => {
              const hasAccess = block.productId ? accessProductIds.has(block.productId) : false;
              if (block.type === 'link') {
                return (
                  <a key={block.id} href={block.url} target="_blank" rel="noreferrer" className="block rounded-2xl border border-white/10 px-5 py-4 font-semibold hover:opacity-90">
                    {block.title}
                  </a>
                );
              }

              if (block.type === 'content' && !hasAccess) {
                return (
                  <div key={block.id} className="rounded-2xl border border-white/10 px-5 py-4 opacity-80">
                    <div className="flex items-center gap-2 font-semibold"><Lock className="h-4 w-4" /> {block.title}</div>
                    <p className="mt-2 text-sm">Compre o produto relacionado para liberar este conteúdo exclusivo.</p>
                  </div>
                );
              }

              return (
                <div key={block.id} className="rounded-2xl border border-white/10 px-5 py-4">
                  <p className="font-semibold">{block.title}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm opacity-85">{block.content}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-left">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" style={{ color: page.theme?.accent || '#5B5CF6' }} />
              <h2 className="text-xl font-bold">Produtos</h2>
            </div>
            <div className="mt-4 space-y-4">
              {products.length === 0 ? (
                <div className="rounded-2xl border border-white/10 p-4 text-sm opacity-75">Nenhum produto publicado ainda.</div>
              ) : (
                products.map((product) => {
                  const canAccess = accessProductIds.has(product.id);
                  return (
                    <article key={product.id} className="rounded-2xl border border-white/10 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            <h3 className="text-lg font-bold">{product.name}</h3>
                          </div>
                          <p className="mt-2 text-sm opacity-80">{product.description || 'Sem descrição.'}</p>
                        </div>
                        <span className="text-lg font-bold" style={{ color: page.theme?.accent || '#5B5CF6' }}>{formatCurrency(product.price)}</span>
                      </div>
                      <div className="mt-5 flex flex-wrap gap-3">
                        {canAccess && product.fileUrl ? (
                          <a href={product.fileUrl} target="_blank" rel="noreferrer" className="rounded-xl px-4 py-3 text-sm font-semibold text-white" style={{ background: page.theme?.accent || '#5B5CF6' }}>
                            Acessar agora
                          </a>
                        ) : (
                          <button onClick={() => void startCheckout(product)} className="rounded-xl px-4 py-3 text-sm font-semibold text-white" style={{ background: page.theme?.accent || '#5B5CF6' }}>
                            Comprar
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
