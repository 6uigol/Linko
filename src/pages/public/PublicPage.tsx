import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CreditCard, Lock, Package, ShoppingCart, Sparkles } from 'lucide-react';
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

  const accent = page.theme?.accent || '#6D5EF7';
  const background = page.theme?.background || '#07111f';
  const surface = page.theme?.surface || '#0f1729';
  const text = page.theme?.text || '#f8fafc';

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 sm:py-10" style={{ background, color: text }}>
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[0.72fr_0.28fr] lg:items-start">
          <div className="rounded-[32px] border border-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8" style={{ background: surface }}>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                {page.photoUrl ? (
                  <img src={page.photoUrl} alt={page.pageName} className="h-24 w-24 rounded-full object-cover" />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold" style={{ background: accent }}>
                    {page.pageName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-xs uppercase tracking-[0.34em] opacity-60">Página pública</p>
                  <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{page.pageName}</h1>
                  {page.bio && <p className="mt-3 max-w-2xl text-sm opacity-80 sm:text-base">{page.bio}</p>}
                </div>
              </div>
              <div className="rounded-[24px] border border-white/10 px-4 py-4 text-sm" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="flex items-center gap-2 font-semibold" style={{ color: accent }}>
                  <Sparkles className="h-4 w-4" />
                  Oferta profissional
                </div>
                <p className="mt-2 max-w-xs opacity-80">Experiência premium com checkout e opção de pagamento manual para negociações personalizadas.</p>
              </div>
            </div>

            {checkoutError && <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{checkoutError}</div>}

            <div className="mt-8 space-y-4 text-left">
              {blocks.map((block) => {
                const hasAccess = block.productId ? accessProductIds.has(block.productId) : false;
                if (block.type === 'link') {
                  return (
                    <a key={block.id} href={block.url} target="_blank" rel="noreferrer" className="block rounded-[24px] border border-white/10 px-5 py-4 font-semibold transition hover:opacity-90" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      {block.title}
                    </a>
                  );
                }

                if (block.type === 'content' && !hasAccess) {
                  return (
                    <div key={block.id} className="rounded-[24px] border border-white/10 px-5 py-4 opacity-80" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <div className="flex items-center gap-2 font-semibold"><Lock className="h-4 w-4" /> {block.title}</div>
                      <p className="mt-2 text-sm">Compre o produto relacionado para liberar este conteúdo exclusivo.</p>
                    </div>
                  );
                }

                return (
                  <div key={block.id} className="rounded-[24px] border border-white/10 px-5 py-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <p className="font-semibold">{block.title}</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm opacity-85">{block.content}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 text-left">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" style={{ color: accent }} />
                <h2 className="text-2xl font-bold">Produtos</h2>
              </div>
              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                {products.length === 0 ? (
                  <div className="rounded-[24px] border border-white/10 p-4 text-sm opacity-75">Nenhum produto publicado ainda.</div>
                ) : (
                  products.map((product) => {
                    const canAccess = accessProductIds.has(product.id);
                    return (
                      <article key={product.id} className="rounded-[24px] border border-white/10 p-5" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              <h3 className="text-lg font-bold">{product.name}</h3>
                            </div>
                            <p className="mt-2 text-sm opacity-80">{product.description || 'Sem descrição.'}</p>
                          </div>
                          <span className="text-lg font-bold" style={{ color: accent }}>{formatCurrency(product.price)}</span>
                        </div>
                        <div className="mt-5 flex flex-wrap gap-3">
                          {canAccess && product.fileUrl ? (
                            <a href={product.fileUrl} target="_blank" rel="noreferrer" className="rounded-2xl px-4 py-3 text-sm font-semibold text-white" style={{ background: accent }}>
                              Acessar agora
                            </a>
                          ) : (
                            <button onClick={() => void startCheckout(product)} className="rounded-2xl px-4 py-3 text-sm font-semibold text-white" style={{ background: accent }}>
                              Comprar com checkout
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

          <aside className="space-y-6">
            <div className="rounded-[32px] border border-white/10 p-6 shadow-2xl backdrop-blur-xl" style={{ background: surface }}>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl p-3" style={{ background: `${accent}20`, color: accent }}>
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] opacity-60">Pagamento manual</p>
                  <h2 className="mt-1 text-xl font-bold">{page.paymentConfig?.pixOrTransferLabel || 'Conta principal'}</h2>
                </div>
              </div>
              <div className="mt-5 space-y-3 text-sm opacity-85">
                <div className="rounded-2xl border border-white/10 px-4 py-3">Instituição: {page.paymentConfig?.bankName || 'Não configurada'}</div>
                <div className="rounded-2xl border border-white/10 px-4 py-3">Banco: {page.paymentConfig?.institutionCode || '-'}</div>
                <div className="rounded-2xl border border-white/10 px-4 py-3">Agência: {page.paymentConfig?.branch || '-'}</div>
                <div className="rounded-2xl border border-white/10 px-4 py-3">Conta: {page.paymentConfig?.account || '-'}</div>
              </div>
              <p className="mt-4 text-sm opacity-80">{page.paymentConfig?.message || 'Use esta opção para negociações e assinaturas confirmadas manualmente.'}</p>
            </div>

            <div className="rounded-[32px] border border-white/10 p-6 shadow-2xl backdrop-blur-xl" style={{ background: surface }}>
              <p className="text-xs uppercase tracking-[0.28em] opacity-60">Assinatura</p>
              <h2 className="mt-2 text-2xl font-bold">Quer uma oferta contínua?</h2>
              <p className="mt-3 text-sm opacity-80">Apresente seu plano premium, combine um pagamento manual e libere acesso com acompanhamento mais próximo.</p>
              <button className="mt-5 w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white" style={{ background: accent }}>
                Assinar agora
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
